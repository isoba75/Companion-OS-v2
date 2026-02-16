/**
 * Automated Lead Scraper - Runs Continuously in Background
 * Scrapes AnnuaireCI and syncs to Firestore
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, query, where } = require('firebase/firestore');
const Papa = require('papaparse');
const fs = require('fs');
const https = require('https');

const firebaseConfig = {
  apiKey: "AIzaSyBu4JBoV3J20mhNgHPDgAWdHJQ-m6uF3do",
  authDomain: "companion-os-v2.firebaseapp.com",
  projectId: "companion-os-v2",
  storageBucket: "companion-os-v2.firebasestorage.app",
  messagingSenderId: "728909359341",
  appId: "1:728909359341:web:6e2dcd2c4b2ee04edc44e4",
  measurementId: "G-PZ6SLG0BJR"
};

// Target categories to scrape
const CATEGORIES = [
  'commerce-pmipme',
  'food-industry', 
  'building-public-works-btp',
  'import-export',
  'transport-logistics',
  'informatique',
  'industrie'
];

const CITIES = [
  'abidjan',
  'bouake',
  'daloa',
  'yamoussoukro',
  'san-pedro',
  'komborodougou'
];

let isRunning = false;
let scrapeCount = 0;
let errorCount = 0;

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractPhone(text) {
  const phoneRegex = /(\+?225)?\s*(\d{2}\s*\d{2}\s*\d{2}\s*\d{2})/g;
  const matches = text.match(phoneRegex);
  return matches ? matches[0].trim() : null;
}

function extractEmail(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex);
  return matches ? matches[0].toLowerCase() : null;
}

async function scrapeCompany(url) {
  try {
    const html = await fetchPage(url);
    
    // Extract company name
    const nameMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) || 
                      html.match(/class="[^"]*business[^"]*"[^>]*>([^<]+)/i);
    const name = nameMatch ? nameMatch[1].trim() : null;
    
    if (!name) return null;
    
    // Extract phone
    const phone = extractPhone(html);
    
    // Extract email
    const email = extractEmail(html);
    
    // Extract industry
    const industryMatch = html.match(/class="[^"]*category[^"]*"[^>]*>([^<]+)/i) ||
                        html.match(/<span[^>]*industry[^>]*>([^<]+)/i);
    const industry = industryMatch ? industryMatch[1].trim() : 'Unknown';
    
    return {
      company: name,
      phone,
      email,
      industry,
      country: "Côte d'Ivoire",
      source: 'AnnuaireCI',
      erp_relevance: ['Import/Export', 'Logistics', 'Agroalimentaire', 'Manufacturing', 'BTP'].includes(industry) ? 'High' : 'Medium',
      status: 'new',
      has_contact: !!(phone || email),
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    errorCount++;
    return null;
  }
}

async function syncToFirestore(leads) {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  // Get existing leads to check duplicates
  const snapshot = await getDocs(collection(db, 'leads'));
  const existing = new Set(snapshot.docs.map(d => d.data().company?.toLowerCase()));
  
  let added = 0;
  for (const lead of leads) {
    if (!lead.company) continue;
    if (existing.has(lead.company.toLowerCase())) continue;
    
    try {
      await addDoc(collection(db, 'leads'), lead);
      added++;
      scrapeCount++;
    } catch (e) {
      errorCount++;
    }
  }
  return added;
}

async function runOnce() {
  if (isRunning) return;
  isRunning = true;
  
  console.log(`\n[${new Date().toISOString()}] 🔄 Scrape cycle started...`);
  
  try {
    // Scrape a sample of companies
    const sampleUrls = [
      'https://annuaireci.com/en/entreprises/sita-societe-industrielle-de-transformation-alimentaire-abidjan-cote-divoire/',
      'https://annuaireci.com/en/entreprises/imp-sarl-industrie-mecanique-et-plastique-abidjan-cote-divoire/',
      'https://annuaireci.com/en/entreprises/akatel-technologie-abidjan-cote-divoire/',
      'https://annuaireci.com/en/entreprises/nexoo-abidjan-cote-divoire/',
      'https://annuaireci.com/en/entreprises/rt-engineering-abidjan-cote-divoire/',
    ];
    
    const leads = [];
    for (const url of sampleUrls) {
      const lead = await scrapeCompany(url);
      if (lead) leads.push(lead);
    }
    
    const added = await syncToFirestore(leads);
    console.log(`   Added ${added} new leads (Total: ${scrapeCount}, Errors: ${errorCount})`);
    
  } catch (e) {
    console.error('   Error:', e.message);
  }
  
  isRunning = false;
}

// Main: Run once per hour
async function main() {
  console.log('🤖 Automated Lead Scraper Started');
  console.log(`Target: AnnuaireCI companies`);
  console.log(`Frequency: Every 1 hour`);
  console.log(`Firestore: companion-os-v2`);
  console.log('---');
  
  // Run immediately
  await runOnce();
  
  // Then every hour
  setInterval(runOnce, 60 * 60 * 1000);
}

main().catch(console.error);