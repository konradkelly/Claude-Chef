# Claude Chef

Claude Chef is a React and Vite app that turns a list of ingredients into a recipe suggestion using an AI agent.

## Agent Overview

The app uses a recipe suggestion agent in [src/agent.js](src/agent.js).

- Frontend path: the browser sends ingredients to a backend endpoint at VITE_RECIPE_API_URL.
- Backend path: a Cloudflare Worker calls Anthropic securely using a server-side secret.
- Prompting strategy: a fixed system prompt asks for a practical markdown recipe using provided ingredients.

## How It Works

1. The user adds ingredients in the UI.
2. The app collects ingredients in state in [src/MainSection.jsx](src/MainSection.jsx).
3. Clicking Get a recipe sends ingredients to [src/agent.js](src/agent.js).
4. The app posts ingredients to the Worker endpoint.
5. The Worker calls Anthropic and returns recipe markdown.
6. The markdown recipe is rendered in [src/ClaudeRecipe.jsx](src/ClaudeRecipe.jsx).

## Environment Variables

Create a local .env file in the project root for frontend development:

VITE_RECIPE_API_URL=http://127.0.0.1:8787/recipe

Notes:
- .env is ignored by Git via [.gitignore](.gitignore).
- API keys are no longer used in the frontend.
- The Anthropic API key is stored only in Cloudflare Worker secrets.

## Scripts

- npm install
- npm run dev
- npm run build
- npm run preview
- npm run lint
- npm run worker:dev
- npm run worker:deploy

## Cloudflare Worker Setup

Worker files:
- [worker/src/index.js](worker/src/index.js)
- [worker/wrangler.toml](worker/wrangler.toml)

One-time setup in Cloudflare:
1. Install Wrangler CLI (or use npx wrangler).
2. Authenticate: npx wrangler login
3. Create Worker secret: npx wrangler secret put ANTHROPIC_API_KEY --config worker/wrangler.toml
4. Deploy Worker: npm run worker:deploy

After deploy, copy your Worker URL and append /recipe. Example:
- https://claude-chef-api.your-subdomain.workers.dev/recipe

## GitHub Pages Automation

This repo auto-deploys frontend and Worker with GitHub Actions.

Workflow files:
- [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml)
- [.github/workflows/deploy-worker.yml](.github/workflows/deploy-worker.yml)

What happens:
- Every push to main triggers GitHub Pages build and deploy.
- Worker changes in [worker/src/index.js](worker/src/index.js) or [worker/wrangler.toml](worker/wrangler.toml) trigger Worker deploy.
- The Vite base path is set automatically for production in [vite.config.js](vite.config.js).

One-time GitHub settings:
1. Go to your repository Settings.
2. Open Pages.
3. Under Build and deployment, set Source to GitHub Actions.
4. Open Secrets and variables > Actions.
5. Add repository variable VITE_RECIPE_API_URL with your Worker endpoint URL ending in /recipe.
6. Add repository secret CLOUDFLARE_API_TOKEN.
7. Add repository secret CLOUDFLARE_ACCOUNT_ID.

After that, push to main and both your frontend and Worker can deploy automatically.
