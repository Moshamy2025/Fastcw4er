import fetch from 'node-fetch';
import { RecipeResult } from './openai';

// TheMealDB API URL for free tier
const MEAL_DB_API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

/**
 * Search recipes by ingredient using TheMealDB API
 */
export async function searchRecipesByIngredient(ingredient: string): Promise<any> {
  try {
    const response = await fetch(`${MEAL_DB_API_BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`);
    
    if (!response.ok) {
      throw new Error(`TheMealDB API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching recipes by ingredient:', error);
    throw error;
  }
}

/**
 * Get recipe details by ID from TheMealDB API
 */
export async function getRecipeById(id: string): Promise<any> {
  try {
    const response = await fetch(`${MEAL_DB_API_BASE_URL}/lookup.php?i=${id}`);
    
    if (!response.ok) {
      throw new Error(`TheMealDB API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting recipe details:', error);
    throw error;
  }
}

/**
 * Generate recipes based on provided ingredients using TheMealDB API
 */
export async function generateRecipesMealDB(ingredients: string[]): Promise<RecipeResult> {
  try {
    // TheMealDB API can only search by one ingredient at a time, so we'll use the first one
    // and filter results based on the rest
    if (ingredients.length === 0) {
      return {
        recipes: [],
        suggestedIngredients: [
          "chicken", "beef", "fish", "potato", "rice", 
          "pasta", "onion", "tomato", "egg", "cheese"
        ]
      };
    }

    // Start with the first ingredient
    const primaryIngredient = ingredients[0];
    const searchResponse = await searchRecipesByIngredient(primaryIngredient);
    
    if (!searchResponse.meals) {
      console.log(`No recipes found for ingredient: ${primaryIngredient}`);
      return {
        recipes: [],
        suggestedIngredients: [
          "chicken", "beef", "fish", "potato", "rice", 
          "pasta", "onion", "tomato", "egg", "cheese"
        ]
      };
    }

    // Get details for up to 3 recipes
    const recipeDetails = await Promise.all(
      searchResponse.meals.slice(0, 3).map(async (meal: any) => {
        try {
          const details = await getRecipeById(meal.idMeal);
          return details.meals?.[0];
        } catch (error) {
          console.error(`Failed to get details for recipe ${meal.idMeal}:`, error);
          return null;
        }
      })
    );

    // Filter out null results
    const validRecipes = recipeDetails.filter(recipe => recipe !== null);

    // Transform the recipes to our format
    const formattedRecipes = validRecipes.map(recipe => {
      const ingredients: string[] = [];
      const measures: string[] = [];
      
      // Extract ingredients and measures from recipe object
      for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        
        if (ingredient && ingredient.trim() !== '') {
          ingredients.push(ingredient);
          if (measure && measure.trim() !== '') {
            measures.push(measure);
          }
        }
      }

      // Split instructions by periods or newlines to get steps
      const instructionsText = recipe.strInstructions || '';
      const instructions = instructionsText
        .split(/\.|\n/)
        .map((step: string) => step.trim())
        .filter((step: string) => step.length > 0);

      // Prepare translated title and description (basic for now, can be improved)
      let title = recipe.strMeal || 'No Title';
      let description = `${recipe.strArea || ''} ${recipe.strCategory || ''} recipe`;
      
      // For Arabic UI
      try {
        // Attempt to translate if language detection finds English
        if (/^[a-zA-Z0-9\s\.,;:'"\(\)!?-]+$/.test(title)) {
          title = getArabicEquivalent(title);
          description = getArabicEquivalent(description);
        }
      } catch (e) {
        console.log('Translation not implemented, using original text');
      }

      return {
        title,
        description: description.trim(),
        ingredients: ingredients.map((ing, idx) => 
          measures[idx] ? `${measures[idx]} ${ing}` : ing
        ),
        instructions,
        videoId: extractYouTubeId(recipe.strYoutube)
      };
    });

    // Get suggested ingredients
    // These would be related ingredients based on the recipes found
    const suggestedIngredients = getSuggestedIngredients(validRecipes, ingredients);

    return {
      recipes: formattedRecipes,
      suggestedIngredients
    };
  } catch (error) {
    console.error('Error generating recipes from TheMealDB:', error);
    
    // Fallback to our static recipes
    return getFallbackRecipesMealDB(ingredients);
  }
}

/**
 * Extract YouTube ID from YouTube URL
 */
function extractYouTubeId(youtubeUrl: string | null): string | undefined {
  if (!youtubeUrl) return undefined;
  
  const match = youtubeUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : undefined;
}

/**
 * Get suggested ingredients based on recipes found
 */
function getSuggestedIngredients(recipes: any[], excludeIngredients: string[]): string[] {
  const suggestions = new Set<string>();
  const excludeSet = new Set(excludeIngredients.map(ing => ing.toLowerCase()));
  
  // Extract ingredients from recipes that are not in the excluded list
  recipes.forEach(recipe => {
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`];
      
      if (ingredient && ingredient.trim() !== '' && 
          !excludeSet.has(ingredient.toLowerCase())) {
        suggestions.add(ingredient);
        
        // Stop after collecting 5 suggestions
        if (suggestions.size >= 5) break;
      }
    }
  });
  
  // If we don't have enough suggestions, add some common ones
  const commonIngredients = [
    "chicken", "beef", "fish", "potato", "rice", 
    "pasta", "onion", "tomato", "egg", "cheese"
  ];
  
  for (const ing of commonIngredients) {
    if (!excludeSet.has(ing) && suggestions.size < 5) {
      suggestions.add(ing);
    }
  }
  
  // Convert to Arabic if needed
  return Array.from(suggestions).map(ing => {
    try {
      // Basic check if ingredient is in English
      if (/^[a-zA-Z0-9\s]+$/.test(ing)) {
        return getArabicEquivalent(ing);
      }
      return ing;
    } catch (e) {
      return ing;
    }
  });
}

/**
 * Temporary function to get Arabic equivalents for common ingredients and terms
 */
function getArabicEquivalent(text: string): string {
  const translations: Record<string, string> = {
    // Meal types
    'breakfast': 'فطور',
    'lunch': 'غداء',
    'dinner': 'عشاء',
    'dessert': 'حلويات',
    'Dessert': 'حلويات',
    'side dish': 'طبق جانبي',
    'appetizer': 'مقبلات',
    'Starter': 'مقبلات',
    'main course': 'طبق رئيسي',
    'Main': 'طبق رئيسي',
    
    // Cuisines
    'Italian': 'إيطالي',
    'French': 'فرنسي',
    'Mexican': 'مكسيكي',
    'Chinese': 'صيني',
    'Indian': 'هندي',
    'Japanese': 'ياباني',
    'American': 'أمريكي',
    'Mediterranean': 'متوسطي',
    'Lebanese': 'لبناني',
    'Greek': 'يوناني',
    'Spanish': 'إسباني',
    'Thai': 'تايلندي',
    'Turkish': 'تركي',
    'Moroccan': 'مغربي',
    'British': 'بريطاني',
    
    // Common ingredients
    'chicken': 'دجاج',
    'beef': 'لحم بقري',
    'lamb': 'لحم ضأن',
    'pork': 'لحم خنزير',
    'fish': 'سمك',
    'shrimp': 'روبيان',
    'rice': 'أرز',
    'pasta': 'معكرونة',
    'spaghetti': 'سباغيتي',
    'bread': 'خبز',
    'flour': 'طحين',
    'sugar': 'سكر',
    'salt': 'ملح',
    'pepper': 'فلفل',
    'oil': 'زيت',
    'olive oil': 'زيت زيتون',
    'butter': 'زبدة',
    'cheese': 'جبنة',
    'egg': 'بيض',
    'milk': 'حليب',
    'cream': 'كريمة',
    'yogurt': 'زبادي',
    'tomato': 'طماطم',
    'potato': 'بطاطس',
    'onion': 'بصل',
    'garlic': 'ثوم',
    'carrot': 'جزر',
    'cucumber': 'خيار',
    'lettuce': 'خس',
    'corn': 'ذرة',
    'mushroom': 'فطر',
    'lemon': 'ليمون',
    'orange': 'برتقال',
    'apple': 'تفاح',
    'banana': 'موز',
    'grape': 'عنب',
    'watermelon': 'بطيخ',
    'strawberry': 'فراولة',
    'chocolate': 'شوكولاتة',
    'coffee': 'قهوة',
    'tea': 'شاي',
    'water': 'ماء',
    'juice': 'عصير',
    
    // Recipe terms
    'instructions': 'تعليمات',
    'ingredients': 'مكونات',
    'preparation': 'تحضير',
    'cooking': 'طبخ',
    'baking': 'خبز',
    'frying': 'قلي',
    'boiling': 'غلي',
    'grilling': 'شوي',
    'roasting': 'تحميص',
    'steaming': 'تبخير',
    
    // Common phrases
    'No Title': 'بدون عنوان'
  };
  
  // Very basic translation - in a real app we would use a translation API
  let translatedText = text;
  
  Object.entries(translations).forEach(([english, arabic]) => {
    // Case insensitive global replacement
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    translatedText = translatedText.replace(regex, arabic);
  });
  
  return translatedText;
}

/**
 * Fallback function when API fails
 */
function getFallbackRecipesMealDB(ingredients: string[]): RecipeResult {
  // Use the same fallback mechanism we already have
  const fallbackRecipes: Record<string, RecipeResult> = {
    "طماطم,بصل,ثوم": {
      recipes: [
        {
          title: "صلصة طماطم مع البصل والثوم",
          description: "صلصة طماطم بسيطة وسريعة يمكن استخدامها مع المعكرونة أو الأرز",
          ingredients: ["3 حبات طماطم", "1 بصلة متوسطة", "2 فص ثوم", "ملح وفلفل حسب الرغبة", "زيت زيتون"],
          instructions: [
            "قطع البصل والثوم إلى قطع صغيرة",
            "سخن زيت الزيتون في مقلاة على نار متوسطة",
            "أضف البصل والثوم وقلبهم حتى يصبح لونهم ذهبياً",
            "قطع الطماطم وأضفها إلى المقلاة",
            "أضف الملح والفلفل واتركها على نار هادئة لمدة 15 دقيقة"
          ]
        }
      ],
      suggestedIngredients: ["فلفل أخضر", "زيتون", "معكرونة", "جبنة", "أعشاب (ريحان أو بقدونس)"]
    },
    "بيض": {
      recipes: [
        {
          title: "بيض مقلي",
          description: "وجبة سريعة من البيض المقلي",
          ingredients: ["2 بيضة", "ملح وفلفل حسب الرغبة", "زيت للقلي"],
          instructions: [
            "سخن الزيت في مقلاة على نار متوسطة",
            "اكسر البيض في المقلاة",
            "رش الملح والفلفل",
            "اطهي البيض حتى ينضج حسب الرغبة"
          ]
        }
      ],
      suggestedIngredients: ["جبنة", "خبز", "طماطم", "بصل", "فلفل أخضر"]
    }
  };

  // Use same logic as before
  const normalizedIngredients = ingredients.map(i => i.trim().toLowerCase());
  const key = [...normalizedIngredients].sort().join(',');
  
  if (key in fallbackRecipes) {
    return fallbackRecipes[key];
  }

  // Check for partial matches
  for (const ingredient of normalizedIngredients) {
    if (ingredient in fallbackRecipes) {
      return fallbackRecipes[ingredient];
    }
  }

  // Return a generic suggestion if no match found
  return {
    recipes: [],
    suggestedIngredients: [
      "دجاج", "لحم", "سمك", "بطاطس", "أرز", "معكرونة", "بصل", "طماطم", "بيض", "جبنة"
    ]
  };
}