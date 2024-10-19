import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardPage from './page';
import { useToast } from '@/hooks/use-toast';
import { getConnectedProjects } from '@/lib/github';

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

vi.mock('@/lib/github', () => ({
  getConnectedProjects: vi.fn(),
}));

vi.mock('./project-card', () => ({
  ProjectCard: ({ project }) => <div data-testid={`project-card-${project.id}`}>{project.name}</div>,
}));

vi.mock('./repo-selector', () => ({
  RepoSelector: ({ onRepoSelected, onClose }) => (
    <div data-testid='repo-selector'>
      <button onClick={() => onRepoSelected({ id: 999, name: 'New Repo' })}>Select Repo</button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe('DashboardPage', () => {
  it('renders loading state', () => {
    vi.mocked(getConnectedProjects).mockReturnValue(new Promise(() => {}));
    render(<DashboardPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders error state', async () => {
    vi.mocked(getConnectedProjects).mockRejectedValue(new Error('Test error'));
    render(<DashboardPage />);
    await screen.findByText('Failed to fetch connected projects. Please try again.');
  });

  it('renders connected projects', async () => {
    const mockProjects = [
      { id: 1, name: 'Project 1' },
      { id: 2, name: 'Project 2' },
    ];
    vi.mocked(getConnectedProjects).mockResolvedValue(mockProjects);
    render(<DashboardPage />);
    await screen.findByText('Connected Projects');
    expect(screen.getByTestId('project-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('project-card-2')).toBeInTheDocument();
  });

  it('opens and closes repo selector', async () => {
    vi.mocked(getConnectedProjects).mockResolvedValue([]);
    render(<DashboardPage />);
    await screen.findByText('Connected Projects');
    
    fireEvent.click(screen.getByText('Add New Repository'));
    expect(screen.getByTestId('repo-selector')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('repo-selector')).not.toBeInTheDocument();
  });

  it('adds a new repository', async () => {
    const mockProjects = [{ id: 1, name: 'Project 1' }];
    vi.mocked(getConnectedProjects).mockResolvedValue(mockProjects);
    const { toast } = useToast();
    render(<DashboardPage />);
    await screen.findByText('Connected Projects');
    
    fireEvent.click(screen.getByText('Add New Repository'));
    fireEvent.click(screen.getByText('Select Repo'));
    
    expect(screen.getByTestId('project-card-999')).toBeInTheDocument();
    expect(toast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'New repository connected successfully.',
    });
  });
});
