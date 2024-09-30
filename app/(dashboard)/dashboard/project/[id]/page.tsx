"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { PullRequestItem } from "../../pull-request";
import { PullRequest } from "../../types";
import { getProjectPullRequests } from "@/lib/github";

export default function ProjectPage() {
  const { id } = useParams();
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPullRequests = async () => {
      try {
        const data = await getProjectPullRequests(Number(id));
        setPullRequests(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching pull requests:", error);
        setError("Failed to fetch pull requests. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPullRequests();
  }, [id]);

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
      <h1 className="text-2xl font-bold">Pull Requests</h1>
      {pullRequests.length > 0 ? (
        <ul className="space-y-8">
          {pullRequests.map((pr) => (
            <li key={pr.id}>
              <PullRequestItem pullRequest={pr} />
            </li>
          ))}
        </ul>
      ) : (
        <p>No pull requests found for this project.</p>
      )}
    </div>
  );
}