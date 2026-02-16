/**
 * Lead Sync Script - Firestore Integration
 * Cleans fake leads and syncs qualified leads
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where } = require('firebase/firestore');
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
  console.log('🔄 Starting Lead Sync...\n');
  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  // Step 1: Fetch existing leads
  console.log('📊 Fetching existing leads from Firestore...');
  const snapshot = await getDocs(collection(db, 'leads'));
  const existingLeads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log(`   Found ${existingLeads.length} existing leads\n`);
  
  // Step 2: Identify fake leads to delete
  // Fake lead criteria:
  // - No phone AND no email
  // - Test/fake company names
  // - Duplicates
  const fakePatterns = [/test/i, /fake/i, /sample/i, /demo/i, /example/i, /^$/];
  const leadsToDelete = [];
  const validLeads = [];
  
  for (const lead of existingLeads) {
    const hasPhone = lead.phone && lead.phone.trim().length > 0;
    const hasEmail = lead.email && lead.email.trim().length > 0;
    const hasCompany = lead.company && lead.company.trim().length > 0;
    const isFakePattern = fakePatterns.some(p => p.test(lead.company || ''));
    
    if ((!hasPhone && !hasEmail) || !hasCompany || isFakePattern) {
      leadsToDelete.push(lead);
    } else {
      validLeads.push(lead);
    }
  }
  
  console.log(`🗑️  Identified ${leadsToDelete.length} fake/incomplete leads to delete`);
  console.log(`✅  Kept ${validLeads.length} valid leads\n`);
  
  // Step 3: Delete fake leads
  console.log('🗑️  Deleting fake leads from Firestore...');
  for (const lead of leadsToDelete) {
    await deleteDoc(doc(db, 'leads', lead.id));
    console.log(`   Deleted: ${lead.company || lead.id}`);
  }
  console.log(`   Done! Deleted ${leadsToDelete.length} leads\n`);
  
  // Step 4: Load qualified leads from CSV
  console.log('📄 Loading qualified leads from CSV...');
  const csvPath = '/data/workspace/memory/qualified-leads.csv';
  const csvFile = fs.readFileSync(csvPath, 'utf8');
  const { data: qualifiedLeads } = Papa.parse(csvFile, { header: true, skipEmptyLines: true });
  console.log(`   Loaded ${qualifiedLeads.length} qualified leads\n`);
  
  // Step 5: Check for duplicates before adding
  console.log('🔍 Checking for duplicates...');
  const existingCompanies = new Set(validLeads.map(l => l.company?.toLowerCase()));
  const newLeads = qualifiedLeads.filter(l => !existingCompanies.has(l.company?.toLowerCase()));
  console.log(`   ${newLeads.length} new leads to add (${qualifiedLeads.length - newLeads.length} duplicates skipped)\n`);
  
  // Step 6: Add qualified leads to Firestore
  console.log('📤 Adding qualified leads to Firestore...');
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
  console.log('✅ SYNC COMPLETE');
  console.log('='.repeat(50));
  console.log(`Total leads deleted: ${leadsToDelete.length}`);
  console.log(`Total leads added: ${successCount}`);
  console.log(`Failed to add: ${failCount}`);
  
  const finalCount = validLeads.length + successCount;
  console.log(`\n📊 Final lead count in Firestore: ${finalCount}`);
}

main().catch(console.error);