export const AITools = [
  {
    type: "computer_20241022",
    name: "computer",
    display_width_px: 1920,
    display_height_px: 1080,
    display_number: 1
  },
  {
    name: "github_login",
    description: "Handle GitHub OAuth login with 2FA",
    input_schema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["github_login"],
          description: "The action to perform. It's always equal to 'github_login'"
        },
        username: {
          type: "string",
          description: "GitHub username or email"
        },
        password: {
          type: "string",
          description: "GitHub password"
        }
      },
      required: ["action", "username", "password"]
    }
  },
  {
    name: "run_callback",
    description: "Run callback function for current test step",
    input_schema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["run_callback"],
          description: "Execute callback for current step"
        }
      },
      required: ["action"]
    }
  },
  {
    name: "navigate",
    description: "Navigate to URLs in new browser tabs",
    input_schema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["navigate"],
          description: "The action to perform"
        },
        url: {
          type: "string",
          description: "The URL to navigate to"
        }
      },
      required: ["action", "url"]
    }
  }
] as const;

export type AITool = typeof AITools[number]['name'];
