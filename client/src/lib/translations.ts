import { Language } from '@/components/LanguageSelector';

export const translations: Record<string, Record<Language, string>> = {
  // Header
  'appName': {
    'ar-EG': 'وصفات سريعة',
    'ar-SA': 'وصفات سريعة',
    'en-US': 'Fast Recipe'
  },
  'tagline': {
    'ar-EG': 'دوّر على أكلات من المكونات اللي عندك في البيت',
    'ar-SA': 'ابحث عن وصفات من المكونات المتوفرة لديك',
    'en-US': 'Find recipes from ingredients you have at home'
  },
  'searchButton': {
    'ar-EG': 'دوّر',
    'ar-SA': 'ابحث',
    'en-US': 'Search'
  },

  // Search Bar
  'recipeNamePlaceholder': {
    'ar-EG': 'ابحث عن وصفة بالاسم...',
    'ar-SA': 'ابحث عن وصفة بالاسم...',
    'en-US': 'Search for a recipe by name...'
  },
  'or': {
    'ar-EG': 'أو',
    'ar-SA': 'أو',
    'en-US': 'OR'
  },
  'ingredientPlaceholder': {
    'ar-EG': 'اكتب المكون اللي عندك في البيت...',
    'ar-SA': 'اكتب المكون المتوفر لديك...',
    'en-US': 'Enter an ingredient you have...'
  },
  'addIngredient': {
    'ar-EG': 'حطّه',
    'ar-SA': 'أضف',
    'en-US': 'Add'
  },
  'findRecipes': {
    'ar-EG': 'طلّعلي أكلات',
    'ar-SA': 'ابحث عن وصفات',
    'en-US': 'Find Recipes'
  },

  // Ingredients
  'yourIngredients': {
    'ar-EG': 'المكونات عندك',
    'ar-SA': 'المكونات المتوفرة لديك',
    'en-US': 'Your Ingredients'
  },
  'noIngredients': {
    'ar-EG': 'مفيش مكونات لسه. أضف المكونات اللي عندك في البيت',
    'ar-SA': 'لا توجد مكونات بعد. أضف المكونات المتوفرة لديك',
    'en-US': 'No ingredients yet. Add ingredients you have.'
  },
  'clearAll': {
    'ar-EG': 'امسح الكل',
    'ar-SA': 'مسح الكل',
    'en-US': 'Clear All'
  },

  // Recipe Results
  'foundRecipes': {
    'ar-EG': 'لقينا وصفات ليك',
    'ar-SA': 'الوصفات التي تم العثور عليها',
    'en-US': 'Found Recipes'
  },
  'noRecipesFound': {
    'ar-EG': 'مفيش وصفات باالمكونات دي. جرب مكونات تانية!',
    'ar-SA': 'لم يتم العثور على وصفات بهذه المكونات. حاول بمكونات أخرى!',
    'en-US': 'No recipes found with these ingredients. Try different ones!'
  },
  'ingredients': {
    'ar-EG': 'المكونات',
    'ar-SA': 'المكونات',
    'en-US': 'Ingredients'
  },
  'instructions': {
    'ar-EG': 'طريقة التحضير',
    'ar-SA': 'طريقة التحضير',
    'en-US': 'Instructions'
  },
  'watchVideo': {
    'ar-EG': 'شوف الفيديو',
    'ar-SA': 'شاهد الفيديو',
    'en-US': 'Watch Video'
  },

  // Suggested Ingredients
  'suggestedIngredients': {
    'ar-EG': 'مكونات مقترحة',
    'ar-SA': 'مكونات مقترحة',
    'en-US': 'Suggested Ingredients'
  },
  'tryAdding': {
    'ar-EG': 'جرب تضيف',
    'ar-SA': 'جرب إضافة',
    'en-US': 'Try adding'
  },

  // Substitutes
  'ingredientSubstitutes': {
    'ar-EG': 'بدائل المكونات',
    'ar-SA': 'بدائل المكونات',
    'en-US': 'Ingredient Substitutes'
  },
  'enterIngredient': {
    'ar-EG': 'أدخل اسم المكون للبحث عن بدائله...',
    'ar-SA': 'أدخل اسم المكون للبحث عن بدائله...',
    'en-US': 'Enter an ingredient to find substitutes...'
  },
  'search': {
    'ar-EG': 'بحث',
    'ar-SA': 'بحث',
    'en-US': 'Search'
  },
  'commonIngredients': {
    'ar-EG': 'مكونات شائعة',
    'ar-SA': 'مكونات شائعة',
    'en-US': 'Common Ingredients'
  },
  'recentSearches': {
    'ar-EG': 'عمليات بحث سابقة',
    'ar-SA': 'عمليات بحث سابقة',
    'en-US': 'Recent Searches'
  },
  'noRecentSearches': {
    'ar-EG': 'لم تقم بأي عمليات بحث بعد',
    'ar-SA': 'لم تقم بأي عمليات بحث بعد',
    'en-US': 'No recent searches yet'
  },
  'substitutesFor': {
    'ar-EG': 'بدائل لـ',
    'ar-SA': 'بدائل لـ',
    'en-US': 'Substitutes for'
  },
  'ratio': {
    'ar-EG': 'النسبة',
    'ar-SA': 'النسبة',
    'en-US': 'Ratio'
  },
  'noSubstitutesFound': {
    'ar-EG': 'لم نجد بدائل لهذا المكون. حاول البحث عن مكون آخر.',
    'ar-SA': 'لم نعثر على بدائل لهذا المكون. حاول البحث عن مكون آخر.',
    'en-US': 'No substitutes found for this ingredient. Try another one.'
  },

  // Footer
  'footerTagline': {
    'ar-EG': 'ابتكر أكلات جديدة من المكونات اللي موجودة في بيتك',
    'ar-SA': 'ابتكر أطباقاً جديدة من المكونات المتوفرة لديك',
    'en-US': 'Create new dishes from ingredients you already have'
  },
  'rateUs': {
    'ar-EG': 'متنساش تديلنا تقييم لو الموقع عجبك',
    'ar-SA': 'لا تنسى تقييمنا إذا أعجبك الموقع',
    'en-US': 'Don\'t forget to rate us if you like the site'
  },
  'madeForYou': {
    'ar-EG': 'عملناه عشانك',
    'ar-SA': 'صنعناه من أجلك',
    'en-US': 'Made for you'
  }
};

export default translations;