/**
 * mockData.ts
 *
 * Dummy data for UI scaffolding only.
 * Replace all of this once API endpoints are wired (see RULES.md §13).
 *
 * TODO(api-wiring): remove this file and replace usages with real API calls.
 */

import {
  UserProfile,
  Session,
  Report,
  Notification,
  Course,
  Venue,
  Lecturer,
} from '@/types';

// ─── Today's date helper ─────────────────────────────────────────────────────

const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
};

// ─── Shared sub-objects ──────────────────────────────────────────────────────

const venues: Venue[] = [
  { id: 'v1', name: 'LT 1', building: 'Main Block', capacity: 200, facilities: ['Projector', 'AC'] },
  { id: 'v2', name: 'LT 2', building: 'Science Block', capacity: 150, facilities: ['Whiteboard'] },
  { id: 'v3', name: 'Room 301', building: 'Admin Block', capacity: 60, facilities: ['AC', 'Projector'] },
  { id: 'v4', name: 'CS Lab A', building: 'ICT Block', capacity: 40, facilities: ['Computers', 'AC'] },
];

const lecturers: Lecturer[] = [
  { id: 'l1', name: 'Dr. Abubakar Ibrahim', staffId: 'STF-0012' },
  { id: 'l2', name: 'Prof. Fatima Aliyu', staffId: 'STF-0034' },
  { id: 'l3', name: 'Mr. Emeka Okonkwo', staffId: 'STF-0056' },
];

const courses: Course[] = [
  { id: 'c1', code: 'CSC 301', title: 'Data Structures & Algorithms', department: 'Computer Science', level: '300L' },
  { id: 'c2', code: 'CSC 305', title: 'Operating Systems', department: 'Computer Science', level: '300L' },
  { id: 'c3', code: 'CSC 311', title: 'Database Systems', department: 'Computer Science', level: '300L' },
  { id: 'c4', code: 'MTH 301', title: 'Numerical Methods', department: 'Mathematics', level: '300L' },
  { id: 'c5', code: 'CSC 313', title: 'Computer Networks', department: 'Computer Science', level: '300L' },
];

// ─── Mock profile (class rep) ─────────────────────────────────────────────────

export const MOCK_PROFILE: UserProfile = {
  id: 'user-001',
  fullName: 'Amina Yusuf',
  matricNumber: 'CSC/2023/0147',
  email: 'amina.yusuf@nsuk.edu.ng',
  role: 'class_rep',
  isClassRep: true,
  department: 'Computer Science',
  level: '300L',
  requiresPasswordReset: false,
  pushEnabled: true,
};

// ─── Mock sessions ────────────────────────────────────────────────────────────

export const MOCK_SESSIONS: Session[] = [
  {
    id: 'ses-001',
    course: courses[0],
    venue: venues[0],
    lecturers: [lecturers[0]],
    date: fmt(today),
    startTime: '08:00',
    endTime: '10:00',
    status: 'scheduled',
    reportWindowOpen: true,
    reportWindowExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ses-002',
    course: courses[1],
    venue: venues[1],
    lecturers: [lecturers[1]],
    date: fmt(today),
    startTime: '10:00',
    endTime: '12:00',
    status: 'held',
    reportWindowOpen: false,
    reportId: 'rep-001',
  },
  {
    id: 'ses-003',
    course: courses[2],
    venue: venues[2],
    lecturers: [lecturers[2]],
    date: fmt(today),
    startTime: '14:00',
    endTime: '16:00',
    status: 'cancelled',
    reportWindowOpen: false,
  },
  {
    id: 'ses-004',
    course: courses[3],
    venue: venues[3],
    lecturers: [lecturers[0]],
    date: fmt(addDays(today, 1)),
    startTime: '09:00',
    endTime: '11:00',
    status: 'scheduled',
    reportWindowOpen: false,
  },
  {
    id: 'ses-005',
    course: courses[4],
    venue: venues[0],
    lecturers: [lecturers[1]],
    date: fmt(addDays(today, 1)),
    startTime: '13:00',
    endTime: '15:00',
    status: 'shifted',
    reportWindowOpen: false,
  },
  {
    id: 'ses-006',
    course: courses[0],
    venue: venues[1],
    lecturers: [lecturers[0]],
    date: fmt(addDays(today, 2)),
    startTime: '08:00',
    endTime: '10:00',
    status: 'scheduled',
    reportWindowOpen: false,
  },
  {
    id: 'ses-007',
    course: courses[1],
    venue: venues[2],
    lecturers: [lecturers[1]],
    date: fmt(addDays(today, 3)),
    startTime: '10:00',
    endTime: '12:00',
    status: 'postponed',
    reportWindowOpen: false,
  },
  {
    id: 'ses-008',
    course: courses[2],
    venue: venues[3],
    lecturers: [lecturers[2]],
    date: fmt(addDays(today, -1)),
    startTime: '14:00',
    endTime: '16:00',
    status: 'not_held',
    reportWindowOpen: false,
    reportId: 'rep-002',
  },
];

