import { Message, ClassSession, GradeUpdate, TeacherComment, Student } from './types';

export const COLORS = {
  primary: '#001e40',
  primaryContainer: '#003366',
  secondary: '#006b5e',
  secondaryContainer: '#94f0df',
  surface: '#f9f9fe',
  surfaceContainer: '#eeedf2',
  surfaceContainerLow: '#f4f3f8',
  surfaceContainerLowest: '#ffffff',
  onSurface: '#1a1c1f',
  onSurfaceVariant: '#43474f',
  outline: '#737780',
  error: '#ba1a1a',
};

export const STUDENTS: Student[] = [
  { id: '1', name: 'Ali Demir', number: '1024', avatar: 'https://i.pravatar.cc/150?u=ali' },
  { id: '2', name: 'Ayşe Kaya', number: '1025', avatar: 'https://i.pravatar.cc/150?u=ayse' },
  { id: '3', name: 'Can Özkan', number: '1026', avatar: 'https://i.pravatar.cc/150?u=can' },
  { id: '4', name: 'Deniz Yılmaz', number: '1027', avatar: 'https://i.pravatar.cc/150?u=deniz' },
  { id: '5', name: 'Elif Şahin', number: '1028', avatar: 'https://i.pravatar.cc/150?u=elif' },
  { id: '6', name: 'Fatih Aras', number: '1029', avatar: 'https://i.pravatar.cc/150?u=fatih' },
];

export const RECENT_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'Arda Demir',
    senderRole: 'Veli',
    content: 'Hocam merhaba, yarınki sınav kapsamı hakkında bir sorum olacaktı...',
    time: '14:20',
  },
  {
    id: '2',
    sender: 'Zeynep Kaya',
    senderRole: 'Veli',
    content: "Zeynep'in sağlık durumu düzeldi, bugün okula katılım sağlayacak.",
    time: '11:05',
  },
  {
    id: '3',
    sender: 'Mert Öz',
    senderRole: 'Veli',
    content: 'Ödev dosyasını sisteme yüklemekte sorun yaşıyoruz, yardımcı olabilir misiniz?',
    time: 'Dün',
  },
];

export const CLASSES: ClassSession[] = [
  {
    id: '1',
    title: 'Matematik-II: Analitik Geometri',
    time: '15:30 - 16:15',
    location: 'Laboratuvar 3',
    classGroup: '12-B Sınıfı',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800',
    status: 'next',
  },
  {
    id: '2',
    title: 'İleri Seviye Algoritmalar',
    time: '09:00 - 10:30',
    location: 'Lab 4B, 2. Kat',
    classGroup: 'Bilgisayar Bilimleri',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
    status: 'ongoing',
  },
  {
    id: '3',
    title: 'Fizik: Termodinamik',
    time: '11:00 - 12:30',
    location: 'Amfi 1',
    classGroup: '11-A Sınıfı',
    image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '4',
    title: 'Kimya: Organik Bileşikler',
    time: '14:00 - 15:30',
    location: 'Laboratuvar 2',
    classGroup: '12-C Sınıfı',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9d39d99c5?auto=format&fit=crop&q=80&w=800',
  },
];

export const GRADE_UPDATES: GradeUpdate[] = [
  {
    id: '1',
    subject: 'Fizik',
    grade: 95,
    description: 'Lab Raporu: Kuvvet ve Hareket',
    average: 78,
  },
];

export const TEACHER_COMMENTS: TeacherComment[] = [
  {
    id: '1',
    teacherName: 'Melis Arkan',
    subject: 'Tarih',
    comment: 'Sınıf içi katılımı oldukça arttı. Grup çalışmalarında liderlik özelliği sergilemeye başladı.',
    avatar: 'https://i.pravatar.cc/150?u=melis',
  },
  {
    id: '2',
    teacherName: 'Caner Yılmaz',
    subject: 'Kimya',
    comment: 'Deney sonuçlarını raporlama konusundaki titizliği çok başarılı. Akademik disiplini örnek seviyede.',
    avatar: 'https://i.pravatar.cc/150?u=caner',
  },
];

export const MESSAGES: Message[] = [
  ...RECENT_MESSAGES,
  {
    id: '4',
    sender: 'Selin Yılmaz',
    senderRole: 'Rehberlik',
    content: 'Ali ile yaptığımız görüşme oldukça verimli geçti. Detayları yarın konuşabiliriz.',
    time: '2 gün önce',
    avatar: 'https://i.pravatar.cc/150?u=selin'
  },
  {
    id: '5',
    sender: 'Hakan Demir',
    senderRole: 'Müdür Yardımcısı',
    content: 'Haftalık ders programındaki değişiklikler hakkında bilgilendirme.',
    time: '3 gün önce',
    avatar: 'https://i.pravatar.cc/150?u=hakan'
  }
];

export const USER_STATS = {
  attendance: '94%',
  averageGrade: '88.5',
  completedAssignments: '24/26',
  upcomingExams: '3',
};
