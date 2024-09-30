"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Plus } from "lucide-react";
import { ProjectCard } from "./project-card";
import { Project } from "./types";
import { getConnectedProjects } from "@/lib/github";
import { useToast } from "@/hooks/use-toast";
import { RepoSelector } from "./repo-selector";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRepoSelector, setShowRepoSelector] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getConnectedProjects();
      setProjects(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("Failed to fetch connected projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewRepo = () => {
    setShowRepoSelector(true);
  };

  const handleRepoSelected = (newProject: Project) => {
    setProjects((prevProjects) => [...prevProjects, newProject]);
    setShowRepoSelector(false);
    toast({
      title: "Success",
      description: "New repository connected successfully.",
    });
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Connected Projects</h1>
        <Button onClick={handleAddNewRepo} className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add New Repository
        </Button>
      </div>
      {showRepoSelector && (
        <RepoSelector onRepoSelected={handleRepoSelected} onClose={() => setShowRepoSelector(false)} />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
