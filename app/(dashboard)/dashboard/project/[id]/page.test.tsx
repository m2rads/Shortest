import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProjectPage from './page';
import { useParams } from 'next/navigation';
import { getProjectPullRequests, getProjectDetails, updateProjectSettings } from '@/lib/github';
import { useToast } from '@/hooks/use-toast';

vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
}));

vi.mock('@/lib/github', () => ({
  getProjectPullRequests: vi.fn(),
  getProjectDetails: vi.fn(),
  updateProjectSettings: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

vi.mock('../../pull-request', () => ({
  PullRequestItem: ({ pullRequest }) => <div data-testid={`pr-${pullRequest.id}`}>{pullRequest.title}</div>,
}));

describe('ProjectPage', () => {
  beforeEach(() => {
    vi.mocked(useParams).mockReturnValue({ id: '1' });
    vi.mocked(getProjectPullRequests).mockResolvedValue([]);
    vi.mocked(getProjectDetails).mockResolvedValue({
      id: 1,
      name: 'Test Project',
      environments: [],
    });
  });

  it('renders loading state', () => {
    render(<ProjectPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders project details and pull requests', async () => {
    vi.mocked(getProjectPullRequests).mockResolvedValue([
      { id: 1, title: 'PR 1' },
      { id: 2, title: 'PR 2' },
    ]);
    render(<ProjectPage />);
    await screen.findByText('Test Project');
    expect(screen.getByTestId('pr-1')).toBeInTheDocument();
    expect(screen.getByTestId('pr-2')).toBeInTheDocument();
  });

  it('switches between tabs', async () => {
    render(<ProjectPage />);
    await screen.findByText('Test Project');
    
    fireEvent.click(screen.getByText('Project Settings'));
    expect(screen.getByText('Project Environments')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Open PRs'));
    expect(screen.getByText('No open pull requests found for this project.')).toBeInTheDocument();
  });

  it('adds and updates environments', async () => {
    render(<ProjectPage />);
    await screen.findByText('Test Project');
    fireEvent.click(screen.getByText('Project Settings'));
    
    fireEvent.click(screen.getByText('Add Environment'));
    const envInputs = screen.getAllByPlaceholderText('Environment Name');
    fireEvent.change(envInputs[envInputs.length - 1], { target: { value: 'New Env' } });
    
    fireEvent.click(screen.getByText('Add Test Account'));
    const usernameInputs = screen.getAllByPlaceholderText('Username');
    fireEvent.change(usernameInputs[usernameInputs.length - 1], { target: { value: 'testuser' } });
    
    fireEvent.click(screen.getByText('Save Settings'));
    await waitFor(() => {
      expect(updateProjectSettings).toHaveBeenCalledWith(1, expect.objectContaining({
        environments: [expect.objectContaining({ name: 'New Env' })],
      }));
    });
    
    const { toast } = useToast();
    expect(toast).toHaveBeenCalledWith({
      title: 'Settings saved',
      description: 'Project settings have been updated successfully.',
    });
  });

  it('handles errors when saving settings', async () => {
    vi.mocked(updateProjectSettings).mockRejectedValue(new Error('Test error'));
    render(<ProjectPage />);
    await screen.findByText('Test Project');
    fireEvent.click(screen.getByText('Project Settings'));
    fireEvent.click(screen.getByText('Save Settings'));
    
    const { toast } = useToast();
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to save project settings. Please try again.',
        variant: 'destructive',
      });
    });
  });
});
