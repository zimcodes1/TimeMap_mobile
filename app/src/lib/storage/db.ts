import * as SQLite from 'expo-sqlite';
import { UserProfile } from '@/types';

const DB_NAME = 'timemap_local.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
    await initTables(dbInstance);
  }
  return dbInstance;
}

async function initTables(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS user_profile (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      matric_number TEXT,
      staff_id TEXT,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      is_class_rep INTEGER NOT NULL,
      department TEXT NOT NULL,
      level TEXT,
      requires_password_reset INTEGER NOT NULL,
      push_enabled INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS offline_cache (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

export const localDB = {
  /**
   * Save or update cached user profile in local SQLite database
   */
  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      const db = await getDB();
      const now = new Date().toISOString();
      await db.runAsync(
        `INSERT OR REPLACE INTO user_profile (
          id, full_name, matric_number, staff_id, email, role,
          is_class_rep, department, level, requires_password_reset,
          push_enabled, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          profile.id,
          profile.fullName,
          profile.matricNumber ?? null,
          profile.staffId ?? null,
          profile.email,
          profile.role,
          profile.isClassRep ? 1 : 0,
          profile.department,
          profile.level ?? null,
          profile.requiresPasswordReset ? 1 : 0,
          profile.pushEnabled ? 1 : 0,
          now,
        ]
      );
    } catch (error) {
      console.error('[SQLite] Error saving user profile:', error);
    }
  },

  /**
   * Retrieve cached user profile from local SQLite database
   */
  async getCachedUserProfile(): Promise<UserProfile | null> {
    try {
      const db = await getDB();
      const result = await db.getAllAsync<{
        id: string;
        full_name: string;
        matric_number: string | null;
        staff_id: string | null;
        email: string;
        role: string;
        is_class_rep: number;
        department: string;
        level: string | null;
        requires_password_reset: number;
        push_enabled: number;
      }>('SELECT * FROM user_profile LIMIT 1;');

      if (result.length === 0) {
        return null;
      }

      const row = result[0];
      return {
        id: row.id,
        fullName: row.full_name,
        matricNumber: row.matric_number ?? undefined,
        staffId: row.staff_id ?? undefined,
        email: row.email,
        role: row.role as UserProfile['role'],
        isClassRep: Boolean(row.is_class_rep),
        department: row.department,
        level: row.level ?? undefined,
        requiresPasswordReset: Boolean(row.requires_password_reset),
        pushEnabled: Boolean(row.push_enabled),
      };
    } catch (error) {
      console.error('[SQLite] Error fetching cached user profile:', error);
      return null;
    }
  },

  /**
   * Clear user profile and offline cache from SQLite database
   */
  async clearUserProfile(): Promise<void> {
    try {
      const db = await getDB();
      await db.runAsync('DELETE FROM user_profile;');
      await db.runAsync('DELETE FROM offline_cache;');
    } catch (error) {
      console.error('[SQLite] Error clearing database:', error);
    }
  },

  /**
   * Key-value cache store for arbitrary payload offline caching
   */
  async setCache(key: string, value: unknown): Promise<void> {
    try {
      const db = await getDB();
      const now = new Date().toISOString();
      const valStr = JSON.stringify(value);
      await db.runAsync(
        'INSERT OR REPLACE INTO offline_cache (key, value, updated_at) VALUES (?, ?, ?);',
        [key, valStr, now]
      );
    } catch (error) {
      console.error(`[SQLite] Error setting cache key ${key}:`, error);
    }
  },

  async getCache<T>(key: string): Promise<T | null> {
    try {
      const db = await getDB();
      const rows = await db.getAllAsync<{ value: string }>(
        'SELECT value FROM offline_cache WHERE key = ? LIMIT 1;',
        [key]
      );
      if (rows.length === 0) return null;
      return JSON.parse(rows[0].value) as T;
    } catch (error) {
      console.error(`[SQLite] Error getting cache key ${key}:`, error);
      return null;
    }
  },
};
