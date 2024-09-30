import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Project } from "./types";
import { searchRepositories, connectRepository, getRecentRepositories } from "@/lib/github";
import { formatDistanceToNow } from 'date-fns';

interface RepoSelectorProps {
  onRepoSelected: (project: Project) => void;
  onClose: () => void;
}

export function RepoSelector({ onRepoSelected, onClose }: RepoSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Project[]>([]);
  const [recentRepos, setRecentRepos] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecentRepos();
  }, []);

  const fetchRecentRepos = async () => {
    try {
      const repos = await getRecentRepositories();
      setRecentRepos(repos);
    } catch (error) {
      console.error("Error fetching recent repositories:", error);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (!term) {
      setSearchResults(recentRepos);
      return;
    }
    setLoading(true);
    try {
      const results = await searchRepositories(term);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching repositories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRepoConnect = async (repo: Project) => {
    try {
      await connectRepository(repo.id);
      onRepoSelected(repo);
    } catch (error) {
      console.error("Error connecting repository:", error);
    }
  };

  const renderRepoItem = (repo: Project) => (
    <li key={repo.id} className="py-2 border-b last:border-b-0 flex items-center justify-between">
      <div>
        <span className="font-medium">{repo.name}</span>
        <span className="text-sm text-gray-500 ml-2">
          ({repo.lastCommitDate 
            ? formatDistanceToNow(new Date(repo.lastCommitDate), { addSuffix: true })
            : 'No recent commits'})
        </span>
      </div>
      <Button onClick={() => handleRepoConnect(repo)} size="sm">
        Connect
      </Button>
    </li>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Repository</h2>
        <Input
          type="text"
          placeholder="Search repositories..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="mb-4"
        />
        {loading && <p>Searching...</p>}
        <ul className="max-h-60 overflow-y-auto">
          {(searchTerm ? searchResults : recentRepos).map(renderRepoItem)}
        </ul>
        <Button onClick={onClose} className="mt-4">
          Cancel
        </Button>
      </div>
    </div>
  );
}