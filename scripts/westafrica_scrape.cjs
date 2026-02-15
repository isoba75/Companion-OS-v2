#!/usr/bin/env node
/**
 * West Africa Lead Scraper
 * Scrapes business directories across West Africa
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '..', 'memory', 'digibuntu-leads.csv');
const DELAY_MS = 2000;
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

// West African directories
const DIRECTORIES = [
  { name: 'Afrikta - Ivory Coast', url: 'https://afrikta.com/listing-locations/ivory-coast/', country: "Côte d'Ivoire", type: 'afrikta' },
  { name: 'Afrikta - Senegal', url: 'https://afrikta.com/listing-locations/senegal/', country: 'Sénégal', type: 'afrikta' },
  { name: 'Afrikta - Ghana', url: 'https://afrikta.com/listing-locations/ghana/', country: 'Ghana', type: 'afrikta' },
  { name: 'Afrikta - Nigeria', url: 'https://afrikta.com/listing-locations/nigeria/', country: 'Nigeria', type: 'afrikta' },
  { name: 'AllBusiness Africa', url: 'https://allbusiness.africa/index.php/directory', country: 'Pan-Africa', type: 'allbusiness' },
  { name: 'Africa Listings', url: 'https://www.africalistings.com/', country: 'Pan-Africa', type: 'africalistings' },
  { name: 'Africa Business Pages', url: 'https://www.africa-business.com/', country: 'Pan-Africa', type: 'africa-business' },
  { name: 'Afrobiz Africa', url: 'https://www.afrobiz.africa/', country: 'Pan-Africa', type: 'afrobiz' },
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchPage(url) {
  try {
    const response = await axios.get(url, { headers: HEADERS, timeout: 20000 });
    return response.data;
  } catch (error) {
    console.log(`  ❌ ${url}: ${error.message}`);
    return null;
  }
}

// Parse Afrikta format
function parseAfrikta(html, country) {
  const leads = [];
  const companyRegex = /<a[^>]*class="[^"]*company[^"]*"[^>]*>([^<]+)<\/a>/gi;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const phoneRegex = /\+?[0-9\s()-]{8,20}/g;
  
  // Extract emails
  const emails = html.match(emailRegex) || [];
  
  // Look for company names
  const namePattern = /<h[1-6][^>]*>([^<]{3,50})<\/h[1-6]>/gi;
  let match;
  while ((match = namePattern.exec(html)) !== null) {
    const name = match[1].trim();
    if (name.length > 3 && !name.includes('Afrikta') && !name.includes('Business')) {
      leads.push({
        company: name,
        email: emails[leads.length] || '',
        phone: '',
        website: '',
        country: country,
        source: 'afrikta.com',
        date_scraped: new Date().toISOString().split('T')[0],
        status: 'new'
      });
    }
  }
  
  return leads;
}

// Parse AllBusiness Africa format
function parseAllBusiness(html, country) {
  const leads = [];
  const namePattern = /class="[^"]*business[^"]*"[^>]*>[^<]*<[^>]*>([^<]+)</gi;
  let match;
  while ((match = namePattern.exec(html)) !== null) {
    const name = match[1].trim();
    if (name.length > 3 && name.length < 100) {
      leads.push({
        company: name,
        email: '',
        phone: '',
        website: '',
        country: country,
        source: 'allbusiness.africa',
        date_scraped: new Date().toISOString().split('T')[0],
        status: 'new'
      });
    }
  }
  return leads;
}

// Parse Africa Listings format
function parseAfricaListings(html, country) {
  const leads = [];
  const itemPattern = /class="[^"]*listing[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  let match;
  while ((match = itemPattern.exec(html)) !== null) {
    const content = match[1];
    const nameMatch = /<[^>]*>([^<]{3,50})<\/[^>]*>/i.exec(content);
    const emailMatch = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.exec(content);
    const phoneMatch = /\+?[0-9\s()-]{8,20}/i.exec(content);
    
    if (nameMatch) {
      leads.push({
        company: nameMatch[1].trim(),
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : '',
        website: '',
        country: country,
        source: 'africalistings.com',
        date_scraped: new Date().toISOString().split('T')[0],
        status: 'new'
      });
    }
  }
  return leads;
}

// Parse general patterns
function parseGeneric(html, country, source) {
  const leads = [];
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const emails = html.match(emailRegex) || [];
  
  // Find business names (common patterns)
  const patterns = [
    /class="[^"]*name[^"]*"[^>]*>([^<]+)</gi,
    /title="([^"]{3,50})"[^>]*>/gi,
    /<h[2-4][^>]*>([^<]{3,50})<\/h[2-4]>/gi,
  ];
  
  let names = [];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const name = match[1].trim();
      if (name.length > 3 && name.length < 60 && !names.includes(name)) {
        names.push(name);
      }
    }
  }
  
  names.slice(0, 50).forEach((name, i) => {
    leads.push({
      company: name,
      email: emails[i] || '',
      phone: '',
      website: '',
      country: country,
      source: source,
      date_scraped: new Date().toISOString().split('T')[0],
      status: 'new'
    });
  });
  
  return leads;
}

// Save leads
function saveLeads(newLeads) {
  let existingLeads = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const content = fs.readFileSync(OUTPUT_FILE, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim());
      if (lines.length > 1) {
        lines.slice(1).forEach(line => {
          const values = line.split(',').map(v => v.replace(/^"|"$/g, ''));
          if (values[0]) {
            existingLeads.push({
              company: values[0],
              website: values[1] || '',
              email: values[2] || '',
              phone: values[3] || '',
              country: values[5] || '',
              source: values[6] || '',
              date_scraped: values[7] || '',
              status: values[8] || 'new'
            });
          }
        });
      }
    } catch (e) {}
  }
  
  const existingSet = new Set(existingLeads.map(l => l.company.toLowerCase()));
  let added = 0;
  
  newLeads.forEach(lead => {
    if (!existingSet.has(lead.company.toLowerCase())) {
      existingLeads.push(lead);
      existingSet.add(lead.company.toLowerCase());
      added++;
    }
  });
  
  const headers = ['company', 'website', 'email', 'phone', 'industry', 'country', 'source', 'date_scraped', 'status', 'notes'];
  const rows = [headers.join(',')];
  existingLeads.forEach(lead => {
    rows.push([
      `"${(lead.company || '').replace(/"/g, '""')}"`,
      `"${(lead.website || '').replace(/"/g, '""')}"`,
      `"${(lead.email || '').replace(/"/g, '""')}"`,
      `"${(lead.phone || '').replace(/"/g, '""')}"`,
      `"${(lead.industry || '').replace(/"/g, '""')}"`,
      `"${(lead.country || '').replace(/"/g, '""')}"`,
      `"${(lead.source || '').replace(/"/g, '""')}"`,
      `"${(lead.date_scraped || '').replace(/"/g, '""')}"`,
      `"${(lead.status || 'new').replace(/"/g, '""')}"`,
      `"${(lead.notes || '').replace(/"/g, '""')}"`
    ].join(','));
  });
  
  fs.writeFileSync(OUTPUT_FILE, rows.join('\n'), 'utf-8');
  return added;
}

// Main
async function main() {
  console.log('🌍 West Africa Lead Scraper');
  console.log('='.repeat(50));
  
  let allLeads = [];
  
  for (const dir of DIRECTORIES) {
    console.log(`\n📍 Scraping: ${dir.name}`);
    
    const html = await fetchPage(dir.url);
    if (!html) continue;
    
    let leads = [];
    switch (dir.type) {
      case 'afrikta':
        leads = parseAfrikta(html, dir.country);
        break;
      case 'allbusiness':
        leads = parseAllBusiness(html, dir.country);
        break;
      case 'africalistings':
        leads = parseAfricaListings(html, dir.country);
        break;
      default:
        leads = parseGeneric(html, dir.country, dir.url);
    }
    
    console.log(`   Found ${leads.length} companies`);
    allLeads = [...allLeads, ...leads];
    await sleep(DELAY_MS);
  }
  
  const added = saveLeads(allLeads);
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log(`Total scraped: ${allLeads.length}`);
  console.log(`New unique: ${added}`);
  console.log(`Saved to: ${OUTPUT_FILE}`);
  console.log('\n✅ Done!');
}

main().catch(console.error);