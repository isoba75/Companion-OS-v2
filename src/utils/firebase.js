/**
 * Firebase/Firestore Configuration
 * Companion-OS v2
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBu4JBoV3J20mhNgHPDgAWdHJQ-m6uF3do",
  authDomain: "companion-os-v2.firebaseapp.com",
  projectId: "companion-os-v2",
  storageBucket: "companion-os-v2.firebasestorage.app",
  messagingSenderId: "728909359341",
  appId: "1:728909359341:web:6e2dcd2c4b2ee04edc44e4",
  measurementId: "G-PZ6SLG0BJR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection names
export const COLLECTIONS = {
  LEADS: 'leads',
  TASKS: 'tasks',
  METRICS: 'metrics',
  DECISIONS: 'decisions',
  CHAT: 'mission_control_chat'
};

// Chat operations
export async function sendChatMessage(text, sessionId = 'web') {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.CHAT), {
      type: 'user',
      text,
      sessionId,
      createdAt: new Date().toISOString(),
      timestamp: Date.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: error.message };
  }
}

export async function getChatMessages(sessionId = 'web', limitCount = 50) {
  try {
    const q = query(
      collection(db, COLLECTIONS.CHAT),
      where('sessionId', '==', sessionId),
      orderBy('timestamp', 'asc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    const messages = [];
    snapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: messages };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function addChatResponse(text, originalMessageId, sessionId = 'assistant') {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.CHAT), {
      type: 'assistant',
      text,
      originalMessageId,
      sessionId,
      createdAt: new Date().toISOString(),
      timestamp: Date.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding response:', error);
    return { success: false, error: error.message };
  }
}

// Lead operations
export async function addLead(leadData) {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.LEADS), {
      ...leadData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding lead:', error);
    return { success: false, error: error.message };
  }
}

export async function getLeads(filters = {}) {
  try {
    let q = collection(db, COLLECTIONS.LEADS);
    const constraints = [];
    
    if (filters.country) {
      constraints.push(where('country', '==', filters.country));
    }
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters.source) {
      constraints.push(where('source', '==', filters.source));
    }
    
    constraints.push(orderBy('createdAt', 'desc'));
    if (filters.limit) {
      constraints.push(limit(filters.limit));
    }
    
    q = query(q, ...constraints);
    const snapshot = await getDocs(q);
    
    return {
      success: true,
      data: snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    };
  } catch (error) {
    console.error('Error fetching leads:', error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function updateLead(leadId, updates) {
  try {
    const leadRef = doc(db, COLLECTIONS.LEADS, leadId);
    await updateDoc(leadRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating lead:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteLead(leadId) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.LEADS, leadId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting lead:', error);
    return { success: false, error: error.message };
  }
}

// Metrics operations
export async function getMetrics() {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.METRICS));
    const data = {};
    snapshot.docs.forEach(doc => {
      data[doc.id] = doc.data();
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return { success: false, error: error.message, data: {} };
  }
}

export async function updateMetric(metricId, value) {
  try {
    const metricRef = doc(db, COLLECTIONS.METRICS, metricId);
    await updateDoc(metricRef, {
      value,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating metric:', error);
    return { success: false, error: error.message };
  }
}

// Task operations
export async function getTasks() {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.TASKS));
    const tasks = {
      backlog: [],
      thisWeek: [],
      doing: [],
      done: []
    };
    snapshot.docs.forEach(doc => {
      const task = { id: doc.id, ...doc.data() };
      if (tasks[task.status]) {
        tasks[task.status].push(task);
      }
    });
    return { success: true, data: tasks };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return { success: false, error: error.message, data: null };
  }
}

export async function createTask(taskData) {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.TASKS), {
      ...taskData,
      createdAt: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating task:', error);
    return { success: false, error: error.message };
  }
}

export async function updateTaskStatus(taskId, newStatus) {
  try {
    const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
    await updateDoc(taskRef, {
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating task:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteTask(taskId) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.TASKS, taskId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { success: false, error: error.message };
  }
}

export { db, app };