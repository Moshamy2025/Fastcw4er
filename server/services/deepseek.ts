import { RecipeResult } from './openai';
import fetch from 'node-fetch';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const API_URL = "https://api.deepseek.com/v1/chat/completions";

/**
 * Generate recipes based on provided ingredients using DeepSeek AI
 */
export async function generateRecipesDeepSeek(ingredients: string[]): Promise<RecipeResult> {
  try {
    if (!DEEPSEEK_API_KEY) {
      console.warn("DeepSeek API key is missing, using fallback data");
      return getFallbackRecipes(ingredients);
    }

    const joinedIngredients = ingredients.join(", ");
    
    const prompt = `
    أنا طباخ محترف. أحتاج وصفات سهلة وسريعة باستخدام المكونات المتوفرة فقط.

    المكونات المتوفرة: ${joinedIngredients}

    قم بإنشاء ٣ وصفات مختلفة أو أقل حسب المكونات المتوفرة، واشرح كل وصفة بإيجاز.
    
    أيضاً، اقترح ٥ مكونات إضافية يمكن إضافتها للحصول على وصفات أكثر تنوعاً.

    أريد النتيجة بتنسيق JSON بالشكل التالي فقط:
    {
      "recipes": [
        {
          "title": "عنوان الوصفة",
          "description": "وصف موجز للوصفة",
          "ingredients": ["المكون 1", "المكون 2", ...],
          "instructions": ["الخطوة 1", "الخطوة 2", ...]
        }
      ],
      "suggestedIngredients": ["مكون مقترح 1", "مكون مقترح 2", ...]
    }

    إذا لم تكن المكونات كافية، أرجع مصفوفة recipes فارغة واقترح مكونات إضافية فقط.
    `;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("DeepSeek API Error:", errorData);
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const data: any = await response.json();
      let result;
      try {
        result = JSON.parse(data.choices[0].message.content || "{}");
      } catch (parseError) {
        console.error("Failed to parse DeepSeek response JSON:", parseError);
        result = { recipes: [], suggestedIngredients: [] };
      }
      
      return {
        recipes: result.recipes || [],
        suggestedIngredients: result.suggestedIngredients || [],
      };
    } catch (apiError: any) {
      console.error("DeepSeek API Error:", apiError);
      
      // Handle API errors
      return getFallbackRecipes(ingredients);
    }
  } catch (error) {
    console.error("General Error in generateRecipesDeepSeek:", error);
    return getFallbackRecipes(ingredients);
  }
}

// Define recipe data type for type safety
type RecipeData = {
  [key: string]: RecipeResult;
};

