import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, MoreVertical, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, Role, Student } from '../types';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface MessagesPageProps {
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  role: Role;
  userName: string;
  userAvatar: string;
  students: Student[];
}

export default function MessagesPage({ messages, setMessages, role, userName, userAvatar, students }: MessagesPageProps) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [targetStudent, setTargetStudent] = useState<Student | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedChat) {
      scrollToBottom();
    }
  }, [selectedChat, messages]);

  const myId = auth.currentUser?.uid;

  // Group messages into conversations based on the "other" person
  const chatsMap = messages.reduce((acc, msg) => {
    // If I'm the sender, the "partner" is the recipient. If I'm the recipient, the partner is the sender.
    const partnerId = msg.senderId === myId ? msg.recipientId : msg.senderId;
    if (!partnerId) return acc;

    if (!acc[partnerId]) {
      acc[partnerId] = [];
    }
    acc[partnerId].push(msg);
    return acc;
  }, {} as Record<string, Message[]>);

  // Convert to array of unique conversations with latest message
  const chatList = Object.entries(chatsMap).map(([partnerId, chatMessages]) => {
    const sorted = [...chatMessages].sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    const latest = sorted[0];
    return {
      partnerId,
      latest,
      allMessages: sorted.reverse() // Chrome order for display
    };
  }).sort((a, b) => 
    new Date(b.latest.createdAt || 0).getTime() - new Date(a.latest.createdAt || 0).getTime()
  );

  const activeChat = chatList.find(c => c.partnerId === selectedChat);

  const handleSendMessage = async (text?: string) => {
    const messageContent = text || replyText;
    if (!messageContent.trim() || isSending) return;

    setIsSending(true);

    const newMessageBody = {
      senderId: myId,
      sender: userName || 'İsimsiz Kullanıcı',
      senderRole: role === 'teacher' ? 'Öğretmen' : (role === 'student' ? 'Öğrenci' : 'Veli'),
      content: messageContent,
      avatar: userAvatar,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
      recipientId: isAddingNew ? (targetStudent?.id || 'school_admin') : (selectedChat || 'school_admin')
    };

    try {
      await addDoc(collection(db, 'messages'), newMessageBody);
      if (isAddingNew) {
        setIsAddingNew(false);
        setTargetStudent(null);
        setSelectedChat(newMessageBody.recipientId);
      }
      setReplyText('');
    } catch (error) {
      console.error('Mesaj gönderim hatası:', error);
    } finally {
      setIsSending(false);
    }
  };

  const filteredChatList = chatList.filter(chat => 
    (chat.latest.sender?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (chat.latest.content?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      <AnimatePresence mode="wait">
        {!selectedChat ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8 flex-1 overflow-y-auto pr-2 no-scrollbar"
          >
            <header>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-extrabold text-primary tracking-tight">Enderun Chat 💬</h2>
                <button 
                  onClick={() => setIsAddingNew(true)}
                  className="w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center shadow-lg shadow-secondary/20 active:scale-95 transition-all outline-none border-none"
                >
                  <Plus size={24} />
                </button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
                <input 
                  type="text" 
                  placeholder="Mesajlarda ara..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary transition-all outline-none"
                />
              </div>
            </header>

            <div className="space-y-4">
              {filteredChatList.map((chat, i) => (
                <motion.div 
                  key={chat.partnerId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedChat(chat.partnerId)}
                  className="bg-surface-container-lowest p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer group border border-transparent hover:border-secondary/20"
                >
                  <div className="w-14 h-14 rounded-full bg-surface-container overflow-hidden flex-shrink-0 border border-outline-variant/10">
                    <img 
                      src={chat.latest.avatar || `https://i.pravatar.cc/150?u=${chat.partnerId}`} 
                      alt={chat.latest.sender} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-primary truncate">{chat.partnerId === 'school_admin' ? 'Okul Yönetimi' : chat.latest.sender}</h4>
                      <span className="text-[10px] font-medium text-outline whitespace-nowrap">{chat.latest.time}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant font-medium truncate group-hover:text-primary transition-colors">
                      {chat.latest.senderId === myId && <span className="text-secondary font-bold mr-1">Siz:</span>}
                      {chat.latest.content}
                    </p>
                  </div>
                  
                  <button className="w-8 h-8 flex items-center justify-center text-outline-variant hover:text-primary transition-colors border-none bg-transparent outline-none">
                    <MoreVertical size={20} />
                  </button>
                </motion.div>
              ))}
              {filteredChatList.length === 0 && (
                <div className="text-center py-12 bg-surface-container-low rounded-3xl">
                  <p className="text-on-surface-variant font-medium text-sm">Henüz mesaj bulunmuyor.</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full bg-surface-container-lowest rounded-3xl shadow-xl overflow-hidden border border-outline-variant/10"
          >
            {/* Chat Header */}
            <header className="p-4 bg-white border-b border-outline-variant/10 flex items-center gap-4">
              <button 
                onClick={() => setSelectedChat(null)}
                className="p-2 hover:bg-surface-container rounded-full transition-colors border-none bg-transparent outline-none"
              >
                <ArrowLeft size={24} className="text-primary" />
              </button>
              <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/20">
                <img src={activeChat?.latest.avatar || `https://i.pravatar.cc/150?u=${activeChat?.partnerId}`} alt="partner" referrerPolicy="no-referrer" />
              </div>
              <div>
                <h4 className="font-bold text-primary leading-tight">
                  {selectedChat === 'school_admin' ? 'Okul Yönetimi' : activeChat?.latest.sender}
                </h4>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                  {selectedChat === 'school_admin' ? 'RESMİ KANAL' : activeChat?.latest.senderRole}
                </p>
              </div>
              <button className="ml-auto p-2 text-outline-variant hover:text-primary transition-colors border-none bg-transparent outline-none">
                <MoreVertical size={20} />
              </button>
            </header>

            {/* Chat Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-surface-container/30 no-scrollbar">
              {activeChat?.allMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col gap-1 max-w-[80%] ${msg.senderId === myId ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <div className={`p-4 rounded-2xl shadow-sm border border-outline-variant/10 ${
                    msg.senderId === myId 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white text-on-surface rounded-tl-none'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                  <span className="text-[10px] text-outline px-2 font-medium">{msg.time}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Footer */}
            <footer className="p-4 bg-white border-t border-outline-variant/10">
              <div className="flex items-center gap-3 bg-surface-container-low rounded-2xl p-2 pr-4 border border-outline-variant/5">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Mesajınızı buraya yazın..." 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-grow bg-transparent border-none focus:ring-0 py-3 px-4 text-sm text-on-surface outline-none"
                />
                <button 
                  onClick={() => handleSendMessage()}
                  disabled={isSending}
                  className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-primary/20 hover:ring-4 hover:ring-primary/10 border-none disabled:opacity-50 outline-none"
                >
                  {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                </button>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddingNew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-gray-900"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center text-gray-900 font-bold">
                <h3 className="text-xl">
                  {role === 'teacher' ? 'Alıcı Seçin' : 'Öğretmene Mesaj'}
                </h3>
                <button onClick={() => { setIsAddingNew(false); setTargetStudent(null); }} className="text-gray-400 hover:text-gray-600 border-none bg-transparent">
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                {!targetStudent && role === 'teacher' ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2 no-scrollbar">
                    {students.map(student => (
                      <button
                        key={student.id}
                        onClick={() => setTargetStudent(student)}
                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 bg-white"
                      >
                        <img src={student.avatar || `https://i.pravatar.cc/150?u=${student.name}`} alt={student.name} className="w-12 h-12 rounded-full object-cover" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.class} - {student.parentName}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 text-gray-900">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <img 
                        src={targetStudent?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuDe2PJTYBt9RL9CuhjZsSLoXQiK3M9zDmFR4fyfO0G6UJgb_bJHazeXsJxYJc_zuOWpG5zOX2cBF34LsC1Qtw2xugvkmf2YEvCucosQ4VXwgsE_VS8lQOyGxVNVI8gIAfThpHh5X4d_b8YOXW7Df9W_Z0aR3M0Sf3Lv6bMWderfeg_ReOUxg8Cy8vrpfom5FXEbGCGO5Mmu8IBMcQLSxS1ht6Bq5nBZ0pJC8K1CDcEcBuH16tScV6YGnEwmoyp4EP2m95fDg_njSZV9"} 
                        alt="Recipient" 
                        className="w-12 h-12 rounded-full object-cover" 
                      />
                      <div>
                        <p className="font-semibold">
                          {role === 'teacher' ? `${targetStudent?.name} Velisi` : 'Okul Yönetimi / Öğretmen'}
                        </p>
                        <p className="text-sm text-gray-500">Yeni Mesaj</p>
                      </div>
                    </div>
                    <textarea
                      placeholder="Mesajınızı yazın..."
                      className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-secondary h-32 resize-none text-gray-900"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={isSending}
                      className="w-full py-4 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 border-none disabled:opacity-50"
                    >
                      {isSending ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                      {isSending ? 'Gönderiliyor...' : 'Gönder'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
