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
import { useLocalStorage } from './hooks/useLocalStorage';
import { STUDENTS as INITIAL_STUDENTS, CLASSES as INITIAL_CLASSES, RECENT_MESSAGES as INITIAL_MESSAGES } from './constants';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('isLoggedIn', false);
  const [role, setRole] = useLocalStorage<Role>('role', 'teacher');
  const [activeTab, setActiveTab] = useState('home');
  
  const [students, setStudents] = useLocalStorage<Student[]>('students', INITIAL_STUDENTS);
  const [classes, setClasses] = useLocalStorage<ClassSession[]>('classes', INITIAL_CLASSES);
  const [messages, setMessages] = useLocalStorage<Message[]>('messages', INITIAL_MESSAGES);

  const [teacherAvatar, setTeacherAvatar] = useLocalStorage<string>('teacherAvatar', "https://lh3.googleusercontent.com/aida-public/AB6AXuDe2PJTYBt9RL9CuhjZsSLoXQiK3M9zDmFR4fyfO0G6UJgb_bJHazeXsJxYJc_zuOWpG5zOX2cBF34LsC1Qtw2xugvkmf2YEvCucosQ4VXwgsE_VS8lQOyGxVNVI8gIAfThpHh5X4d_b8YOXW7Df9W_Z0aR3M0Sf3Lv6bMWderfeg_ReOUxg8Cy8vrpfom5FXEbGCGO5Mmu8IBMcQLSxS1ht6Bq5nBZ0pJC8K1CDcEcBuH16tScV6YGnEwmoyp4EP2m95fDg_njSZV9");
  const [parentAvatar, setParentAvatar] = useLocalStorage<string>('parentAvatar', "https://lh3.googleusercontent.com/aida-public/AB6AXuDUxF_RxLpdrVDMunvdMJSIs3jqBUBF4iaRh5Oc5Z8tvGTzfr3C-wmtDCiO1z_Tj3YHJrn9vyy91mxRsbcBEOdOBZsPuN0FQ6unBFZHmlninOKvvb6FOPVCh11GiMuLUtI6LwDa16ryC8Up8PBkkxiK4T0pS5NFS7edDTtbFv1LhfjyTygN8rwNzJS9loxREO7eSxrNauqu4IkH5bu6eGGLTfC5qRxfM-U_W8JMBGkBnd8C-31CbenZJ66zX0coFdXydurTAIT3IsPD");

  const [userName, setUserName] = useLocalStorage<string>('userName', role === 'teacher' ? 'Ahmet Yılmaz' : 'Ahmet Demir');
  const [userEmail, setUserEmail] = useLocalStorage<string>('userEmail', role === 'teacher' ? 'ahmet@aeon.edu' : 'ahmet.veli@mail.com');
  const [userPhone, setUserPhone] = useLocalStorage<string>('userPhone', '+90 555 123 45 67');
  const [isDeviceLinked, setIsDeviceLinked] = useLocalStorage<boolean>('isDeviceLinked', false);

  const userAvatar = role === 'teacher' ? teacherAvatar : parentAvatar;

  const handleUpdateProfile = (data: { avatar?: string; name?: string; email?: string; phone?: string }) => {
    if (data.avatar !== undefined) {
      if (role === 'teacher') setTeacherAvatar(data.avatar);
      else setParentAvatar(data.avatar);
    }
    if (data.name !== undefined) setUserName(data.name);
    if (data.email !== undefined) setUserEmail(data.email);
    if (data.phone !== undefined) setUserPhone(data.phone);
  };

  const handleUpdateAvatar = (newAvatar: string) => {
    handleUpdateProfile({ avatar: newAvatar });
  };

  useEffect(() => {
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error('Error fetching messages:', err));
  }, []);

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
          ? <TeacherDashboard messages={messages} classes={classes} students={students} setClasses={setClasses} onNavigate={setActiveTab} /> 
          : <ParentDashboard messages={messages} classes={classes} userName={userName} onNavigate={setActiveTab} />;
      case 'portal':
        return role === 'teacher' ? <PortalPage students={students} setStudents={setStudents} classes={classes} /> : <ParentDashboard messages={messages} classes={classes} userName={userName} onNavigate={setActiveTab} />;
      case 'schedule':
        return <SchedulePage role={role} />;
      case 'messages':
        return <MessagesPage messages={messages} setMessages={setMessages} role={role} userAvatar={userAvatar} students={students} />;
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
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      userAvatar={userAvatar}
    >
      {renderContent()}
    </Layout>
  );
}
