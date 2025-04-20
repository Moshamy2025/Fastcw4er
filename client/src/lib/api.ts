import { Ingredient, RecipeResponse, SubstitutionResponse } from "./types";
import { apiRequest } from "./queryClient";

/**
 * Fetch recipes based on provided ingredients
 */
export async function fetchRecipes(ingredients: string[]): Promise<RecipeResponse> {
  try {
    const response = await apiRequest(
      "POST",
      "/api/recipes",
      { ingredients }
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching recipes:", error);
    throw new Error("Failed to fetch recipes");
  }
}

/**
 * Search for recipes by name
 */
export async function searchRecipesByName(query: string): Promise<RecipeResponse> {
  try {
    const url = `/api/recipes/search?query=${encodeURIComponent(query)}`;
    const response = await apiRequest("GET", url);
    return await response.json();
  } catch (error) {
    console.error("Error searching recipes by name:", error);
    throw new Error("فشل البحث عن الوصفات");
  }
}

/**
 * Get substitution suggestions for an ingredient
 */
export async function getIngredientSubstitutes(ingredient: string): Promise<SubstitutionResponse> {
  try {
    const url = `/api/substitutes?ingredient=${encodeURIComponent(ingredient)}`;
    const response = await apiRequest("GET", url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching ingredient substitutes:", error);
    throw new Error("فشل في العثور على بدائل للمكون");
  }
}
