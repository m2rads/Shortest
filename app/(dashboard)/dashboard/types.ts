export interface PullRequest {
  id: number;
  title: string;
  number: number;
  buildStatus: string;
  isDraft: boolean;
  branchName: string;
  repository: {
    id: number;
    name: string;
    full_name: string;
    owner: {
      login: string;
    };
  };
}

export interface TestFile {
  name: string;
  content: string;
  oldContent?: string;
}

export interface Project {
  id: number;
  name: string;
  owner: string;
  defaultBranch: string;
  lastCommitDate: string | null;
  lastCommitMessage: string;
  environments: Environment[];
}

export interface ConnectedRepository {
  id: number;
  userId: number;
  repoId: number;
  name: string;
  owner: string;
  defaultBranch: string;
  lastCommitDate: Date | null;
  lastCommitMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewConnectedRepository {
  userId: number;
  repoId: number;
  name: string;
  owner: string;
  defaultBranch: string;
  lastCommitDate: Date | null;
  lastCommitMessage: string | null;
}

export interface Environment {
  name: string;
  url: string;
  testAccounts: TestAccount[];
}

export interface TestAccount {
  username: string;
  password: string;
}
