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
  const sessionRaw = raw.lecture_session || raw.session || {};
  const reporterRaw = raw.reported_by || raw.reporter || {};

  return {
    id: String(raw.id),
    session: typeof sessionRaw === 'object' && sessionRaw.id ? mapBackendToSession(sessionRaw) : {
      id: String(raw.lecture_session_id || raw.session_id || '0'),
      course: { id: '0', code: raw.course_code || 'COURSE', title: raw.course_title || 'Course Lecture' },
      venue: { id: '0', name: raw.venue_name || 'TBA' },
      lecturers: [],
      date: raw.session_date || new Date().toISOString().split('T')[0],
      startTime: raw.session_start_time?.substring(0, 5) || '09:00',
      endTime: raw.session_end_time?.substring(0, 5) || '11:00',
      status: (raw.held === false ? 'not_held' : 'held') as SessionStatus,
      reportWindowOpen: false,
    },
    submittedBy: reporterRaw.full_name || reporterRaw.name || raw.reporter_name || 'Class Rep',
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
