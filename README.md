# Claude Chef

Claude Chef is a React and Vite app that turns a list of ingredients into a recipe suggestion using an AI agent.

## Agent Overview

The app uses a recipe suggestion agent in [src/agent.js](src/agent.js).

- Primary model path: Anthropic Claude via the function getRecipeFromChefClaude.
- Alternate model path: Hugging Face Inference with Mistral via the function getRecipeFromMistral.
- Prompting strategy: a fixed system prompt asks the model to recommend a practical recipe, use provided ingredients, and format output as markdown.

## How It Works

1. The user adds ingredients in the UI.
2. The app collects ingredients in state in [src/MainSection.jsx](src/MainSection.jsx).
3. Clicking Get a recipe sends ingredients to the agent function.
4. The agent calls the model API and returns markdown.
5. The markdown recipe is rendered in [src/ClaudeRecipe.jsx](src/ClaudeRecipe.jsx).

## Environment Variables

Create a local .env file in the project root and set:

VITE_ANTHROPIC_API_KEY=your_anthropic_key
VITE_HF_ACCESS_TOKEN=your_huggingface_token

Notes:
- .env is ignored by Git via [.gitignore](.gitignore).
- The current UI flow calls Claude by default.
- Mistral support is implemented and can be wired in the UI if you want a model switch.

## Scripts

- npm install
- npm run dev
- npm run build
- npm run preview
- npm run lint

## Security Note

The Anthropic client currently enables browser-side calls with dangerouslyAllowBrowser. For production use, move LLM calls to a server endpoint so API keys are not exposed to clients.

## GitHub Pages Automation

This repo now auto-deploys to GitHub Pages using GitHub Actions.

Workflow file:
- [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml)

What happens:
- Every push to main triggers a build and deploy.
- The Vite base path is set automatically for production in [vite.config.js](vite.config.js).

One-time GitHub setting:
1. Go to your repository Settings.
2. Open Pages.
3. Under Build and deployment, set Source to GitHub Actions.

After that, push to main and your site will update automatically.
