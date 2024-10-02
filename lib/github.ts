"use server";

import { auth } from "@clerk/nextjs/server";
import { Octokit } from "@octokit/rest";
import {
  getUserByClerkId,
  updateUserGithubToken,
  createUser,
  saveConnectedRepo,
  getConnectedRepos,
  isRepoConnected,
  getProjectSettings,
  upsertProjectSettings,
} from "./db/queries";
import { TestFile, Project, PullRequest, ConnectedRepository, NewConnectedRepository } from "../app/(dashboard)/dashboard/types";

async function getOctokit() {
  const { userId } = auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  let user = await getUserByClerkId(userId);

  if (!user) {
    user = await createUser(userId);
  }

  if (!user.githubAccessToken) {
    throw new Error("GitHub access token not found");
  }

  return new Octokit({ auth: user.githubAccessToken });
}

export async function exchangeCodeForAccessToken(
  code: string
): Promise<string> {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/github/callback`,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to exchange code for access token: ${
        errorData.error_description || response.statusText
      }`
    );
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(
      `GitHub OAuth error: ${data.error_description || data.error}`
    );
  }

  if (!data.access_token) {
    throw new Error("Access token not found in GitHub response");
  }

  return data.access_token;
}

export async function saveGitHubAccessToken(accessToken: string) {
  const { userId } = auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  await updateUserGithubToken(userId, accessToken);
}

export async function getAssignedPullRequests() {
  try {
    const octokit = await getOctokit();

    const { data } = await octokit.rest.search.issuesAndPullRequests({
      q: "is:pr is:open assignee:@me",
      sort: "updated",
      order: "desc",
      per_page: 100,
    });

    const pullRequests = await Promise.all(
      data.items.map(async (pr) => {
        const [owner, repo] = pr.repository_url.split("/").slice(-2);

        const { data: pullRequestData } = await octokit.pulls.get({
          owner,
          repo,
          pull_number: pr.number,
        });

        const branchName = pullRequestData.head.ref;

        const buildStatus = await fetchBuildStatus(
          octokit,
          owner,
          repo,
          branchName
        );

        return {
          id: pr.id,
          repoId: pr.repository_url,
          githubId: pr.id,
          number: pr.number,
          title: pr.title,
          state: pr.state,
          createdAt: new Date(pr.created_at),
          updatedAt: new Date(pr.updated_at),
          buildStatus,
          isDraft: pr.draft || false,
          owner,
          repo,
          branchName,
        };
      })
    );

    return pullRequests;
  } catch (error) {
    console.error("Error fetching assigned pull requests:", error);
    return { error: "Failed to fetch assigned GitHub pull requests" };
  }
}

async function fetchBuildStatus(
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string
): Promise<string> {
  try {
    const { data } = await octokit.rest.checks.listForRef({
      owner,
      repo,
      ref,
    });

    if (data.check_runs.length === 0) {
      return "pending";
    }

    const statuses = data.check_runs.map((run) => run.conclusion);
    if (statuses.every((status) => status === "success")) {
      return "success";
    } else if (statuses.some((status) => status === "failure")) {
      return "failure";
    } else {
      return "pending";
    }
  } catch (error) {
    console.error("Error fetching build status:", error);
    return "unknown";
  }
}

export async function commitChangesToPullRequest(
  owner: string,
  repo: string,
  pullNumber: number,
  filesToCommit: TestFile[]
): Promise<string> {
  const octokit = await getOctokit();

  try {
    const { data: pr } = await octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
    });

    const { data: ref } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${pr.head.ref}`,
    });

    const { data: commit } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: ref.object.sha,
    });

    const { data: currentTree } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: commit.tree.sha,
      recursive: "true",
    });

    const updatedTree = currentTree.tree.map((item) => ({
      path: item.path,
      mode: item.mode,
      type: item.type,
      sha: item.sha,
    }));

    for (const file of filesToCommit) {
      const { data: blob } = await octokit.git.createBlob({
        owner,
        repo,
        content: file.content,
        encoding: "utf-8",
      });

      const existingFileIndex = updatedTree.findIndex(
        (item) => item.path === file.name
      );
      if (existingFileIndex !== -1) {
        updatedTree[existingFileIndex] = {
          path: file.name,
          mode: "100644",
          type: "blob",
          sha: blob.sha,
        };
      } else {
        updatedTree.push({
          path: file.name,
          mode: "100644",
          type: "blob",
          sha: blob.sha,
        });
      }
    }

    const { data: newTree } = await octokit.git.createTree({
      owner,
      repo,
      tree: updatedTree as any,
      base_tree: commit.tree.sha,
    });

    const { data: newCommit } = await octokit.git.createCommit({
      owner,
      repo,
      message: "Update test files",
      tree: newTree.sha,
      parents: [commit.sha],
    });

    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${pr.head.ref}`,
      sha: newCommit.sha,
    });

    return `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`;
  } catch (error) {
    console.error("Error committing changes to pull request:", error);
    throw error;
  }
}

