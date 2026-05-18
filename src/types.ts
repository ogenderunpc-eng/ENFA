export type Role = 'teacher' | 'parent' | 'student';

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
}

export interface Message {
  id: string;
  sender: string;
  senderRole: string;
  content: string;
  time: string;
  avatar?: string;
  senderId?: string;
  recipientId?: string;
  createdAt?: string;
}

export interface ClassSession {
  id: string;
  title: string;
  time: string;
  location: string;
  classGroup: string;
  image: string;
  status?: 'ongoing' | 'next';
}

export interface GradeUpdate {
  id: string;
  subject: string;
  grade: number;
  description: string;
  average: number;
}

export interface Grade {
  subject: string;
  value: number;
  date: string;
  note?: string;
}

export interface KTSResult {
  id: string;
  examName: string;
  date: string;
  correct: number;
  wrong: number;
  empty: number;
  score: number;
  rankClass: number;
  rankSchool: number;
  rankGeneral: number;
}

export interface Student {
  id: string;
  name: string;
  number: string;
  avatar: string;
  role: Role;
  email?: string;
  status?: 'present' | 'absent' | 'late';
  grades?: Grade[];
  class?: string;
  parentName?: string;
  ktsResults?: KTSResult[];
  password?: string;
  parentEmail?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'message' | 'exam' | 'performance' | 'system';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  deadline: string;
  teacherId: string;
  classId: string;
  createdAt: string;
}

export interface TeacherComment {
  id: string;
  teacherName: string;
  subject: string;
  comment: string;
  avatar: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  teacherId: string;
}

export interface Exam {
  id: string;
  sinav_adi: string;
  ders: string;
  toplam_soru: number;
  tarih: string;
  pdf_data: string;
  pdf_name: string;
  teacherId: string;
  createdAt: string;
}

export interface ExamResult {
  id: string;
  sinav_id: string;
  talebe_id: string;
  talebe_isim: string;
  dogru: number;
  yanlis: number;
  bos: number;
  net: number;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  etkinlik_adi: string;
  tur: 'Deneme' | 'Okul' | 'Yazılı' | 'Performans' | 'Sınav';
  tarih: string;
  teacherId?: string;
}
