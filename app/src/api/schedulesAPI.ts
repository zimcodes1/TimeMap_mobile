import { apiClient } from './apiClient';
import { Session, SessionStatus } from '@/types';
import { MOCK_SESSIONS } from '@/constants/mockData';

export interface GetSessionsParams {
  date?: string;            // YYYY-MM-DD
  startDate?: string;       // YYYY-MM-DD
  endDate?: string;         // YYYY-MM-DD
  status?: SessionStatus;
  courseId?: string;
}

/**
 * Mapper function to transform raw backend LectureSession response into mobile Session object
 */
export function mapBackendToSession(raw: any): Session {
  const dateStr = raw.session_date || new Date().toISOString().split('T')[0];
  const startTimeStr = raw.session_start_time ? raw.session_start_time.substring(0, 5) : '09:00';
  const endTimeStr = raw.session_end_time ? raw.session_end_time.substring(0, 5) : '11:00';

  return {
    id: String(raw.id),
    course: {
      id: String(raw.timetable_entry_course_id || raw.course_id || raw.id),
      code: raw.course_code || raw.timetable_entry_title || 'COURSE',
      title: raw.course_title || raw.timetable_entry_title || 'Course Lecture',
      department: raw.department_name || raw.department || undefined,
    },
    venue: {
      id: String(raw.venue || raw.id),
      name: raw.venue_name || 'TBA',
      building: raw.venue_building || undefined,
    },
    lecturers: Array.isArray(raw.lecturers)
      ? raw.lecturers.map((l: any) => ({
          id: String(l.id),
          name: l.name || l.full_name || 'Lecturer',
          staffId: l.staff_id || l.staffId || '',
        }))
      : [],
    date: dateStr,
    startTime: startTimeStr,
    endTime: endTimeStr,
    status: (raw.status as SessionStatus) || 'scheduled',
    reportWindowOpen: Boolean(raw.report_window_open),
    reportWindowExpiresAt: raw.report_window_expires_at,
    reportId: raw.report_id ? String(raw.report_id) : undefined,
  };
}

export const schedulesAPI = {
  /**
   * Fetch sessions for a date range or specific date from GET /api/scheduling/sessions/
   */
  async getSessions(params: GetSessionsParams = {}): Promise<Session[]> {
    try {
      const queryParams: Record<string, string> = {};
      if (params.date) queryParams['session_date'] = params.date;
      if (params.startDate) queryParams['start_date'] = params.startDate;
      if (params.endDate) queryParams['end_date'] = params.endDate;
      if (params.status) queryParams['status'] = params.status;
      if (params.courseId) queryParams['course'] = params.courseId;

      const rawSessions = await apiClient<any[]>('/scheduling/sessions/', {
        method: 'GET',
        params: queryParams,
      });

      if (Array.isArray(rawSessions)) {
        return rawSessions.map(mapBackendToSession);
      }

      return [];
    } catch (error) {
      console.warn('[schedulesAPI] API call failed, using mock data fallback:', error);
      let result = [...MOCK_SESSIONS];
      if (params.date) {
        result = result.filter((s) => s.date === params.date);
      }
      if (params.status && params.status !== 'scheduled') {
        result = result.filter((s) => s.status === params.status);
      }
      return result;
    }
  },

  /**
   * Fetch single session detail from GET /api/scheduling/sessions/{id}/
   */
  async getSessionDetail(id: string): Promise<Session> {
    try {
      const raw = await apiClient<any>(`/scheduling/sessions/${id}/`, {
        method: 'GET',
      });
      return mapBackendToSession(raw);
    } catch (error) {
      console.warn(`[schedulesAPI] Failed to fetch session ${id}:`, error);
      const mock = MOCK_SESSIONS.find((s) => s.id === id);
      if (mock) return mock;
      throw error;
    }
  },
};
