import React, { useState } from 'react';
import { Bell, Loader2, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function TeacherSidebarExtra() {
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content || !auth.currentUser) return;

    setIsSavingAnnouncement(true);
    try {
      await addDoc(collection(db, 'announcements'), {
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        date: new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        teacherId: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      });
      
      setNewAnnouncement({ title: '', content: '' });
      // Toast notification is managed by the page usually, here we can just show a small local success
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'announcements');
    } finally {
      setIsSavingAnnouncement(false);
    }
  };

  return (
    <div className="space-y-4 px-2">
      <div className="flex items-center gap-2 mb-4">
        <Bell size={16} className="text-secondary" />
        <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Duyuru Yönetimi</h3>
      </div>
      
      <form onSubmit={handleAddAnnouncement} className="space-y-3">
        <div className="space-y-1.5">
          <input 
            type="text"
            placeholder="Duyuru Başlığı"
            value={newAnnouncement.title}
            onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-[#111] border border-white/10 rounded-lg py-2 px-3 text-xs text-white placeholder:text-white/20 focus:border-secondary/50 outline-none transition-all"
            required
          />
        </div>
        <div className="space-y-1.5">
          <textarea 
            placeholder="Duyuru Detayı"
            value={newAnnouncement.content}
            onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
            className="w-full bg-[#111] border border-white/10 rounded-lg py-2 px-3 text-xs text-white placeholder:text-white/20 focus:border-secondary/50 outline-none transition-all min-h-[100px] resize-none"
            required
          />
        </div>
        <button 
          type="submit"
          disabled={isSavingAnnouncement || !newAnnouncement.title || !newAnnouncement.content}
          className="w-full py-2.5 bg-secondary text-black text-[10px] font-black rounded-lg hover:bg-white transition-all uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSavingAnnouncement ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
          Duyuruyu Yayınla
        </button>
      </form>
    </div>
  );
}
