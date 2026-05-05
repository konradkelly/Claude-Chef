import Anthropic from "@anthropic-ai/sdk"
import { HfInference } from '@huggingface/inference'

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render to a web page
`

const anthropicApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
const hfAccessToken = import.meta.env.VITE_HF_ACCESS_TOKEN

const anthropic = anthropicApiKey
    ? new Anthropic({
        apiKey: anthropicApiKey,
        dangerouslyAllowBrowser: true,
    })
    : null

export async function getRecipeFromChefClaude(ingredientsArr) {
    if (!anthropic) {
        throw new Error("Claude is not configured. Add VITE_ANTHROPIC_API_KEY to your environment.")
    }

    const ingredientsString = ingredientsArr.join(", ")

    const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
            { role: "user", content: `I have ${ingredientsString}. Please give me a recipe you'd recommend I make!` },
        ],
    });
    return msg.content[0].text
}

// Set VITE_HF_ACCESS_TOKEN in .env (or your host's env) for Hugging Face.
const hf = hfAccessToken ? new HfInference(hfAccessToken) : null

export async function getRecipeFromMistral(ingredientsArr) {
    if (!hf) {
        throw new Error("Mistral is not configured. Add VITE_HF_ACCESS_TOKEN to your environment.")
    }

    const ingredientsString = ingredientsArr.join(", ")
    const response = await hf.chatCompletion({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `I have ${ingredientsString}. Please give me a recipe you'd recommend I make!` },
        ],
        max_tokens: 1024,
    })
    return response.choices[0].message.content
}

export async function getRecipeSuggestion(ingredientsArr) {
    try {
        return await getRecipeFromChefClaude(ingredientsArr)
    } catch (claudeError) {
        try {
            return await getRecipeFromMistral(ingredientsArr)
        } catch (mistralError) {
            console.error("Claude error:", claudeError)
            console.error("Mistral error:", mistralError)
            throw new Error("No AI provider is configured for this build. Add VITE_ANTHROPIC_API_KEY or VITE_HF_ACCESS_TOKEN and redeploy.")
        }
    }
}
