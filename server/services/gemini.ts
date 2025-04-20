import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { RecipeResult } from './openai';
import { SubstitutionResponse } from './substitutions';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Gemini model to use - using the most capable model
const MODEL_NAME = "gemini-1.5-pro";

interface GeminiRecipeResponse {
  recipes: {
    title: string;
    description: string;
    ingredients: string[];
    instructions: string[];
  }[];
  suggestedIngredients: string[];
}

/**
 * Generate recipes based on provided ingredients using Google Gemini API
 */
export async function generateRecipesGemini(ingredients: string[]): Promise<RecipeResult> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable not set");
    }

    // If no ingredients provided, return empty results with suggestions
    if (ingredients.length === 0) {
      return {
        recipes: [],
        suggestedIngredients: [
          "دجاج", "لحم", "سمك", "بطاطس", "أرز", 
          "معكرونة", "بصل", "طماطم", "بيض", "جبنة"
        ]
      };
    }

    // Create prompt for Gemini
    const userIngredients = ingredients.join(', ');
    
    const prompt = `
    عايزك تقترح ليا وصفات أكل باستخدام المكونات دي: ${userIngredients}.
    
    عايز النتائج بالعربي المصري (باللهجة المصرية العامية)، وعايزك تديني وصفتين مختلفين بالصيغة دي:
    
    الأول، اقترح قائمة بـ 5 مكونات إضافية ممكن أضيفها عشان أوسّع خياراتي.
    
    وبعدين لكل وصفة: 
    1. اسم الوصفة بلهجة مصرية مرحة
    2. وصف قصير للوصفة (1-2 جملة)
    3. قائمة المكونات (مع الكميات)
    4. خطوات التحضير مقسمة على بنود واضحة وباللهجة المصرية المرحة
    
    استخدم مصطلحات مصرية زي: حطّي، سيبيه، هنولّع النار، هنرمي المكونات، ولمّا يستوي، هنتّبل، وهكذا.
    
    عايز الرد منك بصيغة JSON بس بدون أي كلام زيادة، زي ده:
    
    {
      "recipes": [
        {
          "title": "عنوان الوصفة الأولى",
          "description": "وصف موجز للوصفة الأولى",
          "ingredients": ["المكون 1 مع الكمية", "المكون 2 مع الكمية"],
          "instructions": ["الخطوة 1", "الخطوة 2", "الخطوة 3"]
        },
        {
          "title": "عنوان الوصفة الثانية",
          "description": "وصف موجز للوصفة الثانية",
          "ingredients": ["المكون 1 مع الكمية", "المكون 2 مع الكمية"],
          "instructions": ["الخطوة 1", "الخطوة 2", "الخطوة 3"]
        }
      ],
      "suggestedIngredients": ["مكون إضافي 1", "مكون إضافي 2", "مكون إضافي 3", "مكون إضافي 4", "مكون إضافي 5"]
    }
    `;

    // Get the Gemini model
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    // Generate content
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // Process response
    const response = result.response;
    const textResponse = response.text();
    
    console.log("Gemini API response:", textResponse);

    // Parse the JSON response
    let parsedResponse: GeminiRecipeResponse;
    try {
      // Since the response might sometimes have additional text before/after the JSON,
      // we'll try to extract the JSON part
      const jsonMatch = textResponse.match(/{[\s\S]*}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (error) {
      console.error("Failed to parse Gemini API response:", error);
      return getFallbackRecipes(ingredients);
    }

    // Format the response to match our expected format
    return {
      recipes: parsedResponse.recipes.map(recipe => ({
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
      })),
      suggestedIngredients: parsedResponse.suggestedIngredients || [
        "دجاج", "لحم", "سمك", "بطاطس", "أرز", 
        "معكرونة", "بصل", "طماطم", "بيض", "جبنة"
      ],
    };
  } catch (error) {
    console.error("Error generating recipes with Gemini:", error);
    return getFallbackRecipes(ingredients);
  }
}

/**
 * Generate ingredient substitution suggestions using Google Gemini API
 */
