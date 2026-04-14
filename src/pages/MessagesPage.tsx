import React from 'react';
import { Search, Plus, MoreVertical, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { MESSAGES } from '../constants';

export default function MessagesPage() {
  return (
    <div className="space-y-8">
      <header>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">Mesajlar</h2>
          <button className="w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center shadow-lg shadow-secondary/20 active:scale-95 transition-all">
            <Plus size={24} />
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
          <input 
            type="text" 
            placeholder="Mesajlarda ara..." 
            className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
      </header>

      <div className="space-y-4">
        {MESSAGES.map((msg, i) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface-container-lowest p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-full bg-surface-container overflow-hidden flex-shrink-0 border border-outline-variant/10">
              <img 
                src={msg.avatar || `https://i.pravatar.cc/150?u=${msg.sender}`} 
                alt={msg.sender} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-primary truncate">{msg.sender}</h4>
                <span className="text-[10px] font-medium text-outline whitespace-nowrap">{msg.time}</span>
              </div>
              <p className="text-xs text-on-surface-variant font-medium truncate group-hover:text-primary transition-colors">
                <span className="text-secondary font-bold mr-1">[{msg.senderRole}]</span>
                {msg.content}
              </p>
            </div>
            
            <button className="w-8 h-8 flex items-center justify-center text-outline-variant hover:text-primary transition-colors">
              <MoreVertical size={20} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Quick Reply Simulation */}
      <div className="fixed bottom-28 left-6 right-6 lg:left-auto lg:right-auto lg:w-[calc(100vw-48px)] max-w-screen-2xl mx-auto z-40">
        <div className="bg-white/80 backdrop-blur-xl border border-outline-variant/20 rounded-2xl p-2 flex items-center gap-2 shadow-2xl">
          <input 
            type="text" 
            placeholder="Hızlı yanıt yaz..." 
            className="flex-grow bg-transparent border-none focus:ring-0 py-3 px-4 text-sm"
          />
          <button className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center active:scale-95 transition-all">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
