import { db } from './firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { STUDENTS, CLASSES, MESSAGES } from '../constants';

export async function seedDatabase() {
  try {
    const studentsSnap = await getDocs(collection(db, 'students'));
    if (studentsSnap.empty) {
      console.log('Seeding students...');
      for (const student of STUDENTS) {
        await setDoc(doc(db, 'students', student.id), {
          ...student,
          password: student.password || 'oge1212' // Default password for seeding
        });
      }
    } else {
      // Patch existing students with parentEmail if missing
      for (const docSnap of studentsSnap.docs) {
        const data = docSnap.data();
        if (!data.parentEmail) {
          const match = STUDENTS.find(m => m.id === docSnap.id);
          if (match && match.parentEmail) {
            await setDoc(doc(db, 'students', docSnap.id), {
              ...data,
              parentEmail: match.parentEmail
            }, { merge: true });
          }
        }
      }
    }

    const classesSnap = await getDocs(collection(db, 'classes'));
    if (classesSnap.empty) {
      console.log('Seeding classes...');
      for (const cls of CLASSES) {
        await setDoc(doc(db, 'classes', cls.id), cls);
      }
    }

    const messagesSnap = await getDocs(collection(db, 'messages'));
    if (messagesSnap.empty) {
      console.log('Seeding messages...');
      for (const msg of MESSAGES) {
        await setDoc(doc(db, 'messages', msg.id), {
          ...msg,
          createdAt: new Date().toISOString()
        });
      }
    } else {
      // Update existing messages with IDs and fields if missing (patch for existing data)
      for (const docSnap of messagesSnap.docs) {
        const data = docSnap.data();
        if (!data.recipientId) {
          const match = MESSAGES.find(m => m.id === docSnap.id);
          if (match) {
            await setDoc(doc(db, 'messages', docSnap.id), {
              ...data,
              recipientId: match.recipientId,
              senderId: match.senderId
            }, { merge: true });
          }
        }
      }
    }

    // Ensure specific admin record exists for the developer
    const adminEmail = 'ogenderunpc@gmail.com';
    const adminsSnap = await getDocs(collection(db, 'yoneticiler'));
    if (adminsSnap.empty) {
      console.log('Creating initial admin record...');
    }
    
    const teachersSnap = await getDocs(collection(db, 'teachers'));
    if (teachersSnap.empty) {
      console.log('Seeding teachers...');
      const teachers = [
        { id: 'teacher_test', name: 'Test Öğretmeni', role: 'teacher', email: 'ogretmen@example.com', avatar: 'https://i.pravatar.cc/150?u=test_teacher' },
        { id: 'teacher_1', name: 'Zeynep Kaya', role: 'teacher', email: 'zeynep@ogeacademy.com', avatar: 'https://i.pravatar.cc/150?u=zeynep' },
        { id: 'teacher_2', name: 'Murat Aras', role: 'teacher', email: 'murat@ogeacademy.com', avatar: 'https://i.pravatar.cc/150?u=murat' }
      ];
      for (const teacher of teachers) {
        await setDoc(doc(db, 'teachers', teacher.id), teacher);
      }
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
