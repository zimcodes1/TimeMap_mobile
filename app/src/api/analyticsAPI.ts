import { apiClient } from './apiClient';
import { AnalyticsData, UserRole } from '@/types';

export interface GetAnalyticsParams {
  startDate?: string;
  endDate?: string;
  courseId?: string;
  lecturerId?: string;
}

export function mapBackendToAnalytics(raw: any): AnalyticsData {
  const summaryRaw = raw.summary || {};
  return {
    summary: {
      totalSessions: Number(summaryRaw.total_sessions || 0),
      heldCount: Number(summaryRaw.held_count || 0),
      notHeldCount: Number(summaryRaw.not_held_count || 0),
      cancelledCount: Number(summaryRaw.cancelled_count || 0),
      holdRatePercentage: Number(summaryRaw.hold_rate_percentage || 0),
    },
    courseBreakdown: Array.isArray(raw.course_breakdown)
      ? raw.course_breakdown.map((c: any) => ({
          courseId: String(c.course_id || c.id || ''),
          courseCode: c.course_code || 'COURSE',
          courseTitle: c.course_title || 'Course Lecture',
          totalSessions: Number(c.total_sessions || 0),
          heldCount: Number(c.held_count || 0),
          notHeldCount: Number(c.not_held_count || 0),
          cancelledCount: Number(c.cancelled_count || 0),
          holdRatePercentage: Number(c.hold_rate_percentage || 0),
        }))
      : [],
    queryRange: raw.query_range
      ? {
          startDate: raw.query_range.start_date,
          endDate: raw.query_range.end_date,
          filteredCourse: raw.query_range.filtered_course,
        }
      : undefined,
    userInfo: raw.student_info || raw.lecturer_info || raw.admin_info
      ? {
          fullName: raw.student_info?.full_name || raw.lecturer_info?.full_name || raw.admin_info?.full_name || '',
          department: raw.student_info?.department || raw.lecturer_info?.department || '',
        }
      : undefined,
  };
}

export const analyticsAPI = {
  /**
   * Fetch Analytics based on user role
   */
  async getAnalytics(
    role: UserRole,
    isClassRep: boolean,
    params: GetAnalyticsParams = {}
  ): Promise<AnalyticsData> {
    const queryParams: Record<string, string> = {};
    if (params.startDate) queryParams['start_date'] = params.startDate;
    if (params.endDate) queryParams['end_date'] = params.endDate;
    if (params.courseId) queryParams['course_id'] = params.courseId;
    if (params.lecturerId) queryParams['lecturer_id'] = params.lecturerId;

    let endpoint = '/analytics/class-rep/';
    if (role === 'lecturer') {
      endpoint = '/analytics/lecturer/';
    } else if (role === 'admin') {
      endpoint = '/analytics/admin/';
    } else if (isClassRep) {
      endpoint = '/analytics/class-rep/';
    }

    try {
      const raw = await apiClient<any>(endpoint, {
        method: 'GET',
        params: queryParams,
      });

      return mapBackendToAnalytics(raw);
    } catch (error) {
      console.warn(`[analyticsAPI] Failed to fetch analytics from ${endpoint}:`, error);
      throw error;
    }
  },
};
