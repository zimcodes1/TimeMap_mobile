import { apiClient } from './apiClient';
import { Report, ReportStatus, SessionStatus } from '@/types';
import { mapBackendToSession } from './schedulesAPI';

export interface SubmitReportPayload {
  lectureSession: string; // LectureSession ID
  held: boolean;
  reason?: string;
}

export interface RespondReportPayload {
  reportId: string;
  responseText: string;
}

export function mapBackendToReport(raw: any): Report {
  const sessionRaw = raw.lecture_session_detail || raw.session || (typeof raw.lecture_session === 'object' ? raw.lecture_session : null) || {};
  const reporterRaw = raw.reported_by || raw.reporter || {};

  // Extract lecturers safely
  let lecturers: { id: string; name: string; staffId: string }[] = [];
  if (Array.isArray(sessionRaw.lecturers) && sessionRaw.lecturers.length > 0) {
    lecturers = sessionRaw.lecturers.map((l: any) => ({
      id: String(l.id || ''),
      name: l.name || l.full_name || '',
      staffId: l.staff_id || l.staffId || '',
    }));
  } else if (Array.isArray(raw.lecturers) && raw.lecturers.length > 0) {
    lecturers = raw.lecturers.map((l: any) =>
      typeof l === 'string'
        ? { id: l, name: l, staffId: '' }
        : { id: String(l.id || ''), name: l.name || l.full_name || '', staffId: l.staff_id || l.staffId || '' }
    );
  } else if (raw.lecturer_name) {
    lecturers = [{ id: '1', name: raw.lecturer_name, staffId: '' }];
  } else if (sessionRaw.lecturer_name) {
    lecturers = [{ id: '1', name: sessionRaw.lecturer_name, staffId: '' }];
  }

  // Extract venue name safely
  const venueName =
    sessionRaw.venue?.name ||
    sessionRaw.venue_name ||
    raw.venue_name ||
    (typeof raw.venue === 'object' ? raw.venue?.name : raw.venue) ||
    'TBA';

  const session = sessionRaw.id ? mapBackendToSession(sessionRaw) : {
    id: String(raw.lecture_session_id || raw.session_id || (typeof raw.lecture_session === 'number' ? raw.lecture_session : '0')),
    course: {
      id: String(raw.course_id || '0'),
      code: raw.course_code || 'COURSE',
      title: raw.course_title || 'Course Lecture',
    },
    venue: {
      id: String(raw.venue_id || '0'),
      name: venueName,
    },
    lecturers,
    date: raw.session_date || new Date().toISOString().split('T')[0],
    startTime: (raw.session_start_time || '09:00').substring(0, 5),
    endTime: (raw.session_end_time || '11:00').substring(0, 5),
    status: (raw.held === false ? 'not_held' : 'held') as SessionStatus,
    reportWindowOpen: false,
  };

  if ((!session.venue || !session.venue.name || session.venue.name === 'TBA') && venueName !== 'TBA') {
    session.venue = { id: session.venue?.id || '0', name: venueName };
  }
  if ((!session.lecturers || session.lecturers.length === 0) && lecturers.length > 0) {
    session.lecturers = lecturers;
  }

  const reporterName =
    raw.reported_by_name ||
    (typeof reporterRaw === 'object' ? reporterRaw.full_name || reporterRaw.name : undefined) ||
    raw.reporter_name ||
    'Class Rep';

  return {
    id: String(raw.id),
    session,
    submittedBy: reporterName,
    held: Boolean(raw.held),
    reason: raw.reason || '',
    reportedAt: raw.created_at || raw.reported_at || new Date().toISOString(),
    status: (raw.status as ReportStatus) || (raw.lecturer_response ? 'responded' : 'pending'),
    lecturerResponse: typeof raw.lecturer_response === 'string' ? raw.lecturer_response : raw.lecturer_response?.response_text || undefined,
    respondedAt: raw.lecturer_response_at || raw.responded_at || undefined,
  };
}

export const reportingAPI = {
  /**
   * Fetch submitted reports from GET /api/reporting/reports/
   */
  async getReports(): Promise<Report[]> {
    try {
      const rawList = await apiClient<any[]>('/reporting/reports/', {
        method: 'GET',
      });
      if (Array.isArray(rawList)) {
        return rawList.map(mapBackendToReport);
      }
      return [];
    } catch (error) {
      console.warn('[reportingAPI] Failed to fetch reports:', error);
      throw error;
    }
  },

  /**
   * Submit class rep report via POST /api/reporting/reports/
   */
  async submitReport(payload: SubmitReportPayload): Promise<Report> {
    const raw = await apiClient<any>('/reporting/reports/', {
      method: 'POST',
      body: JSON.stringify({
        lecture_session: Number(payload.lectureSession) || payload.lectureSession,
        held: payload.held,
        reason: payload.reason,
      }),
    });
    return mapBackendToReport(raw);
  },

  /**
   * Submit lecturer response via POST /api/reporting/reports/{id}/respond/
   */
  async respondToReport(payload: RespondReportPayload): Promise<Report> {
    const raw = await apiClient<any>(`/reporting/reports/${payload.reportId}/respond/`, {
      method: 'POST',
      body: JSON.stringify({
        response_text: payload.responseText,
      }),
    });
    return mapBackendToReport(raw);
  },
};
