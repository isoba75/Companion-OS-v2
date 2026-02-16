/**
 * Clean & Scrape Script
 * 1. Remove leads without phone AND email
 * 2. Continue scraping more leads to reach 500
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } = require('firebase/firestore');
const Papa = require('papaparse');
const fs = require('fs');

const firebaseConfig = {
  apiKey: "AIzaSyBu4JBoV3J20mhNgHPDgAWdHJQ-m6uF3do",
  authDomain: "companion-os-v2.firebaseapp.com",
  projectId: "companion-os-v2",
  storageBucket: "companion-os-v2.firebasestorage.app",
  messagingSenderId: "728909359341",
  appId: "1:728909359341:web:6e2dcd2c4b2ee04edc44e4",
  measurementId: "G-PZ6SLG0BJR"
};

async function main() {
  console.log('🧹 Starting Lead Cleanup & Scrape...\n');
  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  // STEP 1: Clean leads without phone AND email
  console.log('📊 Fetching existing leads from Firestore...');
  const snapshot = await getDocs(collection(db, 'leads'));
  const existingLeads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log(`   Found ${existingLeads.length} existing leads\n`);
  
  console.log('🔍 Identifying leads without phone AND email...');
  const leadsToRemove = existingLeads.filter(lead => {
    const hasPhone = lead.phone && lead.phone.trim() && lead.phone.trim().length > 0;
    const hasEmail = lead.email && lead.email.trim() && lead.email.trim().length > 0;
    return !hasPhone && !hasEmail;
  });
  
  console.log(`   Found ${leadsToRemove.length} leads to remove (no phone + no email)\n`);
  
  console.log('🗑️ Removing invalid leads...');
  for (const lead of leadsToRemove) {
    await deleteDoc(doc(db, 'leads', lead.id));
    console.log(`   Removed: ${lead.company || lead.id}`);
  }
  console.log(`   Done! Removed ${leadsToRemove.length} leads\n`);
  
  // Get count after cleanup
  const cleanedSnapshot = await getDocs(collection(db, 'leads'));
  const cleanedCount = cleanedSnapshot.docs.length;
  console.log(`📊 Leads remaining after cleanup: ${cleanedCount}\n`);
  
  // STEP 2: Calculate how many more to scrape
  const target = 500;
  const remaining = target - cleanedCount;
  
  if (remaining <= 0) {
    console.log(`✅ Already have ${cleanedCount} leads! Target reached.`);
    return;
  }
  
  console.log(`🎯 Need ${remaining} more leads to reach target of ${target}\n`);
  
  console.log('✅ Cleanup complete! Ready to continue scraping.');
}

main().catch(console.error);