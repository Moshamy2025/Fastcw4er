/**
 * وحدة لتحميل المتغيرات البيئية للواجهة الأمامية
 * هذا الملف سيتم استخدامه بواسطة Vite عن طريق استيراده في الملفات التي تحتاج إلى المتغيرات البيئية
 */

// تحديد نوع المتغيرات البيئية
export interface EnvVariables {
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_APP_ID: string;
}

// الحصول على المتغيرات البيئية من Vite
// (تذكر أن Vite يستخدم import.meta.env للوصول إلى المتغيرات البيئية)
export const env: EnvVariables = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || '',
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'fast-recipe-2025',
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// وظيفة للتحقق من وجود المتغيرات الضرورية للتطبيق
export function validateEnv(): string[] {
  const missingVars: string[] = [];
  
  if (!env.VITE_FIREBASE_API_KEY) {
    missingVars.push('VITE_FIREBASE_API_KEY');
  }
  
  if (!env.VITE_FIREBASE_PROJECT_ID) {
    missingVars.push('VITE_FIREBASE_PROJECT_ID');
  }
  
  if (!env.VITE_FIREBASE_APP_ID) {
    missingVars.push('VITE_FIREBASE_APP_ID');
  }
  
  return missingVars;
}

// سجل المتغيرات البيئية المتاحة (مع إخفاء القيم الحساسة)
export function logEnvStatus(): void {
  console.log('Environment Variables Status:');
  console.log('- VITE_FIREBASE_API_KEY:', env.VITE_FIREBASE_API_KEY ? '✓ متوفر' : '✗ مفقود');
  console.log('- VITE_FIREBASE_PROJECT_ID:', env.VITE_FIREBASE_PROJECT_ID ? '✓ متوفر' : '✗ مفقود');
  console.log('- VITE_FIREBASE_APP_ID:', env.VITE_FIREBASE_APP_ID ? '✓ متوفر' : '✗ مفقود');
  
  const missingVars = validateEnv();
  if (missingVars.length > 0) {
    console.warn('⚠️ متغيرات بيئية مفقودة:', missingVars);
    console.warn('بعض وظائف التطبيق قد لا تعمل بشكل صحيح.');
  }
}

export default env;