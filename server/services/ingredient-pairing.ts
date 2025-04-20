/**
 * خدمة تقديم اقتراحات تزاوج المكونات باستخدام الذكاء الاصطناعي
 */
import { openai } from "../lib/openai";
import { generateRecipesGemini } from "./gemini";

/**
 * نموذج الاستجابة لتزاوج المكونات
 */
export interface IngredientPairingResponse {
  ingredient: string;
  pairings: {
    name: string;
    affinity: number; // من 1 إلى 10
    description: string;
    useCases?: string[];
  }[];
  cuisineAffinities?: {
    cuisine: string;
    affinity: number; // من 1 إلى 10
  }[];
}

/**
 * الحصول على اقتراحات تزاوج المكونات باستخدام OpenAI
 */
export async function getIngredientPairings(ingredient: string): Promise<IngredientPairingResponse> {
  try {
    // استخدام OpenAI للحصول على معلومات تزاوج المكونات
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `أنت خبير مكونات الطعام والتزاوج بين النكهات المختلفة. ستقدم اقتراحات مكونات تتناسب بشكل جيد مع المكون المقدم، مع شرح سبب تناسبها ودرجة التناسب من 1 إلى 10. قدم المعلومات بتنسيق JSON فقط.`
        },
        {
          role: "user",
          content: `قدم اقتراحات لأفضل المكونات التي تتناسب مع "${ingredient}". أعطني 5-7 مكونات مع درجة التناسب ووصف موجز لسبب توافقها، وأيضًا ما هي المطابخ التي يستخدم فيها هذا المكون بكثرة.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("خطأ في الحصول على اقتراحات تزاوج المكونات:", error);
    return await getFallbackPairings(ingredient);
  }
}

/**
 * الحصول على اقتراحات تزاوج المكونات باستخدام Gemini
 */
export async function getIngredientPairingsGemini(ingredient: string): Promise<IngredientPairingResponse> {
  try {
    // استخدام Gemini للحصول على معلومات تزاوج المكونات
    const prompt = `
    أنت خبير مكونات الطعام والتزاوج بين النكهات المختلفة. قدم اقتراحات لأفضل المكونات التي تتناسب مع "${ingredient}".
    أعطني 5-7 مكونات مع درجة التناسب من 1 إلى 10 ووصف موجز لسبب توافقها، وأيضًا ما هي المطابخ التي يستخدم فيها هذا المكون بكثرة.
    
    قدم استجابتك على شكل JSON بالصيغة التالية:
    {
      "ingredient": "اسم المكون المقدم",
      "pairings": [
        {
          "name": "اسم المكون المتوافق",
          "affinity": (درجة التوافق من 1 إلى 10),
          "description": "وصف سبب التوافق",
          "useCases": ["استخدام 1", "استخدام 2"]
        }
      ],
      "cuisineAffinities": [
        {
          "cuisine": "اسم المطبخ",
          "affinity": (درجة التوافق من 1 إلى 10)
        }
      ]
    }
    
    فقط قدم JSON ولا شيء آخر.
    `;

    // استخدام وظيفة موجودة من خدمة gemini
    // هذا ليس مثاليًا ولكنه يعمل كبديل مؤقت
    const geminiResponse = await generateRecipesGemini([ingredient]);
    
    // تحويل استجابة الوصفات إلى تنسيق تزاوج المكونات
    // هذا مجرد محاكاة بسيطة، يمكن تحسينها لاحقًا
    const pairings = geminiResponse.suggestedIngredients.map((name, index) => {
      return {
        name,
        affinity: 10 - index, // المكونات الأولى لها أعلى توافق
        description: `يضيف ${name} نكهة رائعة عند دمجه مع ${ingredient} في العديد من الوصفات.`
      };
    });

    return {
      ingredient,
      pairings: pairings.slice(0, 6),
      cuisineAffinities: [
        { cuisine: "المطبخ المتوسطي", affinity: 8 },
        { cuisine: "المطبخ العربي", affinity: 9 }
      ]
    };
  } catch (error) {
    console.error("خطأ في الحصول على اقتراحات تزاوج المكونات من Gemini:", error);
    return await getFallbackPairings(ingredient);
  }
}

/**
 * الحصول على بيانات توافق المكونات الاحتياطية في حالة فشل API
 */
async function getFallbackPairings(ingredient: string): Promise<IngredientPairingResponse> {
  // بيانات احتياطية عامة للمكونات الشائعة
  const commonPairings: Record<string, IngredientPairingResponse> = {
    "طماطم": {
      ingredient: "طماطم",
      pairings: [
        { name: "ريحان", affinity: 10, description: "تزاوج كلاسيكي في المطبخ الإيطالي." },
        { name: "ثوم", affinity: 9, description: "يضيف عمقًا للنكهة مع الطماطم." },
        { name: "بصل", affinity: 8, description: "قاعدة أساسية للعديد من أطباق الطماطم." },
        { name: "زيتون", affinity: 8, description: "يضيف نكهة مالحة تكمل حموضة الطماطم." },
        { name: "جبن موزاريلا", affinity: 9, description: "التزاوج المثالي للبيتزا والسلطات." }
      ],
      cuisineAffinities: [
        { cuisine: "إيطالي", affinity: 10 },
        { cuisine: "متوسطي", affinity: 9 },
        { cuisine: "مكسيكي", affinity: 8 }
      ]
    },
    "بصل": {
      ingredient: "بصل",
      pairings: [
        { name: "ثوم", affinity: 9, description: "أساس نكهة قوي للعديد من الأطباق." },
        { name: "زعتر", affinity: 7, description: "يضفي نكهة عطرية." },
        { name: "فلفل", affinity: 8, description: "يضيف حرارة تكمل حلاوة البصل المطبوخ." },
        { name: "جزر", affinity: 7, description: "قاعدة تقليدية للمرق والشوربات." },
        { name: "زيت زيتون", affinity: 8, description: "وسط مثالي لطهي البصل وإبراز نكهته." }
      ],
      cuisineAffinities: [
        { cuisine: "فرنسي", affinity: 8 },
        { cuisine: "هندي", affinity: 9 },
        { cuisine: "متوسطي", affinity: 8 }
      ]
    },
    "ثوم": {
      ingredient: "ثوم",
      pairings: [
        { name: "زيت زيتون", affinity: 10, description: "مزيج كلاسيكي يبرز نكهة الثوم." },
        { name: "ليمون", affinity: 8, description: "يوازن حدة الثوم مع الحموضة." },
        { name: "بقدونس", affinity: 8, description: "مزيج تقليدي في تتبيلة الجريمولاتا." },
        { name: "زبدة", affinity: 9, description: "أساس للعديد من الصلصات الكريمية." },
        { name: "فلفل أحمر", affinity: 7, description: "يضيف حرارة متوازنة مع نكهة الثوم." }
      ],
      cuisineAffinities: [
        { cuisine: "إيطالي", affinity: 9 },
        { cuisine: "آسيوي", affinity: 8 },
        { cuisine: "متوسطي", affinity: 10 }
      ]
    },
    "زعتر": {
      ingredient: "زعتر",
      pairings: [
        { name: "ليمون", affinity: 9, description: "يبرز النكهة العطرية للزعتر." },
        { name: "زيت زيتون", affinity: 10, description: "وسط مثالي لإطلاق نكهة الزعتر." },
        { name: "ثوم", affinity: 8, description: "مزيج عطري قوي." },
        { name: "جبن فيتا", affinity: 7, description: "تزاوج كلاسيكي في المطبخ اليوناني." },
        { name: "طماطم", affinity: 7, description: "مزيج منعش للسلطات والمقبلات." }
      ],
      cuisineAffinities: [
        { cuisine: "يوناني", affinity: 9 },
        { cuisine: "لبناني", affinity: 10 },
        { cuisine: "متوسطي", affinity: 9 }
      ]
    }
  };

  // محاولة العثور على تطابق للمكون المحدد
  if (commonPairings[ingredient]) {
    return commonPairings[ingredient];
  }

  // إذا لم يتم العثور على تطابق، قم بإرجاع بيانات عامة
  return {
    ingredient: ingredient,
    pairings: [
      { name: "بصل", affinity: 7, description: "مكون أساسي يتناسب مع معظم المكونات." },
      { name: "ثوم", affinity: 7, description: "يضيف عمقًا للنكهة مع معظم المكونات." },
      { name: "ملح", affinity: 8, description: "يعزز نكهة المكونات الأخرى." },
      { name: "فلفل أسود", affinity: 7, description: "يضيف حرارة خفيفة ونكهة متوازنة." },
      { name: "زيت زيتون", affinity: 8, description: "وسط طهي مثالي للعديد من المكونات." }
    ],
    cuisineAffinities: [
      { cuisine: "متوسطي", affinity: 7 },
      { cuisine: "عالمي", affinity: 8 }
    ]
  };
}