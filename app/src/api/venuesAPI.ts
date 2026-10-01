import { apiClient } from './apiClient';

export interface VenueItem {
  id: string;
  name: string;
  venueType: string;
  capacity: number;
  building?: string;
  owningLevel?: string;
  isActive: boolean;
}

export interface VenueSlot {
  start: string; // "08:00:00"
  end: string;   // "10:00:00"
  label: string; // "8:00 AM - 10:00 AM"
}

export interface VenueAvailabilityResponse {
  venue_id: number;
  venue_name: string;
  date: string;
  operating_hours: string;
  available_time_ranges: string;
  slots: VenueSlot[];
  booked_slots: { start: string; end: string }[];
}

export const venuesAPI = {
  /**
   * Fetch venues accessible for the given course or within the user's scope.
   */
  async getVenues(params: { courseId?: string } = {}): Promise<VenueItem[]> {
    try {
      const queryParams: Record<string, string> = {};
      if (params.courseId) {
        queryParams['course'] = params.courseId;
      }

      let raw: any;
      try {
        raw = await apiClient<any>('/venues/', {
          method: 'GET',
          params: queryParams,
        });
      } catch (err: any) {
        if (err?.status === 404) {
          raw = await apiClient<any>('/venues/venues/', {
            method: 'GET',
            params: queryParams,
          });
        } else {
          throw err;
        }
      }

      const list = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.results) ? raw.results : []);

      return list.map((v: any) => ({
        id: String(v.id),
        name: v.name,
        venueType: v.venue_type || v.venueType || 'lecture_hall',
        capacity: v.capacity || 0,
        building: v.building || undefined,
        owningLevel: v.owning_level || undefined,
        isActive: v.is_active !== false,
      }));
    } catch (error) {
      console.warn('[venuesAPI] Failed to fetch venues:', error);
      throw error;
    }
  },

  /**
   * Fetch real-time available time slots for a specific venue and date/weekday.
   */
  async getVenueAvailability(
    venueId: string,
    params: { date?: string; weekday?: string; excludeSessionId?: string } | string,
    maybeExcludeSessionId?: string
  ): Promise<VenueAvailabilityResponse> {
    try {
      const queryParams: Record<string, string> = {};
      if (typeof params === 'string') {
        queryParams['date'] = params;
        if (maybeExcludeSessionId) {
          queryParams['exclude_session'] = maybeExcludeSessionId;
        }
      } else if (params) {
        if (params.date) queryParams['date'] = params.date;
        if (params.weekday) queryParams['weekday'] = params.weekday;
        if (params.excludeSessionId) queryParams['exclude_session'] = params.excludeSessionId;
      }

      try {
        return await apiClient<VenueAvailabilityResponse>(
          `/venues/${venueId}/availability/`,
          {
            method: 'GET',
            params: queryParams,
          }
        );
      } catch (err: any) {
        if (err?.status === 404) {
          return await apiClient<VenueAvailabilityResponse>(
            `/venues/venues/${venueId}/availability/`,
            {
              method: 'GET',
              params: queryParams,
            }
          );
        }
        throw err;
      }
    } catch (error) {
      console.warn(`[venuesAPI] Failed to fetch availability for venue ${venueId}:`, error);
      throw error;
    }
  },
};