// Fallback data for when API fails
const fallbackRecipes: RecipeData = {
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
      },
      {
        title: "عجة البيض",
        description: "عجة بيض شهية ولذيذة",
        ingredients: ["3 بيضات", "1/4 كوب حليب", "ملح وفلفل حسب الرغبة", "زيت للقلي"],
        instructions: [
          "اخفق البيض مع الحليب والملح والفلفل في وعاء",
          "سخن الزيت في مقلاة على نار متوسطة",
          "صب خليط البيض في المقلاة",
          "اطهي البيض مع التقليب حتى ينضج"
        ]
      }
    ],
    suggestedIngredients: ["جبنة", "خبز", "طماطم", "بصل", "فلفل أخضر"]
  },
  "دجاج": {
    recipes: [
      {
        title: "دجاج مشوي بالأعشاب",
        description: "دجاج مشوي طري ولذيذ بالأعشاب",
        ingredients: ["4 قطع دجاج", "2 ملعقة زيت زيتون", "ملح وفلفل", "1 ملعقة ثوم مفروم", "أعشاب (زعتر، إكليل الجبل)"],
        instructions: [
          "اخلط الزيت مع الثوم والأعشاب والملح والفلفل",
          "تبل قطع الدجاج بالخليط وضعها في صينية",
          "اتركها في الثلاجة لمدة ساعة على الأقل",
          "اشوي الدجاج في الفرن على حرارة 180 درجة لمدة 40-45 دقيقة"
        ]
      },
      {
        title: "كاري الدجاج",
        description: "طبق هندي لذيذ ومتبل من الدجاج",
        ingredients: ["500 جرام دجاج مقطع", "بصلة مفرومة", "2 فص ثوم", "2 ملعقة معجون طماطم", "ملعقة بهارات كاري", "ملح", "زيت"],
        instructions: [
          "سخن الزيت وأضف البصل والثوم وقلبهم حتى يذبلوا",
          "أضف بهارات الكاري وقلب لمدة دقيقة",
          "أضف الدجاج وقلبه حتى يتغير لونه",
          "أضف معجون الطماطم والملح وكوب من الماء",
          "غطِ المقلاة واطهي على نار هادئة لمدة 20-25 دقيقة"
        ]
      }
    ],
    suggestedIngredients: ["أرز", "بطاطس", "بصل", "ثوم", "ليمون"]
  },
  "أرز": {
    recipes: [
      {
        title: "أرز بالخضار",
        description: "طبق أرز بسيط مع الخضروات المشكلة",
        ingredients: ["2 كوب أرز", "1 جزر مقطع", "1 فلفل أخضر مقطع", "1 بصلة مفرومة", "2 ملعقة زيت", "ملح وبهارات"],
        instructions: [
          "اغسل الأرز ودعه ينقع لمدة 15 دقيقة ثم صفّه",
          "سخن الزيت وأضف البصل وقلبه حتى يذبل",
          "أضف الجزر والفلفل وقلبهم لمدة 3-4 دقائق",
          "أضف الأرز وقلبه مع الخضار",
          "أضف 4 أكواب ماء والملح والبهارات",
          "اطهي على نار هادئة لمدة 20 دقيقة حتى ينضج الأرز"
        ]
      }
    ],
    suggestedIngredients: ["دجاج", "لحم", "بازلاء", "ذرة", "زعفران"]
  },
  "بطاطس": {
    recipes: [
      {
        title: "بطاطس مقلية",
        description: "بطاطس مقلية مقرمشة ولذيذة",
        ingredients: ["4 حبات بطاطس كبيرة", "زيت للقلي", "ملح"],
        instructions: [
          "قشر البطاطس وقطعها إلى شرائح طويلة",
          "اغسل البطاطس بالماء البارد وجففها جيداً",
          "سخن الزيت في مقلاة عميقة",
          "اقلي البطاطس حتى تصبح ذهبية ومقرمشة",
          "صفّها من الزيت ورش الملح عليها"
        ]
      },
      {
        title: "بطاطس مهروسة",
        description: "بطاطس مهروسة كريمية وطرية",
        ingredients: ["5 حبات بطاطس متوسطة", "نصف كوب حليب", "2 ملعقة زبدة", "ملح وفلفل"],
        instructions: [
          "قشر البطاطس وقطعها إلى مكعبات",
          "اسلق البطاطس في ماء مملح حتى تنضج",
          "صفّي البطاطس واهرسها",
          "سخن الحليب والزبدة واضفهما تدريجياً إلى البطاطس المهروسة",
          "أضف الملح والفلفل حسب الرغبة واخلط جيداً"
        ]
      }
    ],
    suggestedIngredients: ["جبنة", "ثوم", "كريمة", "بقدونس", "زبدة"]
  },
  "بصل,طماطم": {
    recipes: [
      {
        title: "صلصة البصل والطماطم",
        description: "صلصة بسيطة مثالية للسندويشات أو المعكرونة",
        ingredients: ["3 حبات طماطم", "1 بصلة كبيرة", "2 ملعقة زيت زيتون", "ملح وفلفل أسود", "أعشاب حسب الرغبة"],
        instructions: [
          "قطع البصل إلى شرائح رفيعة والطماطم إلى مكعبات",
          "سخن الزيت في مقلاة على نار متوسطة",
          "أضف البصل وقلبه حتى يصبح شفافاً",
          "أضف الطماطم والملح والفلفل والأعشاب",
          "اطهي على نار هادئة لمدة 10-15 دقيقة"
        ]
      }
    ],
    suggestedIngredients: ["ثوم", "فلفل أخضر", "زيتون", "معكرونة", "دجاج"]
  },
  "بيض,جبنة": {
    recipes: [
      {
        title: "أومليت بالجبنة",
        description: "أومليت شهي محشو بالجبنة",
        ingredients: ["3 بيضات", "50 جرام جبنة مبشورة", "ملح وفلفل", "زيت أو زبدة للقلي"],
        instructions: [
          "اخفق البيض في وعاء مع الملح والفلفل",
          "سخن الزيت في مقلاة على نار متوسطة",
          "صب خليط البيض في المقلاة واتركه لمدة دقيقة",
          "رش الجبنة على نصف الأومليت",
          "اطوِ النصف الآخر عليه واطهي لمدة دقيقة إضافية"
        ]
      }
    ],
    suggestedIngredients: ["طماطم", "فطر", "بصل", "خبز", "فلفل أخضر"]
  },
  "دجاج,أرز": {
    recipes: [
      {
        title: "كبسة دجاج",
        description: "طبق شهير من المطبخ العربي من الأرز والدجاج",
        ingredients: ["دجاجة مقطعة", "2 كوب أرز", "2 بصل", "2 طماطم", "بهارات كبسة", "ملح", "زيت"],
        instructions: [
          "انقع الأرز في ماء لمدة 30 دقيقة",
          "في قدر كبير، سخن الزيت وقلي قطع الدجاج حتى تصبح ذهبية من كل الجوانب",
          "أضف البصل المفروم وقلبه حتى يذبل",
          "أضف الطماطم المفرومة والبهارات والملح",
          "أضف 4 أكواب ماء ساخن واطهي الدجاج لمدة 20 دقيقة",
          "أخرج الدجاج وأضف الأرز المصفى إلى المرق",
          "غطِ القدر واطهي على نار هادئة لمدة 20 دقيقة",
          "ضع الدجاج فوق الأرز وقدمه ساخناً"
        ]
      }
    ],
    suggestedIngredients: ["لوز", "زبيب", "بصل", "هيل", "قرفة"]
  }
};

