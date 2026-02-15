#!/usr/bin/env node
/**
 * LeadScout - African Business Directory Scraper
 * Node.js version for Companion-OS
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_FILE = path.join(__dirname, '..', 'memory', 'digibuntu-leads.csv');
const DELAY_MS = 1500; // 1.5 seconds between requests
const HEADERS = {
  'User-Agent': 'LeadScout/1.0 (+https://github.com/job-companion)'
};

// Directories to scrape
const DIRECTORIES = {
  ivory_coast: [
    { name: 'AnnuaireCI', url: 'https://annuaireci.com/en/', country: "Côte d'Ivoire" },
  ],
  senegal: [
    { name: 'Senegal Export', url: 'https://www.senegal-export.com/spip.php?rubrique55', country: 'Sénégal' },
  ]
};

let totalScraped = 0;
let totalErrors = 0;

// Helper: sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: fetch page
async function fetchPage(url) {
  try {
    const response = await axios.get(url, {
      headers: HEADERS,
      timeout: 15000
    });
    return response.data;
  } catch (error) {
    console.log(`❌ Error fetching ${url}: ${error.message}`);
    return null;
  }
}

// Parse AnnuaireCI
async function parseAnnuaireCI(html, country) {
  const $ = cheerio.load(html);
  const leads = [];
  
  // Try multiple selectors for business listings
  const businessSelectors = [
    'div.business-item',
    'div.listing',
    'div.company',
    'tr.business-row',
    'article.business',
    '[class*="business"]',
    '[class*="company"]'
  ];
  
  let foundAny = false;
  
  for (const selector of businessSelectors) {
    $(selector).each((i, el) => {
      foundAny = true;
      const nameEl = $(el).find('h3, h4, .title, .name, [class*="title"], [class*="name"]').first();
      const websiteEl = $(el).find('a[href*="http"]').first();
      const emailEl = $(el).find('a[href^="mailto:"]').first();
      const phoneEl = $(el).find('a[href^="tel:"]').first();
      
      const name = nameEl?.text()?.trim() || '';
      if (name && name.length > 2) {
        leads.push({
          company: name,
          website: websiteEl?.attr('href') || '',
          email: emailEl?.attr('href')?.replace('mailto:', '') || '',
          phone: phoneEl?.attr('href')?.replace('tel:', '') || '',
          industry: '',
          country: country,
          source: 'annuaireci.com',
          date_scraped: new Date().toISOString().split('T')[0],
          status: 'new',
          notes: ''
        });
      }
    });
    
    if (leads.length > 0) break;
  }
  
  // If no structured data found, try to find links
  if (!foundAny || leads.length === 0) {
    $('a').each((i, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text()?.trim() || '';
      
      // Look for company links
      if (text.length > 3 && text.length < 100 && 
          (href.includes('company') || href.includes('business') || !href)) {
        if (!leads.find(l => l.company === text)) {
          leads.push({
            company: text,
            website: href.startsWith('http') ? href : '',
            email: '',
            phone: '',
            industry: '',
            country: country,
            source: 'annuaireci.com',
            date_scraped: new Date().toISOString().split('T')[0],
            status: 'new',
            notes: ''
          });
        }
      }
    });
  }
  
  return leads;
}

// Parse Senegal Export
async function parseSenegalExport(html, country) {
  const $ = cheerio.load(html);
  const leads = [];
  
  $('div.annuaire-item, tr.annuaire-row, li.company, article').each((i, el) => {
    const name = $(el).text()?.trim() || '';
    if (name && name.length > 3 && name.length < 100) {
      leads.push({
        company: name,
        website: '',
        email: '',
        phone: '',
        industry: '',
        country: country,
        source: 'senegal-export.com',
        date_scraped: new Date().toISOString().split('T')[0],
        status: 'new',
        notes: ''
      });
    }
  });
  
  return leads;
}

// Main scraper
async function scrapeDirectory(dirInfo) {
  console.log(`\n📊 Scraping: ${dirInfo.name} (${dirInfo.country})`);
  console.log(`   URL: ${dirInfo.url}`);
  
  const html = await fetchPage(dirInfo.url);
  if (!html) {
    console.log(`   ❌ Failed to fetch`);
    return [];
  }
  
  let leads = [];
  if (dirInfo.source === 'annuaireci.com') {
    leads = await parseAnnuaireCI(html, dirInfo.country);
  } else {
    leads = await parseSenegalExport(html, dirInfo.country);
  }
  
  console.log(`   ✅ Found ${leads.length} leads`);
  return leads;
}

// Save to CSV
function saveToCSV(leads) {
  const header = ['company', 'website', 'email', 'phone', 'industry', 'country', 'source', 'date_scraped', 'status', 'notes'];
  
  // If file exists, load existing data and merge
  let existingLeads = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    const content = fs.readFileSync(OUTPUT_FILE, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    // Skip header
    lines.slice(1).forEach(line => {
      const values = parseCSVLine(line);
      if (values.length >= 10) {
        existingLeads.push({
          company: values[0] || '',
          website: values[1] || '',
          email: values[2] || '',
          phone: values[3] || '',
          industry: values[4] || '',
          country: values[5] || '',
          source: values[6] || '',
          date_scraped: values[7] || '',
          status: values[8] || '',
          notes: values[9] || ''
        });
      }
    });
  }
  
  // Merge with new leads (avoid duplicates by company name)
  const existingCompanies = new Set(existingLeads.map(l => l.company.toLowerCase()));
  const newUniqueLeads = leads.filter(l => !existingCompanies.has(l.company.toLowerCase()));
  const mergedLeads = [...existingLeads, ...newUniqueLeads];
  
  // Write CSV
  const rows = [header.join(',')];
  mergedLeads.forEach(lead => {
    const row = [
      escapeCSV(lead.company),
      escapeCSV(lead.website),
      escapeCSV(lead.email),
      escapeCSV(lead.phone),
      escapeCSV(lead.industry),
      escapeCSV(lead.country),
      escapeCSV(lead.source),
      escapeCSV(lead.date_scraped),
      escapeCSV(lead.status),
      escapeCSV(lead.notes)
    ];
    rows.push(row.join(','));
  });
  
  fs.writeFileSync(OUTPUT_FILE, rows.join('\n'), 'utf-8');
  return newUniqueLeads.length;
}

// Helper: Parse CSV line (simple version)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let char of line) {
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

// Helper: Escape CSV values
function escapeCSV(value) {
  if (!value) return '';
  value = String(value);
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Main
async function main() {
  console.log('🚀 LeadScout - African Business Directory Scraper');
  console.log('='.repeat(50));
  console.log(`📁 Output: ${OUTPUT_FILE}`);
  console.log(`⏱️  Delay: ${DELAY_MS}ms between requests`);
  console.log('');
  
  let allLeads = [];
  let totalNew = 0;
  
  // Scrape Ivory Coast
  console.log('\n🇨🇮 IVORY COAST DIRECTORIES');
  console.log('-'.repeat(30));
  for (const dir of DIRECTORIES.ivory_coast) {
    const leads = await scrapeDirectory({ ...dir, source: 'annuaireci.com' });
    allLeads = [...allLeads, ...leads];
    await sleep(DELAY_MS);
  }
  
  // Scrape Senegal
  console.log('\n🇸🇳 SENEGAL DIRECTORIES');
  console.log('-'.repeat(30));
  for (const dir of DIRECTORIES.senegal) {
    const leads = await scrapeDirectory({ ...dir, source: 'senegal-export.com' });
    allLeads = [...allLeads, ...leads];
    await sleep(DELAY_MS);
  }
  
  // Save
  console.log('\n💾 Saving results...');
  totalNew = saveToCSV(allLeads);
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total scraped: ${allLeads.length}`);
  console.log(`New (unique): ${totalNew}`);
  console.log(`Saved to: ${OUTPUT_FILE}`);
  console.log('');
  console.log('✅ Scraping complete!');
  console.log('📝 Next steps:');
  console.log('   1. Review leads in memory/digibuntu-leads.csv');
  console.log('   2. Commit and push to GitHub');
  console.log('   3. Mission Control will auto-sync');
}

main().catch(console.error);