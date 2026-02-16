/**
 * Lead Sync Script - Batch 7 (Major Companies)
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');
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
  console.log('🔄 Starting Lead Sync - Batch 7 (Major Companies)...\n');
  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  console.log('📊 Fetching existing leads from Firestore...');
  const snapshot = await getDocs(collection(db, 'leads'));
  const existingLeads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log(`   Found ${existingLeads.length} existing leads\n`);
  
  console.log('📄 Loading leads from CSV...');
  const csvPath = '/data/workspace/memory/leads-batch-7.csv';
  const csvFile = fs.readFileSync(csvPath, 'utf8');
  const { data: newLeadsRaw } = Papa.parse(csvFile, { header: true, skipEmptyLines: true });
  
  // Filter: Only include leads with phone OR email
  const newLeads = newLeadsRaw.filter(lead => {
    const hasPhone = lead.phone && lead.phone.trim() && lead.phone.trim().length > 0;
    const hasEmail = lead.email && lead.email.trim() && lead.email.trim().length > 0;
    return hasPhone || hasEmail;
  });
  
  console.log(`   Loaded ${newLeadsRaw.length} leads from CSV`);
  console.log(`   ${newLeads.length} have phone or email (${newLeadsRaw.length - newLeads.length} filtered out)\n`);
  
  console.log('🔍 Checking for duplicates...');
  const existingCompanies = new Set(existingLeads.map(l => l.company?.toLowerCase()));
  const leadsToAdd = newLeads.filter(l => !existingCompanies.has(l.company?.toLowerCase()));
  console.log(`   ${leadsToAdd.length} new leads to add (${newLeads.length - leadsToAdd.length} duplicates skipped)\n`);
  
  console.log('📤 Adding leads to Firestore...');
  let successCount = 0;
  let failCount = 0;
  
  for (const lead of leadsToAdd) {
    try {
      await addDoc(collection(db, 'leads'), {
        ...lead,
        status: 'new',
        erp_relevance: lead.erp_relevance || 'Medium',
        has_contact: !!(lead.phone || lead.email),
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
  console.log('✅ BATCH 7 SYNC COMPLETE');
  console.log('='.repeat(50));
  console.log(`Total leads added: ${successCount}`);
  console.log(`Failed to add: ${failCount}`);
  
  const finalCount = existingLeads.length + successCount;
  console.log(`\n📊 Final lead count in Firestore: ${finalCount}`);
  console.log(`🎯 Need ${500 - finalCount} more to reach 500 target`);
}

main().catch(console.error);