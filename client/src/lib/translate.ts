import { Language } from '@/components/LanguageSelector';

/**
 * Translates text using Google Translate API via our backend endpoint
 * @param text Text to translate
 * @param targetLang Target language
 * @returns Promise with translated text
 */
export async function translateText(text: string, targetLang: Language): Promise<string> {
  try {
    // Skip translation if text is empty
    if (!text || text.trim() === '') {
      return text;
    }
    
    // Call our server-side translation API
    const response = await fetch(`/api/translate?text=${encodeURIComponent(text)}&to=${targetLang}`);
    
    if (!response.ok) {
      throw new Error(`Translation failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
}

/**
 * Translates an object of texts to all supported languages
 * @param baseText Base text in source language
 * @returns Promise with object containing translations
 */
export async function translateToAllLanguages(baseText: string): Promise<Record<Language, string>> {
  try {
    const languages: Language[] = ['ar-EG', 'ar-SA', 'en-US'];
    const translations: Record<Language, string> = {} as Record<Language, string>;
    
    // Call our server-side multi-translation API
    const response = await fetch(`/api/translate/multi?text=${encodeURIComponent(baseText)}`);
    
    if (!response.ok) {
      throw new Error(`Multi-translation failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Translation error:', error);
    
    // Return base text for all languages if translation fails
    return {
      'ar-EG': baseText,
      'ar-SA': baseText,
      'en-US': baseText
    };
  }
}

export default { translateText, translateToAllLanguages };