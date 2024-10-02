export async function generateUITestScenarios(pullRequestId: number, prDiff: string): Promise<string[]> {
  try {
    const response = await fetch("/api/generate-automation-test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pr_id: pullRequestId, pr_diff: prDiff }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate UI test scenarios");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error generating UI test scenarios:", error);
    throw error;
  }
}