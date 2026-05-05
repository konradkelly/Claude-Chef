import React from "react"
import IngredientsList from "./IngredientsList"
import ClaudeRecipe from "./ClaudeRecipe"
import { getRecipeSuggestion } from "./agent"

export default function MainSection() {
    const [ingredients, setIngredients] = React.useState([])
    const [recipe, setRecipe] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    
    async function getRecipe() {
        setIsLoading(true)
        try {
            const recipeMarkdown = await getRecipeSuggestion(ingredients)
            setRecipe(recipeMarkdown)
        } catch (error) {
            setRecipe(`### Unable to generate a recipe right now\n\n${error.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    function addIngredient(formData) {
        const newIngredient = formData.get("ingredient")
        setIngredients(prevIngredients => [...prevIngredients, newIngredient])
    }

    return (
        <main>
            <form action={addIngredient} className="add-ingredient-form">
                <input
                    type="text"
                    placeholder="e.g. oregano"
                    aria-label="Add ingredient"
                    name="ingredient"
                />
                <button>Add ingredient</button>
            </form>
            
            {ingredients.length > 0 && 
            <IngredientsList 
                ingredients={ingredients} 
                getRecipe={getRecipe} 
                isLoading={isLoading}
                />}
            {recipe && <ClaudeRecipe recipe={recipe} />}
        </main>
    )
}