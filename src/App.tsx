/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Role, Student, ClassSession, Message } from './types';
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
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, doc, getDoc, setDoc, where } from 'firebase/firestore';
import { seedDatabase } from './lib/seed';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>('teacher');
  const [activeTab, setActiveTab] = useState('home');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('+90 555 123 45 67');
  const [userAvatar, setUserAvatar] = useState('');
  const [isDeviceLinked, setIsDeviceLinked] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserEmail(user.email || '');
        
        // Seed database on first run for developer
        if (user.email === 'ogenderunpc@gmail.com') {
          seedDatabase();
          // Ensure they are in the yoneticiler and teachers collection
          await setDoc(doc(db, 'yoneticiler', user.uid), {
            email: user.email,
            role: 'admin',
            name: 'OGE Admin',
            olusturma_tarihi: new Date().toISOString()
          }, { merge: true });
          await setDoc(doc(db, 'teachers', user.uid), {
            email: user.email,
            role: 'teacher',
            name: 'OGE Admin',
            avatar: user.photoURL || null
          }, { merge: true });
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
            setRole('parent');
            setUserName(data.name || user.displayName || 'Veli');
            setUserAvatar(data.avatar || user.photoURL || `https://ui-avatars.com/api/?name=${data.name || 'Veli'}`);
          } else {
            // Default to teacher if not found (for seeding purposes)
            setRole('teacher');
            setUserName(user.displayName || 'Öğretmen');
          }
        }
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
    });

    const unsubClasses = onSnapshot(collection(db, 'classes'), (snapshot) => {
      setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassSession)));
    });

    const unsubMessages = onSnapshot(
      query(
        collection(db, 'messages'), 
        where('senderId', '==', auth.currentUser?.uid || 'anonymous'),
        orderBy('createdAt', 'asc')
      ), 
      (sentSnapshot) => {
        const sent = sentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
        
        onSnapshot(
          query(
            collection(db, 'messages'), 
            where('recipientId', '==', auth.currentUser?.uid || 'anonymous'),
            orderBy('createdAt', 'asc')
          ), 
          (receivedSnapshot) => {
            const received = receivedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            const allMessages = [...sent, ...received].sort((a, b) => 
              new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
            setMessages(allMessages);
          }
        );
      }
    );

    return () => {
      unsubStudents();
      unsubClasses();
      unsubMessages();
    };
  }, [isLoggedIn]);

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
          ? <TeacherDashboard messages={messages} classes={classes} students={students} setClasses={setClasses} onNavigate={setActiveTab} activeTab={activeTab} /> 
          : <ParentDashboard messages={messages} classes={classes} userName={userName} onNavigate={setActiveTab} students={students} activeTab={activeTab} />;
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
          ? <TeacherDashboard messages={messages} classes={classes} students={students} setClasses={setClasses} onNavigate={setActiveTab} /> 
          : <ParentDashboard messages={messages} classes={classes} userName={userName} onNavigate={setActiveTab} />;
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
    >
      {renderContent()}
    </Layout>
  );
}