// ─── Mock reports ─────────────────────────────────────────────────────────────

export const MOCK_REPORTS: Report[] = [
  {
    id: 'rep-001',
    session: MOCK_SESSIONS[1],
    submittedBy: 'Amina Yusuf',
    held: true,
    reason: 'Lecture was held as scheduled. All students were present.',
    reportedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    lecturerResponse: 'Confirmed. Thank you for the timely report.',
    respondedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'responded',
  },
  {
    id: 'rep-002',
    session: MOCK_SESSIONS[7],
    submittedBy: 'Amina Yusuf',
    held: false,
    reason: 'Lecturer did not show up. Waited for 30 minutes before leaving.',
    reportedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  },
  {
    id: 'rep-003',
    session: {
      ...MOCK_SESSIONS[2],
      id: 'ses-003',
      date: fmt(addDays(today, -3)),
    },
    submittedBy: 'Amina Yusuf',
    held: false,
    reason: 'Session was cancelled without prior notice.',
    reportedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    lecturerResponse: 'I had an emergency. Will reschedule.',
    respondedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'responded',
  },
];

// ─── Reportable sessions (window open, no report yet) ─────────────────────────

export const MOCK_REPORTABLE_SESSIONS: Session[] = MOCK_SESSIONS.filter(
  (s) => s.reportWindowOpen && !s.reportId
);

// ─── Mock notifications ───────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'ntf-001',
    type: 'schedule_change',
    title: 'CSC 305 Shifted',
    body: 'Operating Systems session on Friday has been shifted to Monday 10:00 AM in LT 2.',
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    relatedModel: 'LectureSession',
    relatedId: 'ses-005',
  },
  {
    id: 'ntf-002',
    type: 'window_reminder',
    title: 'Report Window Closing Soon',
    body: 'The reporting window for CSC 301 (today 08:00) closes in 2 hours. Please submit your report.',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    relatedModel: 'LectureSession',
    relatedId: 'ses-001',
  },
  {
    id: 'ntf-003',
    type: 'report_responded',
    title: 'Lecturer Responded to Your Report',
    body: 'Dr. Abubakar Ibrahim responded to your report for CSC 305 on 14 Aug.',
    isRead: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    relatedModel: 'ClassRepReport',
    relatedId: 'rep-001',
  },
  {
    id: 'ntf-004',
    type: 'session_unreported',
    title: 'Unreported Session Alert',
    body: 'CSC 311 session from yesterday has not been reported. Window expires in 4 hours.',
    isRead: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    relatedModel: 'LectureSession',
    relatedId: 'ses-008',
  },
  {
    id: 'ntf-005',
    type: 'discrepancy_approved',
    title: 'Discrepancy Request Approved',
    body: 'Your venue discrepancy request for CSC 301 has been approved by the admin.',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ntf-006',
    type: 'schedule_change',
    title: 'MTH 301 Postponed',
    body: 'Numerical Methods on Wednesday has been postponed to next week.',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    relatedModel: 'LectureSession',
    relatedId: 'ses-007',
  },
  {
    id: 'ntf-007',
    type: 'general',
    title: 'Welcome to TimeMap',
    body: 'Your account is set up. You can now view your timetable and manage class reports.',
    isRead: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_UNREAD_COUNT = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;
