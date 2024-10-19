import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PullRequestItem } from './pull-request';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PullRequest } from './types';
import useSWR from 'swr';
import { fetchBuildStatus, generateUITestScenarios } from '@/lib/github';
import { experimental_useObject as useObject } from 'ai/react';
import { act } from 'react';

vi.mock('@/lib/github', async () => {
  const actual = await vi.importActual('@/lib/github');
  return {
    ...(actual as object),
    getPullRequestInfo: vi.fn(),
    commitChangesToPullRequest: vi.fn(),
    getFailingTests: vi.fn(),
    fetchBuildStatus: vi.fn(),
    getLatestRunId: vi.fn(),
    generateUITestScenarios: vi.fn(),
  };
});

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock('react-diff-viewer', () => ({
  default: () => <div data-testid='react-diff-viewer'>Mocked Diff Viewer</div>,
}));

vi.mock('swr', () => ({
  default: vi.fn(),
}));

vi.mock('./log-view', () => ({
  LogView: () => <div data-testid='log-view'>Mocked Log View</div>,
}));

vi.mock('ai/react', () => ({
  experimental_useObject: vi.fn(),
}));

describe('PullRequestItem', () => {
  const mockPullRequest: PullRequest = {
    id: 1,
    title: 'Test PR',
    number: 123,
    buildStatus: 'success',
    isDraft: false,
    branchName: 'feature-branch',
    repository: {
      id: 1,
      name: 'test-repo',
      full_name: 'owner/test-repo',
      owner: {
        login: 'owner',
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    vi.mocked(useSWR).mockReturnValue({
      data: mockPullRequest,
      mutate: vi.fn(),
      error: undefined,
      isValidating: false,
      isLoading: false,
    });
    vi.mocked(useObject).mockReturnValue({
      object: null,
      submit: vi.fn(),
      isLoading: false,
    });
  });

  // ... (previous tests remain unchanged)

  it('generates UI test scenarios', async () => {
    const { generateUITestScenarios } = await import('@/lib/github');
    vi.mocked(generateUITestScenarios).mockResolvedValue([
      'Verify login button is clickable',
      'Validate form submission',
    ]);

    render(<PullRequestItem pullRequest={mockPullRequest} />);

    const generateUITestButton = screen.getByText('Generate UI Test');
    fireEvent.click(generateUITestButton);

    await waitFor(() => {
      expect(screen.getByText('Verify login button is clickable')).toBeInTheDocument();
      expect(screen.getByText('Validate form submission')).toBeInTheDocument();
    });

    expect(generateUITestScenarios).toHaveBeenCalledWith(mockPullRequest.id, expect.any(String));
  });

  it('handles errors when generating UI test scenarios', async () => {
    const { generateUITestScenarios } = await import('@/lib/github');
    vi.mocked(generateUITestScenarios).mockRejectedValue(new Error('Test error'));

    const { toast } = await import('@/hooks/use-toast');
    render(<PullRequestItem pullRequest={mockPullRequest} />);

    const generateUITestButton = screen.getByText('Generate UI Test');
    fireEvent.click(generateUITestButton);

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to generate UI test scenarios. Please try again.',
        variant: 'destructive',
      });
    });
  });

  it('changes button text after generating UI test scenarios', async () => {
    const { generateUITestScenarios } = await import('@/lib/github');
    vi.mocked(generateUITestScenarios).mockResolvedValue(['Test scenario']);

    render(<PullRequestItem pullRequest={mockPullRequest} />);

    const generateUITestButton = screen.getByText('Generate UI Test');
    fireEvent.click(generateUITestButton);

    await waitFor(() => {
      expect(screen.getByText('Execute Tests')).toBeInTheDocument();
    });
  });
});
