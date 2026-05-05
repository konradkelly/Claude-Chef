const DEFAULT_RECIPE_API_URL = "https://claude-chef-api.konradky.workers.dev/recipe"

export async function getRecipeSuggestion(ingredientsArr) {
    const configuredApiUrl = import.meta.env.VITE_RECIPE_API_URL
    const recipeApiUrl = configuredApiUrl && configuredApiUrl.trim()
        ? configuredApiUrl.trim()
        : DEFAULT_RECIPE_API_URL

    const response = await fetch(recipeApiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients: ingredientsArr }),
    })

    let payload = null

    try {
        payload = await response.json()
    } catch {
        if (!response.ok) {
            throw new Error("Recipe API request failed.")
        }
    }

    if (!response.ok) {
        throw new Error(payload?.error || "Recipe API request failed.")
    }

    if (!payload?.recipe) {
        throw new Error("Recipe API response did not include a recipe.")
    }

    return payload.recipe
}
