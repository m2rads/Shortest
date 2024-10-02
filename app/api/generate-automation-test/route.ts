import { NextResponse } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";
import { getPullRequestInfo } from "@/lib/github";

export const maxDuration = 30;

const GenerateUITestsInput = z.object({
  pr_id: z.number(),
  pr_diff: z.string(),
});

const GenerateUITestsResponse = z.array(z.string());

export async function POST(req: Request) {
  const { pr_id, pr_diff } = await req.json() as z.infer<typeof GenerateUITestsInput>;

  try {
    const prompt = `You are an expert software engineer specializing in UI testing. Given the following pull request diff, generate concise, one-line UI test scenarios:

    PR Diff:
    <PR Diff>
    ${pr_diff}
    </PR Diff>

    Please provide a list of UI test scenarios that cover the changes in this pull request. Each scenario should:
    1. Focus on a single UI element or interaction
    2. Be specific to the functionality represented in the diff
    3. Use action verbs like "Verify", "Validate", "Check", or "Ensure"
    4. Be no longer than one sentence

    Example format:
    - Verify login button is clickable on the homepage
    - Validate cart checkout modal appears when clicking "Proceed to Checkout"
    - Ensure error message displays for invalid email input

    Please list each scenario as a separate item.`;

    const { object: scenarios } = await generateObject({
      model: anthropic("claude-3-5-sonnet-20240620"),
      output: "array",
      schema: GenerateUITestsResponse,
      prompt,
    });

    return NextResponse.json(scenarios);
  } catch (error) {
    console.error("Error generating UI test scenarios:", error);
    return NextResponse.json({ error: "Failed to generate UI test scenarios" }, { status: 500 });
  }
}