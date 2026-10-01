import { apiClient } from './apiClient';
import { Session, SessionStatus } from '@/types';

export interface GetSessionsParams {
  date?: string;            // YYYY-MM-DD
  startDate?: string;       // YYYY-MM-DD
  endDate?: string;         // YYYY-MM-DD
  status?: SessionStatus;
  courseId?: string;
}

export function isSessionReportWindowOpen(session: {
  date?: string;
  startTime?: string;
  endTime?: string;
  reportId?: string;
  reportWindowOpen?: boolean;
}): boolean {
  if (session.reportId) return false;
  if (!session.date || !session.startTime || !session.endTime) {
    return Boolean(session.reportWindowOpen);
  }
  try {
    const now = new Date();
    const [startH, startM] = session.startTime.split(':').map(Number);
    const [endH, endM] = session.endTime.split(':').map(Number);
    const [year, month, day] = session.date.split('-').map(Number);
    if (!year || !month || !day || isNaN(startH) || isNaN(endH)) {
      return Boolean(session.reportWindowOpen);
    }
    const startDt = new Date(year, month - 1, day, startH, startM, 0);
    const endDt = new Date(year, month - 1, day, endH, endM, 0);
    const expiryDt = new Date(endDt.getTime() + 30 * 60 * 1000);
    return now >= startDt && now <= expiryDt;
  } catch {
    return Boolean(session.reportWindowOpen);
  }
}

/**
 * Mapper function to transform raw backend LectureSession response into mobile Session object
 */
export function mapBackendToSession(raw: any): Session {
  const dateStr = raw.session_date || new Date().toISOString().split('T')[0];
  const startTimeStr = raw.session_start_time ? raw.session_start_time.substring(0, 5) : '09:00';
  const endTimeStr = raw.session_end_time ? raw.session_end_time.substring(0, 5) : '11:00';

  // Resolve lecturers robustly whether backend returns objects, strings, or single lecturer_name
  let lecturers: { id: string; name: string; staffId: string }[] = [];
  if (Array.isArray(raw.lecturers) && raw.lecturers.length > 0) {
    lecturers = raw.lecturers.map((l: any, index: number) => {
      if (typeof l === 'string') {
        return {
          id: `${raw.id || 'sess'}_lec_${index}`,
          name: l,
          staffId: '',
        };
      }
      return {
        id: String(l.id || `${raw.id || 'sess'}_lec_${index}`),
        name: l.name || l.full_name || 'Lecturer',
        staffId: l.staff_id || l.staffId || '',
      };
    });
  } else if (raw.lecturer_name) {
    lecturers = [
      {
        id: `${raw.id || 'sess'}_lec_0`,
        name: raw.lecturer_name,
        staffId: '',
      },
    ];
  }

  // Calculate reporting window: open during lecture and up to 30 minutes after lecture ends
  const isWindowOpen = isSessionReportWindowOpen({
    date: dateStr,
    startTime: startTimeStr,
    endTime: endTimeStr,
    reportId: raw.report_id ? String(raw.report_id) : undefined,
    reportWindowOpen: raw.report_window_open,
  });

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
    lecturers,
    date: dateStr,
    startTime: startTimeStr,
    endTime: endTimeStr,
    status: (raw.status as SessionStatus) || 'scheduled',
    reportWindowOpen: isWindowOpen,
    reportWindowExpiresAt: raw.report_window_expires_at,
    reportId: raw.report_id ? String(raw.report_id) : undefined,
    timetableEntryId: raw.timetable_entry ? String(raw.timetable_entry) : (raw.timetable_entry_id ? String(raw.timetable_entry_id) : undefined),
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
      console.warn('[schedulesAPI] API call failed:', error);
      throw error;
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
      throw error;
    }
  },

  /**
   * Shift a lecture session instance (venue, date, start_time, end_time)
   */
  async shiftSession(
    sessionId: string,
    payload: {
      venue?: string | number;
      session_date?: string;
      session_start_time?: string;
      session_end_time?: string;
    }
  ): Promise<Session> {
    try {
      const raw = await apiClient<any>(`/scheduling/sessions/${sessionId}/`, {
        method: 'PATCH',
        data: payload,
      });
      return mapBackendToSession(raw);
    } catch (error) {
      console.warn(`[schedulesAPI] Failed to shift session ${sessionId}:`, error);
      throw error;
    }
  },

  /**
   * Cancel a lecture session instance
   */
  async cancelSession(sessionId: string, reason?: string): Promise<Session> {
    try {
      const raw = await apiClient<any>(`/scheduling/sessions/${sessionId}/cancel/`, {
        method: 'POST',
        data: { reason: reason || 'Cancelled by lecturer' },
      });
      return mapBackendToSession(raw);
    } catch (error) {
      console.warn(`[schedulesAPI] Failed to cancel session ${sessionId}:`, error);
      throw error;
    }
  },
};
