import React from 'react';
import { User, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { Student } from '../types';

interface StudentCardProps {
  student: Student;
  attendanceStatus?: 'present' | 'absent' | 'late' | 'not-set';
  onStatusChange?: (status: 'present' | 'absent' | 'late') => void;
  onClick?: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, attendanceStatus = 'not-set', onStatusChange, onClick }) => {
  const getStatusConfig = () => {
    switch (attendanceStatus) {
      case 'present':
        return { color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: <CheckCircle2 size={14} />, label: 'Burada' };
      case 'absent':
        return { color: 'bg-error/10 text-error border-error/20', icon: <XCircle size={14} />, label: 'Gelmedi' };
      case 'late':
        return { color: 'bg-accent/10 text-accent border-accent/20', icon: <Clock size={14} />, label: 'Geç Kaldı' };
      default:
        return { color: 'bg-surface-container text-outline border-outline-variant/10', icon: null, label: 'Yoklama Alınmadı' };
    }
  };

  const config = getStatusConfig();

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`info-card flex flex-col gap-4 cursor-pointer border-2 transition-all ${
        attendanceStatus === 'not-set' ? 'border-transparent' : 'border-accent/10'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-secondary/20 bg-surface-container flex items-center justify-center shrink-0">
          {student.avatar ? (
            <img 
              src={student.avatar} 
              alt={student.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User size={24} className="text-outline-variant" />
          )}
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-primary truncate">{student.name}</h3>
          <p className="text-xs text-on-surface-variant font-medium">{student.class || 'Sınıf Belirtilmedi'}</p>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${config.color}`}>
          {config.icon}
          {config.label}
        </div>
      </div>

      {onStatusChange && (
        <div className="flex gap-2 pt-2 border-t border-outline-variant/5">
          <button 
            onClick={(e) => { e.stopPropagation(); onStatusChange('present'); }}
            className={`flex-grow py-2 rounded-lg text-xs font-bold transition-all ${
              attendanceStatus === 'present' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
            }`}
          >
            Burada
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onStatusChange('late'); }}
            className={`flex-grow py-2 rounded-lg text-xs font-bold transition-all ${
              attendanceStatus === 'late' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-accent/10 text-accent hover:bg-accent/20'
            }`}
          >
            Geç
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onStatusChange('absent'); }}
            className={`flex-grow py-2 rounded-lg text-xs font-bold transition-all ${
              attendanceStatus === 'absent' ? 'bg-error text-white shadow-lg shadow-error/20' : 'bg-error/10 text-error hover:bg-error/20'
            }`}
          >
            Gelmedi
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default StudentCard;
