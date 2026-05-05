const SYSTEM_PROMPT = `You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You do not need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they did not mention, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render to a web page.`

function getCorsHeaders(origin, allowedOrigin) {
  if (!origin) {
    return {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  }

  if (allowedOrigin !== "*" && origin !== allowedOrigin) {
    return null
  }

  return {
    "Access-Control-Allow-Origin": allowedOrigin === "*" ? origin : allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }
}

function jsonResponse(body, status, corsHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  })
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin")
    const allowedOrigin = env.ALLOWED_ORIGIN || "*"
    const corsHeaders = getCorsHeaders(origin, allowedOrigin)

    if (!corsHeaders) {
      return new Response("Forbidden", { status: 403 })
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    const url = new URL(request.url)

    if (request.method !== "POST" || url.pathname !== "/recipe") {
      return jsonResponse({ error: "Not found" }, 404, corsHeaders)
    }

    if (!env.ANTHROPIC_API_KEY) {
      return jsonResponse({ error: "ANTHROPIC_API_KEY is not configured." }, 500, corsHeaders)
    }

    let body

    try {
      body = await request.json()
    } catch {
      return jsonResponse({ error: "Request body must be valid JSON." }, 400, corsHeaders)
    }

    const ingredients = Array.isArray(body?.ingredients)
      ? body.ingredients
          .map((item) => String(item).trim())
          .filter(Boolean)
      : []

    if (ingredients.length === 0) {
      return jsonResponse({ error: "Please provide at least one ingredient." }, 400, corsHeaders)
    }

    const model = env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest"
    const ingredientsString = ingredients.join(", ")

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `I have ${ingredientsString}. Please give me a recipe you recommend.`,
          },
        ],
      }),
    })

    const anthropicPayload = await anthropicResponse.json()

    if (!anthropicResponse.ok) {
      const apiError = anthropicPayload?.error?.message || "Anthropic request failed."
      return jsonResponse({ error: apiError }, anthropicResponse.status, corsHeaders)
    }

    const recipe = anthropicPayload?.content?.[0]?.text

    if (!recipe) {
      return jsonResponse({ error: "Anthropic response did not include recipe text." }, 502, corsHeaders)
    }

    return jsonResponse({ recipe }, 200, corsHeaders)
  },
}
