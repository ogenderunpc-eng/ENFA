/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Role } from './types';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import SchedulePage from './pages/SchedulePage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import PortalPage from './pages/PortalPage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>('teacher');
  const [activeTab, setActiveTab] = useState('home');

  const handleLogin = (selectedRole: Role) => {
    setRole(selectedRole);
    setIsLoggedIn(true);
    setActiveTab('home');
  };

  const handleSwitchRole = () => {
    setRole(prev => prev === 'teacher' ? 'parent' : 'teacher');
  };

  const userAvatar = role === 'teacher' 
    ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDe2PJTYBt9RL9CuhjZsSLoXQiK3M9zDmFR4fyfO0G6UJgb_bJHazeXsJxYJc_zuOWpG5zOX2cBF34LsC1Qtw2xugvkmf2YEvCucosQ4VXwgsE_VS8lQOyGxVNVI8gIAfThpHh5X4d_b8YOXW7Df9W_Z0aR3M0Sf3Lv6bMWderfeg_ReOUxg8Cy8vrpfom5FXEbGCGO5Mmu8IBMcQLSxS1ht6Bq5nBZ0pJC8K1CDcEcBuH16tScV6YGnEwmoyp4EP2m95fDg_njSZV9"
    : "https://lh3.googleusercontent.com/aida-public/AB6AXuDUxF_RxLpdrVDMunvdMJSIs3jqBUBF4iaRh5Oc5Z8tvGTzfr3C-wmtDCiO1z_Tj3YHJrn9vyy91mxRsbcBEOdOBZsPuN0FQ6unBFZHmlninOKvvb6FOPVCh11GiMuLUtI6LwDa16ryC8Up8PBkkxiK4T0pS5NFS7edDTtbFv1LhfjyTygN8rwNzJS9loxREO7eSxrNauqu4IkH5bu6eGGLTfC5qRxfM-U_W8JMBGkBnd8C-31CbenZJ66zX0coFdXydurTAIT3IsPD";

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return role === 'teacher' ? <TeacherDashboard /> : <ParentDashboard />;
      case 'portal':
        return role === 'teacher' ? <PortalPage /> : <ParentDashboard />;
      case 'schedule':
        return <SchedulePage />;
      case 'messages':
        return <MessagesPage />;
      case 'profile':
        return <ProfilePage role={role} userAvatar={userAvatar} />;
      default:
        return role === 'teacher' ? <TeacherDashboard /> : <ParentDashboard />;
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