/**
 * Get fallback recipes when API is unavailable
 */
function getFallbackRecipes(ingredients: string[]): RecipeResult {
  // تحويل المكونات إلى أحرف صغيرة وإزالة المسافات الزائدة
  const normalizedIngredients = ingredients.map(i => i.trim().toLowerCase());
  
  // إنشاء مفتاح منظم من المكونات
  const key = [...normalizedIngredients].sort().join(',');
  
  // البحث عن تطابق مباشر في بيانات الاحتياطية
  if (fallbackRecipes[key]) {
    console.log("وجدنا تطابق مباشر للمكونات:", key);
    return fallbackRecipes[key];
  }
  
  // البحث عن المكونات المنفردة
  // إذا كان هناك مكون واحد فقط, نبحث عنه في المكونات المتوفرة
  if (normalizedIngredients.length === 1) {
    const singleIngredient = normalizedIngredients[0];
    
    // البحث في المفاتيح عن وجود نفس المكون
    for (const [fallbackKey, recipes] of Object.entries(fallbackRecipes)) {
      if (fallbackKey === singleIngredient) {
        console.log("وجدنا تطابق لمكون منفرد:", singleIngredient);
        return recipes;
      }
    }
  }
  
  // البحث عن تطابق جزئي - إذا كانت بعض المكونات المدخلة موجودة في وصفاتنا
  for (const ingredient of normalizedIngredients) {
    if (fallbackRecipes[ingredient]) {
      console.log("وجدنا تطابق جزئي للمكون:", ingredient);
      return fallbackRecipes[ingredient];
    }
  }
  
  // البحث عن تطابق في مجموعات المكونات
  // نبحث إذا كانت المكونات المدخلة تحتوي على مكونات وصفة معينة
  for (const [fallbackKey, recipes] of Object.entries(fallbackRecipes)) {
    const fallbackIngredients = fallbackKey.split(',');
    
    // البحث عن تطابق دقيق - كل مكونات الوصفة موجودة في المكونات المدخلة
    const allIngredientsMatch = fallbackIngredients.every(ing => 
      normalizedIngredients.some(i => i.includes(ing) || ing.includes(i))
    );
    
    if (allIngredientsMatch) {
      console.log("وجدنا تطابق كامل للمكونات:", fallbackKey);
      return recipes;
    }
    
    // البحث عن تطابق جزئي - على الأقل مكون واحد موجود
    const anyIngredientMatches = fallbackIngredients.some(ing => 
      normalizedIngredients.some(i => i.includes(ing) || ing.includes(i))
    );
    
    if (anyIngredientMatches) {
      console.log("وجدنا تطابق جزئي للمكونات:", fallbackKey);
      return recipes;
    }
  }
  
  // إذا لم نجد أي تطابق، نرجع اقتراحات عامة
  console.log("لم نجد أي تطابق، نرجع اقتراحات عامة");
  return {
    recipes: [],
    suggestedIngredients: [
      "طماطم", "بصل", "ثوم", "بطاطس", "جزر", 
      "دجاج", "لحم", "بيض", "أرز", "معكرونة"
    ]
  };
}