export async function generateSubstitutionsGemini(ingredient: string): Promise<SubstitutionResponse> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable not set");
    }

    // Create prompt for Gemini
    const prompt = `
    أنا عندي مكون اسمه "${ingredient}" ومش موجود عندي. اقترح عليّ 3 بدائل ممكن استخدمها مكانه.
    
    اعرض النتائج بالعامية المصرية وقدم المعلومات دي لكل بديل:
    1. اسم البديل
    2. النسبة المقابلة (مثال: 1:1 أو 3/4 كوب عوض كل كوب)
    3. ملاحظات اختيارية عن كيفية استخدام البديل
    
    اعرض الإجابة بصيغة JSON فقط بهذا الشكل:
    {
      "originalIngredient": "اسم المكون الأصلي",
      "substitutes": [
        {
          "name": "اسم البديل الأول",
          "ratio": "النسبة البديلة",
          "notes": "ملاحظات (اختياري)"
        },
        {
          "name": "اسم البديل الثاني",
          "ratio": "النسبة البديلة",
          "notes": "ملاحظات (اختياري)"
        },
        {
          "name": "اسم البديل الثالث",
          "ratio": "النسبة البديلة",
          "notes": "ملاحظات (اختياري)"
        }
      ]
    }
    `;

    // Get the Gemini model
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    // Generate content
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // Process response
    const response = result.response;
    const textResponse = response.text();
    
    console.log("Gemini API substitution response:", textResponse);

    // Parse the JSON response
    try {
      // Extract the JSON part from the response
      const jsonMatch = textResponse.match(/{[\s\S]*}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed as SubstitutionResponse;
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (error) {
      console.error("Failed to parse Gemini API response for substitutions:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error generating substitutions with Gemini:", error);
    throw error;
  }
}

/**
 * Get fallback recipes when API is unavailable
 */
function getFallbackRecipes(ingredients: string[]): RecipeResult {
  // Define some fallback recipes by ingredients
  const fallbackRecipes: Record<string, RecipeResult> = {
    "طماطم,بصل,ثوم": {
      recipes: [
        {
          title: "حكاية صلصة حلوة على الآخر 🍅",
          description: "صلصة طماطم حكاية من اللي هتاكل صوابعك وراها وتنفع مع المكرونة أو الرز",
          ingredients: ["3 حبات طماطم طازة", "1 بصلة متوسطة", "2 فص توم", "ملح وفلفل على مزاجك", "زيت زيتون كده شوية"],
          instructions: [
            "هنقطع البصل والتوم حتت صغيرة كده على مزاجك",
            "هنسخن الزيت في الحلة على نار متوسطة عشان ميتحرقش",
            "هنرمي البصل والتوم ونقلبهم لحد ما يصفروا كده وتطلع ريحتهم تجنن",
            "هنقطع الطماطم ونحطها في الحلة ونعصرها بالمعلقة",
            "هنحط الملح والفلفل ونسيبها على نار هادية لمدة ربع ساعة بس للي مستعجل، أو نص ساعة لو عايزها أحلى"
          ]
        }
      ],
      suggestedIngredients: ["فلفل أخضر", "زيتون أسود", "مكرونة إسباجتي", "جبنة رومي", "حبة فلفل حار للجدعان بس"]
    },
    "بيض": {
      recipes: [
        {
          title: "أحلى عيون صباحي 🍳",
          description: "عيون فطار سريعة هتظبطك للصبح وتفتح نفسك للشغل",
          ingredients: ["2 بيضة (3 للجعانين)", "شوية ملح وفلفل", "قطرة زيت عشان البيض ميلزقش"],
          instructions: [
            "هنسخن الزيت في المقلاية على نار حلوة كده",
            "هنكسر البيض في حلة صغيرة الأول عشان تبقى فنان ومتحطش قشر",
            "نكب البيض في المقلاية ولما يبدأ يسوى من تحت نرش الملح والفلفل",
            "نسيبه على حسب ما بتحبه، يا بيضة عيون أو سايحة أو مقلوبة زي الجدعان"
          ]
        }
      ],
      suggestedIngredients: ["جبنة فيتا", "عيش بلدي سخن", "طماطم بلدي", "بصل أخضر", "فلفل أخضر حلو"]
    },
    "دجاج": {
      recipes: [
        {
          title: "فرخة مشوية تجنن 🍗",
          description: "فرخة مشوية بتتبيلة أكل بيوت هتخليك تكسر صوابعك من ورايها",
          ingredients: ["4 قطع فراخ بلدي", "2 معلقة كبيرة زيت زيتون", "3 فصوص توم مهروسين", "شوية زعتر وريحان على ذوقك", "ملح وفلفل وكمون", "نص ليمونة معصورة"],
          instructions: [
            "هنخلط الزيت والتوم والبهارات وعصير الليمون في طبق عميق",
            "هندعك الفراخ بالخلطة دي وندخلها كل حتة لحد ما تتغطي كويس",
            "نسيب الفراخ في التتبيلة ساعة على الأقل عشان تشرب الطعم (أو في التلاجة بالليل للي بيحضر بدري)",
            "نشغل الفرن على 200 درجة وندخل البهارات",
            "نحط الفراخ في الصينية ونسيبها لمدة حوالي 35-40 دقيقة أو لحد ما تستوي وتحمر زي الفل"
          ]
        }
      ],
      suggestedIngredients: ["بطاطس للتحمير جنب الفراخ", "رز أبيض", "شطة للي بيحبوا الحاجة الحريفة", "سلطة خضار", "عصير ليمون طازج"]
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