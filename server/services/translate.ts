import { translate } from '@vitalets/google-translate-api';

/**
 * Translate text using Google Translate API
 * @param text Text to translate
 * @param targetLang Target language code (e.g. 'ar', 'en')
 * @returns Promise with translated text
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
  try {
    // Remove region code if present (e.g. 'ar-EG' -> 'ar')
    const langCode = targetLang.split('-')[0];
    
    // Skip translation if text is empty
    if (!text || text.trim() === '') {
      return text;
    }
    
    const result = await translate(text, { to: langCode });
    return result.text;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
}

/**
 * Translate text to multiple languages
 * @param text Text to translate
 * @param targetLangs Array of target language codes
 * @returns Promise with object containing translations
 */
export async function translateToMultipleLanguages(
  text: string, 
  targetLangs: string[]
): Promise<Record<string, string>> {
  try {
    const result: Record<string, string> = {};
    
    for (const lang of targetLangs) {
      result[lang] = await translateText(text, lang);
    }
    
    return result;
  } catch (error) {
    console.error('Multi-language translation error:', error);
    
    // Return original text for all languages if translation fails
    return targetLangs.reduce((acc, lang) => {
      acc[lang] = text;
      return acc;
    }, {} as Record<string, string>);
  }
}