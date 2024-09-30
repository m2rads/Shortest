import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "./types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/dashboard/project/${project.id}`}>
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Owner: {project.owner}</p>
          <p className="text-sm text-gray-500">Branch: {project.defaultBranch}</p>
          <p className="text-sm text-gray-500">Last commit: {project.lastCommitDate}</p>
          <p className="text-sm text-gray-500 truncate">{project.lastCommitMessage}</p>
        </CardContent>
      </Card>
    </Link>
  );
}