export async function getPullRequestInfo(
  owner: string,
  repo: string,
  pullNumber: number
) {
  const octokit = await getOctokit();

  try {
    const [diffResponse, repoContentsResponse] = await Promise.all([
      octokit.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
        mediaType: { format: "diff" },
      }),
      octokit.rest.repos.getContent({
        owner,
        repo,
        path: "",
      }),
    ]);

    const testFiles = [];
    const queue = repoContentsResponse.data as { path: string; type: string }[];

    while (queue.length > 0) {
      const item = queue.shift();
      if (item && item.type === "dir") {
        const dirContents = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: item.path,
        });
        queue.push(...(dirContents.data as { path: string; type: string }[]));
      } else if (
        item &&
        item.type === "file" &&
        item.path.toLowerCase().includes(".test.")
      ) {
        const fileContent = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: item.path,
        });

        if (
          "content" in fileContent.data &&
          typeof fileContent.data.content === "string"
        ) {
          const decodedContent = Buffer.from(
            fileContent.data.content,
            "base64"
          ).toString("utf-8");
          testFiles.push({
            name: item.path,
            content: decodedContent,
          });
        }
      }
    }

    return {
      diff: diffResponse.data, // This should be a string
      testFiles,
    };
  } catch (error) {
    console.error("Error fetching PR info:", error);
    throw new Error("Failed to fetch PR info");
  }
}

