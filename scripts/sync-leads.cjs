#!/usr/bin/env node
/**
 * Auto-sync leads from CSV to Firestore
 * Run this script to keep leads updated in Mission Control
 */

const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } = require('firebase/firestore');

const CSV_FILE = path.join(__dirname, '..', 'memory', 'digibuntu-leads.csv');
const FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBu4JBoV3J20mhNgHPDgAWdHJQ-m6uF3do",
  authDomain: "companion-os-v2.firebaseapp.com",
  projectId: "companion-os-v2",
  storageBucket: "companion-os-v2.firebasestorage.app",
  messagingSenderId: "728909359341",
  appId: "1:728909359341:web:6e2dcd2c4b2ee04edc44e4"
};

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

function parseCSV(content) {
  const lines = content.split('\n').filter(l => l.trim());
  const headers = parseCSVLine(lines[0]);
  const leads = [];

  lines.slice(1).forEach(line => {
    const values = parseCSVLine(line);
    if (values.length >= 2 && values[0]) {
      const lead = {};
      headers.forEach((h, i) => lead[h] = values[i] || '');
      leads.push(lead);
    }
  });

  return leads;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function syncLeads() {
  console.log('🔄 Syncing leads to Firestore...\n');

  // Read CSV
  const content = fs.readFileSync(CSV_FILE, 'utf-8');
  const leads = parseCSV(content);
  console.log(`Found ${leads.length} leads in CSV`);

  // Clear existing leads
  console.log('Clearing existing leads...');
  const snapshot = await getDocs(collection(db, 'leads'));
  let deleted = 0;
  snapshot.forEach(docSnap => {
    deleteDoc(doc(db, 'leads', docSnap.id));
    deleted++;
  });
  console.log(`Deleted ${deleted} old leads`);

  // Add all leads
  console.log(`Adding ${leads.length} leads...\n`);
  let added = 0;
  let withEmail = 0;
  let withPhone = 0;

  for (const lead of leads) {
    if (!lead.company || lead.company.length < 2) continue;

    await addDoc(collection(db, 'leads'), {
      company: lead.company,
      website: lead.website || '',
      email: lead.email || '',
      phone: lead.phone || '',
      industry: lead.industry || '',
      country: lead.country || 'Pan-Africa',
      source: lead.source || 'unknown',
      date_scraped: lead.date_scraped || new Date().toISOString().split('T')[0],
      status: lead.status || 'new',
      notes: lead.notes || '',
      createdAt: new Date().toISOString()
    });

    if (lead.email) withEmail++;
    if (lead.phone) withPhone++;
    added++;
  }

  console.log('='.repeat(50));
  console.log('✅ SYNC COMPLETE');
  console.log('='.repeat(50));
  console.log(`Total leads: ${added}`);
  console.log(`With email: ${withEmail}`);
  console.log(`With phone: ${withPhone}`);
  console.log('\nLeads are now in Mission Control!');
}

syncLeads().catch(console.error);
