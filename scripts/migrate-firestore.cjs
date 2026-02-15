/**
 * Firestore Data Migration Script
 * Run this ONCE to populate Firestore with initial leads
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

const firebaseConfig = {
  apiKey: "AIzaSyBu4JBoV3J20mhNgHPDgAWdHJQ-m6uF3do",
  authDomain: "companion-os-v2.firebaseapp.com",
  projectId: "companion-os-v2",
  storageBucket: "companion-os-v2.firebasestorage.app",
  messagingSenderId: "728909359341",
  appId: "1:728909359341:web:6e2dcd2c4b2ee04edc44e4",
  measurementId: "G-PZ6SLG0BJR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function parseCSVLine(line) {
  const values = line.split(',').map(v => v.trim());
  return values;
}

async function migrateLeads() {
  const csvFile = path.join(__dirname, '..', 'memory', 'digibuntu-leads.csv');
  
  console.log('📊 Reading leads from CSV...');
  const content = fs.readFileSync(csvFile, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  const dataLines = lines.slice(1);
  
  console.log(`📊 Found ${dataLines.length} leads to migrate`);
  
  // Clear existing leads
  console.log('🗑️  Clearing existing leads in Firestore...');
  const existingLeads = await getDocs(collection(db, 'leads'));
  for (const docSnapshot of existingLeads.docs) {
    await deleteDoc(docSnapshot.ref);
  }
  console.log(`🗑️  Deleted ${existingLeads.size} existing leads`);
  
  // Add new leads
  console.log('📤 Migrating leads to Firestore...');
  let migrated = 0;
  
  for (const line of dataLines) {
    const values = parseCSVLine(line);
    if (!values[0] || values[0].length < 2) continue;
    
    try {
      await addDoc(collection(db, 'leads'), {
        company: values[0] || '',
        website: values[1] || '',
        email: values[2] || '',
        phone: values[3] || '',
        industry: values[4] || '',
        country: values[5] || '',
        source: values[6] || '',
        date_scraped: values[7] || '',
        status: values[8] || 'new',
        notes: values[9] || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      migrated++;
    } catch (error) {
      console.error(`❌ Error: ${values[0]}`, error.message);
    }
  }
  
  console.log(`✅ Migrated ${migrated} leads`);
  
  const verify = await getDocs(collection(db, 'leads'));
  console.log(`📊 Total leads: ${verify.size}`);
}

async function seedMetrics() {
  console.log('\n📊 Seeding metrics...');
  
  const metrics = [
    { id: 'payingSubscribers', value: 0, target: 100, trend: 0, status: 'red' },
    { id: 'trialSignups', value: 0, target: 500, trend: 0, status: 'red' },
    { id: 'leadsScraped', value: 7, target: 500, trend: 0, status: 'yellow' },
    { id: 'leadsContacted', value: 0, target: 500, trend: 0, status: 'red' },
    { id: 'mrr', value: 0, target: 5000, trend: 0, status: 'red' },
    { id: 'cpa', value: 0, target: 50, trend: 0, status: 'blue' }
  ];
  
  // Clear
  const existing = await getDocs(collection(db, 'metrics'));
  for (const d of existing.docs) await deleteDoc(d.ref);
  
  for (const m of metrics) {
    await addDoc(collection(db, 'metrics'), {
      ...m,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  console.log('✅ Metrics seeded');
}

async function seedTasks() {
  console.log('\n📋 Seeding tasks...');
  
  const tasks = [
    { title: 'Set up Stripe API keys', tag: 'Finance', priority: 'high', status: 'backlog' },
    { title: 'Create French landing page', tag: 'Marketing', priority: 'medium', status: 'backlog' },
    { title: 'Implement referral program', tag: 'Product', priority: 'low', status: 'backlog' },
    { title: 'Research mobile money options', tag: 'Payments', priority: 'medium', status: 'backlog' },
    { title: 'Set up Google Analytics tracking', tag: 'Analytics', priority: 'medium', status: 'backlog' },
    { title: 'Scrape 500+ SME contacts', tag: 'Lead Gen', priority: 'high', status: 'thisWeek' },
    { title: 'Create influencer pitch deck', tag: 'Marketing', priority: 'high', status: 'thisWeek' },
    { title: 'Draft cold email sequence', tag: 'Outreach', priority: 'high', status: 'thisWeek' },
    { title: 'Build Mission Control UI', tag: 'Dev', priority: 'high', status: 'doing' },
    { title: 'Set up Firestore', tag: 'Dev', priority: 'high', status: 'doing' },
    { title: 'Configure MiniMax M2.1', tag: 'Dev', priority: 'medium', status: 'done' },
    { title: 'Set up Telegram bot', tag: 'Communication', priority: 'medium', status: 'done' },
    { title: 'Create Companion-OS repo', tag: 'Dev', priority: 'medium', status: 'done' },
    { title: 'Deploy to Vercel', tag: 'Dev', priority: 'medium', status: 'done' }
  ];
  
  // Clear
  const existing = await getDocs(collection(db, 'tasks'));
  for (const d of existing.docs) await deleteDoc(d.ref);
  
  for (const t of tasks) {
    await addDoc(collection(db, 'tasks'), {
      ...t,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  console.log('✅ Tasks seeded');
}

async function main() {
  console.log('🚀 Firestore Migration');
  console.log('='.repeat(50));
  
  try {
    await migrateLeads();
    await seedMetrics();
    await seedTasks();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Migration complete!');
    console.log('📝 Push to GitHub → Vercel auto-deploys');
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

main();