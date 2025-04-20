#!/usr/bin/env node

/**
 * سكريبت لتحويل متغيرات البيئة من ملف .env إلى ملفات سيكريت
 * 
 * التعليمات:
 * 1. تأكد من وجود ملف .env في المجلد الجذر للمشروع
 * 2. قم بتشغيل: node config/migrate-env-to-secrets.js
 * 3. سيتم إنشاء ملفات سيكريت في مجلد config/secrets/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const envFilePath = path.join(rootDir, '.env');
const secretsDir = path.join(__dirname, 'secrets');

// وظيفة تحويل اسم المتغير البيئي إلى اسم ملف السيكريت
function envKeyToSecretFilename(key) {
  return key.toLowerCase()
    .replace(/^vite_/, '') // إزالة البادئة vite_
    .replace(/_/g, '_') // استبدال الشرطة السفلية بشرطة سفلية (للاتساق)
    .replace(/\./g, '_') // استبدال النقطة بشرطة سفلية
    + '.txt';
}

// التأكد من وجود ملف .env
if (!fs.existsSync(envFilePath)) {
  console.error('خطأ: ملف .env غير موجود!');
  console.log('يجب أن يكون ملف .env موجوداً في المجلد الجذر للمشروع.');
  process.exit(1);
}

// التأكد من وجود مجلد السيكرتس
if (!fs.existsSync(secretsDir)) {
  fs.mkdirSync(secretsDir, { recursive: true });
  console.log(`تم إنشاء مجلد السيكرتس: ${secretsDir}`);
}

// قراءة محتوى ملف .env
const envContent = fs.readFileSync(envFilePath, 'utf8');
const envLines = envContent.split('\n');

let filesCreated = 0;
let filesSkipped = 0;

// معالجة كل سطر في ملف .env
envLines.forEach(line => {
  // تجاهل التعليقات والأسطر الفارغة
  if (line.trim().startsWith('#') || line.trim() === '') {
    return;
  }

  // استخراج المفتاح والقيمة
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const [, key, value] = match;
    const secretFilename = envKeyToSecretFilename(key.trim());
    const secretFilePath = path.join(secretsDir, secretFilename);

    // التحقق مما إذا كان الملف موجوداً بالفعل
    if (fs.existsSync(secretFilePath)) {
      console.log(`تم تخطي الملف (موجود بالفعل): ${secretFilename}`);
      filesSkipped++;
      return;
    }

    // كتابة القيمة في ملف السيكريت
    try {
      fs.writeFileSync(secretFilePath, value.replace(/['"]/g, '').trim());
      console.log(`تم إنشاء ملف: ${secretFilename}`);
      filesCreated++;
    } catch (error) {
      console.error(`خطأ أثناء إنشاء الملف ${secretFilename}:`, error.message);
    }
  }
});

console.log('\nاكتمل التحويل:');
console.log(`- تم إنشاء ${filesCreated} ملف سيكريت جديد`);
console.log(`- تم تخطي ${filesSkipped} ملف (موجود بالفعل)`);
console.log('\nتذكر أن تضيف مجلد "config/secrets/" إلى ملف .gitignore!');