export async function getConnectedProjects(): Promise<Project[]> {
  const { userId } = auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await getUserByClerkId(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const connectedRepos = await getConnectedRepos(user.id);
  return connectedRepos.map(repoToProject);
}

export async function connectNewRepo() {
  try {
    // Replace these with your actual GitHub App details
    const GITHUB_APP_ID = process.env.APP_ID;
    const GITHUB_APP_NAME = process.env.GITHUB_APP_NAME;

    if (!GITHUB_APP_ID || !GITHUB_APP_NAME) {
      throw new Error("GitHub App ID or name is not set in environment variables");
    }

    // Construct the GitHub App installation URL
    const installationUrl = `https://github.com/apps/${GITHUB_APP_NAME}/installations/new`;

    // Redirect the user to the GitHub App installation page
    window.location.href = installationUrl;
  } catch (error) {
    console.error("Error connecting new repo:", error);
    throw new Error("Failed to connect new repository");
  }
}

export async function getProjectPullRequests(projectId: number): Promise<PullRequest[]> {
  const octokit = await getOctokit();

  try {
    // Use a custom request to get repository information by ID
    const { data: repo } = await octokit.request('GET /repositories/{repository_id}', {
      repository_id: projectId
    });

    const { data: pullRequests } = await octokit.pulls.list({
      owner: repo.owner.login,
      repo: repo.name,
      state: "open",
      sort: "updated",
      direction: "desc",
    });

    return Promise.all(
      pullRequests.map(async (pr) => {
        const buildStatus = await fetchBuildStatus(
          octokit,
          repo.owner.login,
          repo.name,
          pr.head.ref
        );

        return {
          id: pr.id,
          title: pr.title,
          number: pr.number,
          buildStatus,
          isDraft: pr.draft || false,
          branchName: pr.head.ref,
          repository: {
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            owner: {
              login: repo.owner.login,
            },
          },
        };
      })
    );
  } catch (error) {
    console.error("Error fetching project pull requests:", error);
    throw new Error("Failed to fetch project pull requests");
  }
}

export async function getRecentRepositories(): Promise<Project[]> {
  const octokit = await getOctokit();

  try {
    const { data } = await octokit.repos.listForAuthenticatedUser({
      sort: "pushed",
      direction: "desc",
      per_page: 10,
    });

    return Promise.all(data.map(async (repo) => {
      const { data: commits } = await octokit.repos.listCommits({
        owner: repo.owner.login,
        repo: repo.name,
        per_page: 1,
      });

      return {
        id: repo.id,
        name: repo.name,
        owner: repo.owner.login,
        defaultBranch: repo.default_branch,
        lastCommitDate: commits[0]?.commit.committer?.date || repo.pushed_at || null,
        lastCommitMessage: commits[0]?.commit.message || "",
        environments: [], // Changed from {} to []
      };
    }));
  } catch (error) {
    console.error("Error fetching recent repositories:", error);
    throw new Error("Failed to fetch recent repositories");
  }
}

export async function searchRepositories(searchTerm: string): Promise<Project[]> {
  const octokit = await getOctokit();

  try {
    const { data } = await octokit.search.repos({
      q: `${searchTerm} user:${(await octokit.users.getAuthenticated()).data.login}`,
      sort: "updated",
      order: "desc",
      per_page: 10,
    });

    return Promise.all(data.items.map(async (repo) => {
      const { data: commits } = await octokit.repos.listCommits({
        owner: repo.owner?.login || "",
        repo: repo.name,
        per_page: 1,
      });

      return {
        id: repo.id,
        name: repo.name,
        owner: repo.owner?.login || "",
        defaultBranch: repo.default_branch,
        lastCommitDate: commits[0]?.commit.committer?.date || repo.pushed_at || null,
        lastCommitMessage: commits[0]?.commit.message || "",
        environments: [], // Add this line
      };
    }));
  } catch (error) {
    console.error("Error searching repositories:", error);
    throw new Error("Failed to search repositories");
  }
}

export async function connectRepository(repoId: number): Promise<void> {
  const octokit = await getOctokit();
  const { userId } = auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await getUserByClerkId(userId);
  if (!user) {
    throw new Error("User not found");
  }

  try {
    const { data: repo } = await octokit.request('GET /repositories/{repository_id}', {
      repository_id: repoId
    });

    const isAlreadyConnected = await isRepoConnected(user.id, repoId);
    if (isAlreadyConnected) {
      console.log(`Repository ${repo.full_name} is already connected`);
      return;
    }

    const newRepo: NewConnectedRepository = {
      userId: user.id,
      repoId: repo.id,
      name: repo.name,
      owner: repo.owner.login,
      defaultBranch: repo.default_branch,
      lastCommitDate: repo.pushed_at ? new Date(repo.pushed_at) : null,
      lastCommitMessage: "",  // You might want to fetch this separately
    };

    await saveConnectedRepo(user.id, newRepo);
    console.log(`Connected repository: ${repo.full_name}`);
  } catch (error) {
    console.error("Error connecting repository:", error);
    throw new Error("Failed to connect repository");
  }
}

function repoToProject(repo: ConnectedRepository): Project {
  return {
    id: repo.repoId,
    name: repo.name,
    owner: repo.owner,
    defaultBranch: repo.defaultBranch,
    lastCommitDate: repo.lastCommitDate?.toISOString() || null,
    lastCommitMessage: repo.lastCommitMessage || "",
    environments: [], // Add this line
  };
}

export async function getProjectDetails(projectId: number): Promise<Project> {
  const octokit = await getOctokit();
  const { userId } = auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await getUserByClerkId(userId);
  if (!user) {
    throw new Error("User not found");
  }

  try {
    const { data: repo } = await octokit.request('GET /repositories/{repository_id}', {
      repository_id: projectId
    });

    const settings = await getProjectSettings(user.id, projectId);

    return {
      id: repo.id,
      name: repo.name,
      owner: repo.owner.login,
      defaultBranch: repo.default_branch,
      lastCommitDate: repo.pushed_at || null,
      lastCommitMessage: "", // You might want to fetch this separately
      environments: Array.isArray(settings?.environments) ? settings.environments : []
    };
  } catch (error) {
    console.error("Error fetching project details:", error);
    throw new Error("Failed to fetch project details");
  }
}

export async function updateProjectSettings(projectId: number, projectData: Project): Promise<void> {
  const { userId } = auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await getUserByClerkId(userId);
  if (!user) {
    throw new Error("User not found");
  }

  try {
    await upsertProjectSettings(user.id, projectId, projectData.environments);
    console.log("Project settings updated successfully");
  } catch (error) {
    console.error("Error updating project settings:", error);
    throw new Error("Failed to update project settings");
  }
}