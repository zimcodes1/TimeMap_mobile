//Session & Timetable

export type SessionStatus =
  | 'scheduled'
  | 'shifted'
  | 'postponed'
  | 'cancelled'
  | 'held'
  | 'not_held';

export interface Venue {
  id: string;
  name: string;
  building?: string;
  capacity?: number;
  facilities?: string[];
}

export interface Lecturer {
  id: string;
  name: string;
  staffId: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  department?: string;
  level?: string;
}

export interface Session {
  id: string;
  course: Course;
  venue: Venue;
  lecturers: Lecturer[];
  date: string;           // YYYY-MM-DD
  startTime: string;      // HH:MM
  endTime: string;        // HH:MM
  status: SessionStatus;
  reportWindowOpen: boolean;
  reportWindowExpiresAt?: string; // ISO datetime
  reportId?: string;              // if a report already exists for this session
}

//Reports

export type ReportStatus = 'pending' | 'responded' | 'disputed';

export interface Report {
  id: string;
  session: Session;
  submittedBy: string;        // class rep display name
  held: boolean;
  reason: string;
  reportedAt: string;         // ISO datetime
  lecturerResponse?: string;
  respondedAt?: string;       // ISO datetime
  status: ReportStatus;
}

//Notifications

export type NotificationType =
  | 'schedule_change'
  | 'report_submitted'
  | 'report_responded'
  | 'window_reminder'
  | 'session_unreported'
  | 'discrepancy_approved'
  | 'discrepancy_rejected'
  | 'general';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;          // ISO datetime
  relatedModel?: 'LectureSession' | 'ClassRepReport' | 'DiscrepancyRequest';
  relatedId?: string;
}

//User / Profile

export type UserRole = 'student' | 'class_rep' | 'lecturer' | 'admin';

export interface UserProfile {
  id: string;
  fullName: string;
  matricNumber?: string;
  staffId?: string;
  email: string;
  role: UserRole;
  isClassRep: boolean;
  department: string;
  level?: string;             // e.g. "300L" — students only
  requiresPasswordReset: boolean;
  pushEnabled: boolean;
}
