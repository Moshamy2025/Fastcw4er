// config/index.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// تعريف الأنواع
/**
 * @typedef {Object} DatabaseConfig
 * @property {string} url - رابط قاعدة البيانات
 * @property {string} host - مضيف قاعدة البيانات
 * @property {number} port - منفذ قاعدة البيانات
 * @property {string} user - اسم مستخدم قاعدة البيانات
 * @property {string} password - كلمة مرور قاعدة البيانات
 * @property {string} database - اسم قاعدة البيانات
 */

/**
 * @typedef {Object} AppConfig
 * @property {number} port - منفذ التطبيق
 * @property {string} environment - بيئة التطبيق
 * @property {boolean} isProduction - هل التطبيق في وضع الإنتاج
 */

/**
 * @typedef {Object} SessionConfig
 * @property {string} secret - كلمة سر الجلسة
 * @property {number} maxAge - مدة صلاحية الجلسة بالمللي ثانية
 */

/**
 * @typedef {Object} FirebaseConfig
 * @property {string} apiKey - مفتاح Firebase API
 * @property {string} projectId - معرف مشروع Firebase
 * @property {string} appId - معرف تطبيق Firebase
 */

/**
 * @typedef {Object} ApiConfig
 * @property {string} openai - مفتاح OpenAI API
 * @property {string} gemini - مفتاح Gemini API
 * @property {string} deepseek - مفتاح Deepseek API
 * @property {string} youtube - مفتاح YouTube API
 * @property {string} sendgrid - مفتاح SendGrid API
 */

/**
 * @typedef {Object} EmailConfig
 * @property {string} contactEmail - البريد الإلكتروني للاتصال
 * @property {string} fromName - اسم المرسل
 */

/**
 * @typedef {Object} Config
 * @property {AppConfig} app - تكوين التطبيق
 * @property {DatabaseConfig} database - تكوين قاعدة البيانات
 * @property {SessionConfig} session - تكوين الجلسة
 * @property {FirebaseConfig} firebase - تكوين Firebase
 * @property {ApiConfig} api - تكوين واجهات برمجة التطبيقات
 * @property {EmailConfig} email - تكوين البريد الإلكتروني
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تحديد ما إذا كان التطبيق في وضع الإنتاج أم لا
const isProduction = process.env.NODE_ENV === 'production';

// مسار لمجلد السيكرتس (الملفات السرية)
const secretsDir = path.join(__dirname, 'secrets');

/**
 * قراءة ملف سري من مجلد السيكرتس
 * @param {string} filename - اسم الملف
 * @param {string} defaultValue - القيمة الافتراضية إذا لم يوجد الملف
 * @returns {string} - محتويات الملف أو القيمة الافتراضية
 */
const readSecretFile = (filename, defaultValue = '') => {
  const filePath = path.join(secretsDir, filename);
  
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8').trim();
    }
    
    // إذا لم يتم العثور على الملف، نعيد القيمة الافتراضية
    return defaultValue;
  } catch (error) {
    console.error(`Error reading secret file: ${filename}`, error);
    return defaultValue;
  }
};

/**
 * الحصول على قيمة متغير البيئة أو القيمة من ملف سري
 * @param {string} key - اسم المتغير
 * @param {string} secretFileName - اسم ملف السيكرت
 * @param {string} defaultValue - القيمة الافتراضية 
 * @returns {string} - القيمة المطلوبة
 */
const getEnvOrSecret = (key, secretFileName, defaultValue = '') => {
  // أولاً نفحص متغير البيئة
  if (process.env[key]) {
    return process.env[key];
  }
  
  // إذا لم نجده، نفحص ملف السيكرت
  return readSecretFile(secretFileName, defaultValue);
};

// إيجاد أو إنشاء مجلد السيكرتس إذا لم يكن موجوداً
if (!fs.existsSync(secretsDir)) {
  fs.mkdirSync(secretsDir, { recursive: true });
  console.log(`Created secrets directory at: ${secretsDir}`);
}

// تكوين التطبيق
const config = {
  app: {
    port: parseInt(process.env.PORT || '5000', 10),
    environment: process.env.NODE_ENV || 'development',
    isProduction,
  },
  
  // تكوين قاعدة البيانات
  database: {
    url: getEnvOrSecret('DATABASE_URL', 'database_url.txt', 
         'postgresql://postgres:password@localhost:5432/quickrecipe'),
    host: getEnvOrSecret('PGHOST', 'pg_host.txt', 'localhost'),
    port: parseInt(getEnvOrSecret('PGPORT', 'pg_port.txt', '5432'), 10),
    user: getEnvOrSecret('PGUSER', 'pg_user.txt', 'postgres'),
    password: getEnvOrSecret('PGPASSWORD', 'pg_password.txt', 'password'),
    database: getEnvOrSecret('PGDATABASE', 'pg_database.txt', 'quickrecipe'),
  },
  
  // تكوين الجلسة
  session: {
    secret: getEnvOrSecret('SESSION_SECRET', 'session_secret.txt', 
              'your_random_session_secret_here_please_change_this_in_production'),
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 يوم
  },
  
  // تكوين Firebase للمصادقة
  firebase: {
    apiKey: getEnvOrSecret('VITE_FIREBASE_API_KEY', 'firebase_api_key.txt', ''),
    projectId: getEnvOrSecret('VITE_FIREBASE_PROJECT_ID', 'firebase_project_id.txt', 'fast-recipe-2025'),
    appId: getEnvOrSecret('VITE_FIREBASE_APP_ID', 'firebase_app_id.txt', ''),
  },
  
  // تكوين مفاتيح واجهات برمجة التطبيقات
  api: {
    openai: getEnvOrSecret('OPENAI_API_KEY', 'openai_api_key.txt', ''),
    gemini: getEnvOrSecret('GEMINI_API_KEY', 'gemini_api_key.txt', ''),
    deepseek: getEnvOrSecret('DEEPSEEK_API_KEY', 'deepseek_api_key.txt', ''),
    youtube: getEnvOrSecret('YOUTUBE_API_KEY', 'youtube_api_key.txt', ''),
    sendgrid: getEnvOrSecret('SENDGRID_API_KEY', 'sendgrid_api_key.txt', ''),
  },
  
  // تكوين إرسال البريد الإلكتروني
  email: {
    contactEmail: 'quickrecipe2026@gmail.com',
    fromName: 'Quick Recipe Support',
  }
};

export default config;