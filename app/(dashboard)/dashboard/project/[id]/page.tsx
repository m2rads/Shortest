"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2, AlertCircle, Plus } from "lucide-react";
import { PullRequestItem } from "../../pull-request";
import { Project, PullRequest, Environment } from "../../types";
import { getProjectPullRequests, getProjectDetails, updateProjectSettings } from "@/lib/github";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ProjectPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("open-prs");
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const [prData, projectData] = await Promise.all([
        getProjectPullRequests(Number(id)),
        getProjectDetails(Number(id))
      ]);
      setPullRequests(prData);
      setProject(projectData);
      setError(null);
    } catch (error) {
      console.error("Error fetching project data:", error);
      setError("Failed to fetch project data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEnvironment = () => {
    if (project) {
      setProject({
        ...project,
        environments: [
          ...project.environments,
          { name: "", url: "", testAccounts: [] }
        ]
      });
    }
  };

  const handleUpdateEnvironment = (index: number, field: keyof Environment, value: string) => {
    if (project) {
      const updatedEnvironments = [...project.environments];
      updatedEnvironments[index] = { ...updatedEnvironments[index], [field]: value };
      setProject({ ...project, environments: updatedEnvironments });
    }
  };

  const handleAddTestAccount = (envIndex: number) => {
    if (project) {
      const updatedEnvironments = [...project.environments];
      updatedEnvironments[envIndex].testAccounts.push({ username: "", password: "" });
      setProject({ ...project, environments: updatedEnvironments });
    }
  };

  const handleUpdateTestAccount = (envIndex: number, accountIndex: number, field: "username" | "password", value: string) => {
    if (project) {
      const updatedEnvironments = [...project.environments];
      updatedEnvironments[envIndex].testAccounts[accountIndex][field] = value;
      setProject({ ...project, environments: updatedEnvironments });
    }
  };

  const handleSaveSettings = async () => {
    if (project) {
      try {
        await updateProjectSettings(project.id, project);
        toast({
          title: "Settings saved",
          description: "Project settings have been updated successfully.",
        });
      } catch (error) {
        console.error("Error saving project settings:", error);
        toast({
          title: "Error",
          description: "Failed to save project settings. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-lg mb-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{project?.name}</h1>
      <nav className="flex space-x-4 border-b pb-2">
        <button 
          className={`px-3 py-2 rounded-md ${activeTab === 'open-prs' ? 'bg-gray-200 font-semibold' : ''}`}
          onClick={() => setActiveTab('open-prs')}
        >
          Open PRs
        </button>
        <button 
          className={`px-3 py-2 rounded-md ${activeTab === 'settings' ? 'bg-gray-200 font-semibold' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Project Settings
        </button>
      </nav>
      {activeTab === 'open-prs' && (
        <div>
          {pullRequests.length > 0 ? (
            <ul className="space-y-8">
              {pullRequests.map((pr) => (
                <li key={pr.id}>
                  <PullRequestItem pullRequest={pr} />
                </li>
              ))}
            </ul>
          ) : (
            <p>No open pull requests found for this project.</p>
          )}
        </div>
      )}
      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Project Environments</CardTitle>
            <CardDescription>Manage your project's environments and test accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {project?.environments.map((env, envIndex) => (
              <div key={envIndex} className="mb-6 p-4 border rounded-lg">
                <Input
                  className="mb-2"
                  placeholder="Environment Name"
                  value={env.name}
                  onChange={(e) => handleUpdateEnvironment(envIndex, "name", e.target.value)}
                />
                <Input
                  className="mb-2"
                  placeholder="Environment URL"
                  value={env.url}
                  onChange={(e) => handleUpdateEnvironment(envIndex, "url", e.target.value)}
                />
                <h4 className="font-semibold mt-4 mb-2">Test Accounts</h4>
                {env.testAccounts.map((account, accountIndex) => (
                  <div key={accountIndex} className="flex space-x-2 mb-2">
                    <Input
                      placeholder="Username"
                      value={account.username}
                      onChange={(e) => handleUpdateTestAccount(envIndex, accountIndex, "username", e.target.value)}
                    />
                    <Input
                      placeholder="Password"
                      type="password"
                      value={account.password}
                      onChange={(e) => handleUpdateTestAccount(envIndex, accountIndex, "password", e.target.value)}
                    />
                  </div>
                ))}
                <Button onClick={() => handleAddTestAccount(envIndex)} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" /> Add Test Account
                </Button>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handleAddEnvironment} variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Add Environment
            </Button>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}