/**
 * Lead Sync Script - Batch 3 (Agroalimentaire & Pharmaceutique)
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, doc, query, where } = require('firebase/firestore');
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
  console.log('🔄 Starting Lead Sync - Batch 3 (Agro & Pharma)...\n');
  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  // Step 1: Get existing leads
  console.log('📊 Fetching existing leads from Firestore...');
  const snapshot = await getDocs(collection(db, 'leads'));
  const existingLeads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log(`   Found ${existingLeads.length} existing leads\n`);
  
  // Step 2: Load new leads
  console.log('📄 Loading leads from CSV...');
  const csvPath = '/data/workspace/memory/leads-batch-3.csv';
  const csvFile = fs.readFileSync(csvPath, 'utf8');
  const { data: newLeadsRaw } = Papa.parse(csvFile, { header: true, skipEmptyLines: true });
  console.log(`   Loaded ${newLeadsRaw.length} new leads\n`);
  
  // Step 3: Check duplicates
  console.log('🔍 Checking for duplicates...');
  const existingCompanies = new Set(existingLeads.map(l => l.company?.toLowerCase()));
  const newLeads = newLeadsRaw.filter(l => !existingCompanies.has(l.company?.toLowerCase()));
  console.log(`   ${newLeads.length} new leads to add (${newLeadsRaw.length - newLeads.length} duplicates skipped)\n`);
  
  // Step 4: Add to Firestore
  console.log('📤 Adding leads to Firestore...');
  let successCount = 0;
  let failCount = 0;
  
  for (const lead of newLeads) {
    try {
      await addDoc(collection(db, 'leads'), {
        ...lead,
        status: 'new',
        erp_relevance: lead.erp_relevance || 'Medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      successCount++;
      console.log(`   ✅ ${lead.company}`);
    } catch (error) {
      failCount++;
      console.log(`   ❌ ${lead.company}: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ BATCH 3 SYNC COMPLETE');
  console.log('='.repeat(50));
  console.log(`Total leads added: ${successCount}`);
  console.log(`Failed to add: ${failCount}`);
  
  const finalCount = existingLeads.length + successCount;
  console.log(`\n📊 Final lead count in Firestore: ${finalCount}`);
}

main().catch(console.error);