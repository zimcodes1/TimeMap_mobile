import * as SQLite from 'expo-sqlite';
import { UserProfile, Session, AnalyticsData } from '@/types';

const DB_NAME = 'timemap_local.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await initTables(db);
      dbInstance = db;
      return db;
    } catch (err) {
      dbInstance = null;
      throw err;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

async function initTables(db: SQLite.SQLiteDatabase): Promise<void> {
  // Create tables using standard clean DDL (PRAGMA journal_mode is managed automatically by expo-sqlite)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      matric_number TEXT,
      staff_id TEXT,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      is_class_rep INTEGER NOT NULL,
      department TEXT NOT NULL,
      program TEXT,
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

  // Safely check if 'program' column exists before attempting migration
  try {
    const tableInfo = await db.getAllAsync<{ name: string }>('PRAGMA table_info(user_profile);');
    const hasProgramCol = tableInfo.some((col) => col.name === 'program');
    if (!hasProgramCol) {
      await db.execAsync('ALTER TABLE user_profile ADD COLUMN program TEXT;');
    }
  } catch (e) {
    // Non-fatal if table info query fails
  }
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
          is_class_rep, department, program, level, requires_password_reset,
          push_enabled, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          profile.id,
          profile.fullName,
          profile.matricNumber ?? null,
          profile.staffId ?? null,
          profile.email,
          profile.role,
          profile.isClassRep ? 1 : 0,
          profile.department,
          profile.program ?? null,
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
        program: string | null;
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
        program: row.program ?? undefined,
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

  /**
   * Save full list of scoped sessions and cache individual session details by ID
   */
  async saveSessions(sessions: Session[]): Promise<void> {
    if (!Array.isArray(sessions)) return;
    try {
      const db = await getDB();
      const now = new Date().toISOString();
      const valStr = JSON.stringify(sessions);
      
      // Save all sessions list
      await db.runAsync(
        'INSERT OR REPLACE INTO offline_cache (key, value, updated_at) VALUES (?, ?, ?);',
        ['scoped_sessions', valStr, now]
      );

      // Save individual sessions for instant session detail access
      for (const session of sessions) {
        if (session && session.id) {
          await db.runAsync(
            'INSERT OR REPLACE INTO offline_cache (key, value, updated_at) VALUES (?, ?, ?);',
            [`session_detail_${session.id}`, JSON.stringify(session), now]
          );
        }
      }

      // Record last sync timestamp
      await db.runAsync(
        'INSERT OR REPLACE INTO offline_cache (key, value, updated_at) VALUES (?, ?, ?);',
        ['sessions_last_sync_timestamp', JSON.stringify(Date.now()), now]
      );
    } catch (error) {
      console.error('[SQLite] Error saving sessions:', error);
    }
  },

  /**
   * Get cached sessions
   */
  async getSessions(): Promise<Session[] | null> {
    return this.getCache<Session[]>('scoped_sessions');
  },

  /**
   * Mark a session as reported in SQLite cache
   */
  async markSessionAsReported(sessionId: string, reportId: string, held: boolean): Promise<void> {
    try {
      const cached = await this.getSessions();
      if (cached && Array.isArray(cached)) {
        const updated = cached.map((s) => {
          if (String(s.id) === String(sessionId)) {
            return {
              ...s,
              reportId: String(reportId),
              reportWindowOpen: false,
              status: (held ? 'held' : 'not_held') as SessionStatus,
            };
          }
          return s;
        });
        await this.setCache('scoped_sessions', updated);
      }

      // Update single session detail cache if present
      const direct = await this.getCache<Session>(`session_detail_${sessionId}`);
      if (direct) {
        const updatedDirect: Session = {
          ...direct,
          reportId: String(reportId),
          reportWindowOpen: false,
          status: (held ? 'held' : 'not_held') as SessionStatus,
        };
        await this.setCache(`session_detail_${sessionId}`, updatedDirect);
      }
    } catch (error) {
      console.error('[SQLite] Error marking session as reported:', error);
    }
  },

  /**
   * Get single session by ID
   */
  async getSessionById(sessionId: string): Promise<Session | null> {
    const direct = await this.getCache<Session>(`session_detail_${sessionId}`);
    if (direct) return direct;
    
    const all = await this.getSessions();
    if (all && all.length > 0) {
      const found = all.find((s) => s.id === sessionId);
      if (found) {
        await this.setCache(`session_detail_${sessionId}`, found);
        return found;
      }
    }
    return null;
  },

  /**
   * Get last sessions sync timestamp
   */
  async getLastSessionsSyncTime(): Promise<number | null> {
    return this.getCache<number>('sessions_last_sync_timestamp');
  },

  /**
   * Set last sessions sync timestamp
   */
  async setLastSessionsSyncTime(timestamp: number): Promise<void> {
    await this.setCache('sessions_last_sync_timestamp', timestamp);
  },

  /**
   * Save analytics data and sync timestamp
   */
  async saveAnalytics(data: AnalyticsData, keySuffix: string = 'default'): Promise<void> {
    await this.setCache(`scoped_analytics_${keySuffix}`, data);
    await this.setCache(`analytics_last_sync_${keySuffix}`, Date.now());
  },

  /**
   * Get cached analytics
   */
  async getCachedAnalytics(keySuffix: string = 'default'): Promise<AnalyticsData | null> {
    return this.getCache<AnalyticsData>(`scoped_analytics_${keySuffix}`);
  },

  /**
   * Get last analytics sync timestamp
   */
  async getLastAnalyticsSyncTime(keySuffix: string = 'default'): Promise<number | null> {
    return this.getCache<number>(`analytics_last_sync_${keySuffix}`);
  },

  /**
   * Set last analytics sync timestamp
   */
  async setLastAnalyticsSyncTime(timestamp: number, keySuffix: string = 'default'): Promise<void> {
    await this.setCache(`analytics_last_sync_${keySuffix}`, timestamp);
  },
};
