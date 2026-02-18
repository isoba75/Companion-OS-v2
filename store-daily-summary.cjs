/**
 * Store Daily Summary in Firestore
 * Run this at end of each day
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Firebase config (same as Mission Control)
const firebaseConfig = {
  apiKey: "AIzaSyBu4JBoV3J20mhNgHPDgAWdHJQ-m6uF3do",
  authDomain: "companion-os-v2.firebaseapp.com",
  projectId: "companion-os-v2",
};

initializeApp(firebaseConfig);
const db = getFirestore();

async function storeDailySummary(summary) {
  try {
    const docRef = await addDoc(collection(db, 'daily_summaries'), {
      ...summary,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    });
    console.log('✅ Summary stored:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Example: Store today's summary
const todaySummary = {
  achievements: [
    "Defined JC's identity, roles, and tone",
    "Updated Mission Control with CEO branding",
    "Fixed Tasks page (mobile-responsive)",
    "Built real Second Brain with inbox & templates",
    "Migrated 5 mission reports to Notion",
    "Scheduled tomorrow's tasks"
  ],
  tomorrowSchedule: {
    "09:00": "Morning Brief",
    "09:30": "Self-Improvement Results Session",
    "10:00": "Analytics Discussion",
    "11:00": "Multi-Channel Group Setup"
  },
  tone: "CEO mode - directive, strategic",
  focus: "Learning business context, AgriBuntu focus"
};

// Run if called directly
if (require.main === module) {
  storeDailySummary(todaySummary);
}

module.exports = { storeDailySummary };