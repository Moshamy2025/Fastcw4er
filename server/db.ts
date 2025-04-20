import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
// استيراد ملف التكوين
// @ts-ignore - تجاهل خطأ عدم وجود ملف تعريف TypeScript
import configModule from '../config/index.js';
const config = configModule;

neonConfig.webSocketConstructor = ws;

const { database } = config;

if (!database.url) {
  throw new Error(
    "Database URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: database.url });
export const db = drizzle({ client: pool, schema });