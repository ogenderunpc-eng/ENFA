import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, orderBy, limit } from "firebase/firestore";
import { db, auth, OperationType, handleFirestoreError } from "../lib/firebase";
import { AppNotification } from "../types";

export const notificationService = {
  getNotifications: (userId: string, callback: (notifications: AppNotification[]) => void) => {
    const path = "notifications";
    const q = query(
      collection(db, path),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AppNotification[];
      callback(notifications);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  markAsRead: async (notificationId: string) => {
    const path = `notifications/${notificationId}`;
    try {
      const ref = doc(db, "notifications", notificationId);
      await updateDoc(ref, { isRead: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  clearAllNotifications: async (notifications: AppNotification[]) => {
    const { writeBatch, doc } = await import("firebase/firestore");
    const batch = writeBatch(db);
    notifications.forEach(n => {
      const ref = doc(db, "notifications", n.id);
      batch.update(ref, { isRead: true });
    });
    try {
      await batch.commit();
    } catch (error) {
       console.error("Batch clear failed", error);
    }
  },

  createNotification: async (notification: Omit<AppNotification, "id" | "isRead" | "createdAt">) => {
    const path = "notifications";
    try {
      await addDoc(collection(db, path), {
        ...notification,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      
      // If browser permission granted, show browser notification
      if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.content,
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  requestPermission: async () => {
    if (typeof window === 'undefined' || !("Notification" in window)) {
      return;
    }

    if (Notification.permission !== "denied" && Notification.permission !== "granted") {
      await Notification.requestPermission();
    }
  }
};
