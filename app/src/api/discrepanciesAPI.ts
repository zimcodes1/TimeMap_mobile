import { apiClient } from './apiClient';

export interface CreateDiscrepancyPayload {
  timetable_entry?: string | number;
  lecture_session?: string | number;
  request_type: 'shift_venue' | 'shift_time' | 'cancel' | 'postpone';
  proposed_venue?: string | number;
  proposed_start_time?: string; // HH:MM:SS or HH:MM
  proposed_end_time?: string;   // HH:MM:SS or HH:MM
  proposed_date?: string;       // YYYY-MM-DD
  reason: string;
}

export interface DiscrepancyResponse {
  id: number;
  request_type: string;
  status: string;
  timetable_entry?: number;
  lecture_session?: number;
  proposed_venue?: number;
  proposed_venue_name?: string;
  proposed_start_time?: string;
  proposed_end_time?: string;
  proposed_date?: string;
  reason: string;
  created_at: string;
}

export const discrepanciesAPI = {
  /**
   * Submit a recurrent discrepancy request for admin approval.
   */
  async submitDiscrepancy(payload: CreateDiscrepancyPayload): Promise<DiscrepancyResponse> {
    try {
      const response = await apiClient<DiscrepancyResponse>('/discrepancies/requests/', {
        method: 'POST',
        data: payload,
      });
      return response;
    } catch (error) {
      console.warn('[discrepanciesAPI] Failed to submit discrepancy:', error);
      throw error;
    }
  },

  /**
   * Fetch discrepancy requests initiated by the current user.
   */
  async getMyDiscrepancies(): Promise<DiscrepancyResponse[]> {
    try {
      const response = await apiClient<DiscrepancyResponse[]>('/discrepancies/requests/', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.warn('[discrepanciesAPI] Failed to fetch discrepancies:', error);
      throw error;
    }
  },
};
