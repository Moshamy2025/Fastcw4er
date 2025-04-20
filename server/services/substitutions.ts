/**
 * Service to handle ingredient substitution recommendations
 */

import { RecipeResult } from "./openai";

// Define the structure of a substitution response
export interface SubstitutionResponse {
  originalIngredient: string;
  substitutes: {
    name: string;
    ratio: string;
    notes?: string;
  }[];
}

// Common substitution data for fallback
const commonSubstitutions: Record<string, SubstitutionResponse> = {
  "دقيق": {
    originalIngredient: "دقيق أبيض",
    substitutes: [
      { 
        name: "دقيق القمح الكامل", 
        ratio: "1:1", 
        notes: "سيجعل الطعام أكثر كثافة وسيعطي نكهة أقوى"
      },
      { 
        name: "دقيق اللوز", 
        ratio: "1:1", 
        notes: "خيار منخفض الكربوهيدرات، مناسب للأطعمة الخالية من الغلوتين"
      },
      { 
        name: "دقيق الذرة", 
        ratio: "3/4 كوب دقيق ذرة لكل كوب دقيق", 
        notes: "مناسب للخبز والتكثيف" 
      }
    ]
  },
  "سكر": {
    originalIngredient: "سكر أبيض",
    substitutes: [
      { 
        name: "عسل", 
        ratio: "3/4 كوب عسل لكل كوب سكر", 
        notes: "قلل السوائل الأخرى بمقدار 1/4 كوب لكل كوب عسل" 
      },
      { 
        name: "سكر جوز الهند", 
        ratio: "1:1" 
      },
      { 
        name: "شراب القيقب", 
        ratio: "3/4 كوب شراب لكل كوب سكر", 
        notes: "قلل السوائل الأخرى قليلاً" 
      }
    ]
  },
  "زبدة": {
    originalIngredient: "زبدة",
    substitutes: [
      { 
        name: "زيت جوز الهند", 
        ratio: "1:1", 
        notes: "جيد للخبز، يعمل بشكل أفضل عند درجة حرارة الغرفة" 
      },
      { 
        name: "زيت الزيتون", 
        ratio: "3/4 كوب زيت لكل كوب زبدة", 
        notes: "أفضل للوصفات المالحة" 
      },
      { 
        name: "صلصة التفاح", 
        ratio: "1/2 كوب صلصة تفاح لكل كوب زبدة", 
        notes: "لتقليل الدهون في المخبوزات" 
      }
    ]
  },
  "بيض": {
    originalIngredient: "بيض",
    substitutes: [
      { 
        name: "بذور الكتان المطحونة + ماء", 
        ratio: "1 ملعقة كبيرة بذور كتان + 3 ملاعق ماء = بيضة واحدة", 
        notes: "اتركها لمدة 5 دقائق حتى تتكاثف" 
      },
      { 
        name: "موز مهروس", 
        ratio: "1/4 كوب موز مهروس = بيضة واحدة", 
        notes: "مناسب للمخبوزات الحلوة" 
      },
      { 
        name: "الزبادي", 
        ratio: "1/4 كوب زبادي = بيضة واحدة" 
      }
    ]
  },
  "حليب": {
    originalIngredient: "حليب",
    substitutes: [
      { 
        name: "حليب اللوز", 
        ratio: "1:1" 
      },
      { 
        name: "حليب جوز الهند", 
        ratio: "1:1", 
        notes: "يضيف نكهة جوز الهند" 
      },
      { 
        name: "حليب الصويا", 
        ratio: "1:1", 
        notes: "بديل نباتي شائع" 
      }
    ]
  },
  "زيت زيتون": {
    originalIngredient: "زيت زيتون",
    substitutes: [
      { 
        name: "زيت الكانولا", 
        ratio: "1:1", 
        notes: "نكهة أخف" 
      },
      { 
        name: "زيت الأفوكادو", 
        ratio: "1:1", 
        notes: "خيار صحي مع نقطة دخان عالية" 
      },
      { 
        name: "زيت جوز الهند", 
        ratio: "1:1", 
        notes: "يضيف نكهة جوز الهند" 
      }
    ]
  },
  "خل": {
    originalIngredient: "خل أبيض",
    substitutes: [
      { 
        name: "عصير ليمون", 
        ratio: "1:1", 
        notes: "يعطي حموضة مشابهة مع نكهة حمضية" 
      },
      { 
        name: "خل التفاح", 
        ratio: "1:1", 
        notes: "نكهة أقوى قليلاً" 
      },
      { 
        name: "خل النبيذ الأبيض", 
        ratio: "1:1", 
        notes: "نكهة أكثر دقة" 
      }
    ]
  },
  "ملح": {
    originalIngredient: "ملح طعام",
    substitutes: [
      { 
        name: "ملح البحر", 
        ratio: "1:1" 
      },
      { 
        name: "صلصة الصويا منخفضة الصوديوم", 
        ratio: "استخدم بحذر حسب الذوق", 
        notes: "يضيف نكهة أومامي" 
      },
      { 
        name: "أعشاب طازجة", 
        ratio: "استخدم حسب الذوق", 
        notes: "لإضافة نكهة بدون ملح" 
      }
    ]
  },
  "بصل": {
    originalIngredient: "بصل",
    substitutes: [
      { 
        name: "كراث", 
        ratio: "1:1", 
        notes: "نكهة أخف" 
      },
      { 
        name: "بصل أخضر", 
        ratio: "1:1", 
        notes: "نكهة أكثر تميزاً" 
      },
      { 
        name: "مسحوق البصل", 
        ratio: "1 ملعقة صغيرة لكل 1/2 كوب بصل طازج" 
      }
    ]
  },
  "ثوم": {
    originalIngredient: "ثوم",
    substitutes: [
      { 
        name: "مسحوق الثوم", 
        ratio: "1/8 ملعقة صغيرة لكل فص ثوم" 
      },
      { 
        name: "الثوم المعمر", 
        ratio: "1 ملعقة كبيرة لكل فص ثوم", 
        notes: "نكهة أخف" 
      },
      { 
        name: "الكراث", 
        ratio: "1/2 كوب كراث لكل فص ثوم", 
        notes: "نكهة مختلفة لكن مقبولة" 
      }
    ]
  },
  "طماطم": {
    originalIngredient: "طماطم طازجة",
    substitutes: [
      { 
        name: "معجون طماطم + ماء", 
        ratio: "2-3 ملاعق كبيرة معجون + 1/4 كوب ماء = كوب طماطم" 
      },
      { 
        name: "طماطم معلبة", 
        ratio: "1:1" 
      },
      { 
        name: "صلصة طماطم", 
        ratio: "1/2 كوب صلصة لكل كوب طماطم", 
        notes: "قد تحتاج لتعديل التوابل" 
      }
    ]
  },
  "ليمون": {
    originalIngredient: "عصير ليمون",
    substitutes: [
      { 
        name: "خل أبيض", 
        ratio: "1/2 الكمية من الخل لكل كمية من الليمون" 
      },
      { 
        name: "عصير ليمون معبأ", 
        ratio: "1:1", 
        notes: "لكن النكهة قد تكون أقل حدة" 
      },
      { 
        name: "خل التفاح", 
        ratio: "1/2 الكمية من الخل لكل كمية من الليمون" 
      }
    ]
  }
};

/**
 * Get substitution suggestions for a given ingredient
 */
export async function getIngredientSubstitutes(ingredient: string): Promise<SubstitutionResponse> {
  const normalizedIngredient = ingredient.trim().toLowerCase();
  
  // Check if we have a common substitution for this ingredient
  for (const [key, value] of Object.entries(commonSubstitutions)) {
    if (key.toLowerCase().includes(normalizedIngredient) || 
        normalizedIngredient.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // If no match was found in our common substitutes, return a generic message
  return {
    originalIngredient: ingredient,
    substitutes: [
      { name: "لم نتمكن من إيجاد بدائل محددة لهذا المكون", ratio: "غير متوفر" }
    ]
  };
}