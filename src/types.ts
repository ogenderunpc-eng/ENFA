export type Role = 'teacher' | 'parent';

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
}

export interface Student {
  id: string;
  name: string;
  number: string;
  avatar: string;
  status?: 'present' | 'absent' | 'late';
  grades?: Grade[];
}

export interface TeacherComment {
  id: string;
  teacherName: string;
  subject: string;
  comment: string;
  avatar: string;
}
