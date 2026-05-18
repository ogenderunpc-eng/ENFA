/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Role, Student, ClassSession, Message, Announcement } from './types';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import SchedulePage from './pages/SchedulePage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import PortalPage from './pages/PortalPage';
import KTSPage from './pages/KTSPage';
import HomeworkPage from './pages/HomeworkPage';
import TeacherSidebarExtra from './components/TeacherSidebarExtra';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, doc, getDoc, setDoc, where, or } from 'firebase/firestore';
import { seedDatabase } from './lib/seed';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('+90 555 123 45 67');
  const [userAvatar, setUserAvatar] = useState('');
  const [isDeviceLinked, setIsDeviceLinked] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email || '');
        
        // Seed database on first run for developer or default teacher
        if (user.email === 'ogenderunpc@gmail.com' || user.email === 'ogretmen@example.com') {
          seedDatabase(); // Only teacher/admin can seed
          
          if (user.email === 'ogenderunpc@gmail.com') {
            // Ensure they are in the yoneticiler collection
            await setDoc(doc(db, 'yoneticiler', user.uid), {
              email: user.email,
              role: 'admin',
              name: 'OGE Admin',
              olusturma_tarihi: new Date().toISOString()
            }, { merge: true });
          }
          
          if (user.email === 'ogenderunpc@gmail.com' || user.email === 'ogretmen@example.com') {
            await setDoc(doc(db, 'teachers', user.uid), {
              email: user.email,
              role: 'teacher',
              name: user.email === 'ogretmen@example.com' ? 'Öğretmen' : 'OGE Admin',
              avatar: user.photoURL || null
            }, { merge: true });
          }
        }

        
        // Determine role and user details
        // Check if teacher
        const teacherDoc = await getDoc(doc(db, 'teachers', user.uid));
        if (teacherDoc.exists()) {
          const data = teacherDoc.data();
          setRole('teacher');
          setUserName(data.name || user.displayName || 'Öğretmen');
          setUserAvatar(data.avatar || user.photoURL || `https://ui-avatars.com/api/?name=${data.name || 'Ogretmen'}`);
        } else {
          // Check if student
          const studentDoc = await getDoc(doc(db, 'students', user.uid));
          if (studentDoc.exists()) {
            const data = studentDoc.data() as Student;
            setRole('parent'); // Using parent role for both students and parents in UI
            setUserName(data.name || user.displayName || 'Veli');
            setUserAvatar(data.avatar || user.photoURL || `https://ui-avatars.com/api/?name=${data.name || 'Veli'}`);
          } else {
            // Default to teacher if not found and not an admin (unlikely but safe)
            setRole('teacher');
            setUserName(user.displayName || 'Kullanıcı');
          }
        }
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setRole(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !auth.currentUser || !role) return;

    const uid = auth.currentUser.uid;
    const email = auth.currentUser.email;

    // Students/Parents should only list themselves or a teacher can list all
    const studentsQuery = role === 'teacher' 
      ? collection(db, 'students') 
      : query(
          collection(db, 'students'), 
          or(
            where('parentEmail', '==', email),
            where('id', '==', uid)
          )
        );

    const unsubStudents = onSnapshot(studentsQuery, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
    });

    const unsubClasses = onSnapshot(collection(db, 'classes'), (snapshot) => {
      setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassSession)));
    });

    // Messages query needs to be filtered for non-teachers to see their own conversations
    const messagesQuery = role === 'teacher'
      ? query(collection(db, 'messages'), orderBy('createdAt', 'desc'))
      : query(
          collection(db, 'messages'), 
          or(
            where('recipientId', '==', uid),
            where('senderId', '==', uid)
          ),
          orderBy('createdAt', 'desc')
        );

    const unsubMessages = onSnapshot(
      messagesQuery, 
      (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'messages');
      }
    );
    
    const unsubAnnouncements = onSnapshot(
      query(collection(db, 'announcements'), orderBy('date', 'desc')),
      (snapshot) => {
        setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'announcements');
      }
    );

    return () => {
      unsubStudents();
      unsubClasses();
      unsubMessages();
      unsubAnnouncements();
    };
  }, [isLoggedIn, role]);

  const handleUpdateProfile = (data: { avatar?: string; name?: string; email?: string; phone?: string }) => {
    if (data.avatar !== undefined) setUserAvatar(data.avatar);
    if (data.name !== undefined) setUserName(data.name);
    if (data.email !== undefined) setUserEmail(data.email);
    if (data.phone !== undefined) setUserPhone(data.phone);
  };

  const handleUpdateAvatar = (newAvatar: string) => {
    handleUpdateProfile({ avatar: newAvatar });
  };

  const handleLogin = (selectedRole: Role) => {
    setRole(selectedRole);
    setIsLoggedIn(true);
    setActiveTab('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('home');
  };

  const handleSwitchRole = () => {
    setRole(prev => prev === 'teacher' ? 'parent' : 'teacher');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return role === 'teacher' 
          ? <TeacherDashboard announcements={announcements} messages={messages} classes={classes} students={students} setClasses={setClasses} onNavigate={setActiveTab} activeTab={activeTab} /> 
          : <ParentDashboard announcements={announcements} messages={messages} classes={classes} userName={userName} onNavigate={setActiveTab} students={students} activeTab={activeTab} />;
      case 'portal':
        return role === 'teacher' ? <PortalPage students={students} setStudents={setStudents} classes={classes} /> : <ParentDashboard messages={messages} classes={classes} userName={userName} onNavigate={setActiveTab} students={students} activeTab={activeTab} />;
      case 'kts':
        return <KTSPage students={students} setStudents={setStudents} role={role} />;
      case 'homework':
        return <HomeworkPage role={role} students={students} />;
      case 'schedule':
        return <SchedulePage role={role} />;
      case 'messages':
        return <MessagesPage messages={messages} setMessages={setMessages} role={role} userName={userName} userAvatar={userAvatar} students={students} />;
      case 'profile':
        return (
          <ProfilePage 
            role={role} 
            userAvatar={userAvatar} 
            userName={userName}
            userEmail={userEmail}
            userPhone={userPhone}
            isDeviceLinked={isDeviceLinked}
            setIsDeviceLinked={setIsDeviceLinked}
            onLogout={handleLogout} 
            onUpdateAvatar={handleUpdateAvatar} 
            onUpdateProfile={handleUpdateProfile}
          />
        );
      default:
        return role === 'teacher' 
          ? <TeacherDashboard announcements={announcements} messages={messages} classes={classes} students={students} setClasses={setClasses} onNavigate={setActiveTab} /> 
          : <ParentDashboard announcements={announcements} messages={messages} classes={classes} userName={userName} onNavigate={setActiveTab} />;
    }
  };

  return (
    <Layout 
      role={role} 
      onSwitchRole={handleSwitchRole} 
      onLogout={handleLogout}
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      userAvatar={userAvatar}
      userId={auth.currentUser?.uid || ''}
      theme={theme}
      onToggleTheme={toggleTheme}
      sidebarExtra={role === 'teacher' && activeTab === 'home' ? <TeacherSidebarExtra /> : undefined}
    >
      {renderContent()}
    </Layout>
  );
}
