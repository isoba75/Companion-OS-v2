#!/usr/bin/env node
/**
 * LeadScout Enhanced - African Business Directory Scraper
 * Extracts: phones, emails, websites, social media
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '..', 'memory', 'digibuntu-leads.csv');
const DELAY_MS = 2000;
const MAX_PAGES = 50;
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

// Directories with better selectors
const DIRECTORIES = [
  {
    name: 'AnnuaireCI - Ivory Coast',
    url: 'https://annuaireci.com/en/',
    country: "Côte d'Ivoire",
    type: 'annuaireci'
  }
];

// Social media patterns
const SOCIAL_PATTERNS = {
  facebook: /facebook\.com|fb\.com/i,
  linkedin: /linkedin\.com/i,
  twitter: /twitter\.com|x\.com/i,
  instagram: /instagram\.com/i,
  youtube: /youtube\.com|youtu\.be/i,
};

let totalScraped = 0;

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

// Extract all contact info from HTML
function extractContactInfo(html) {
  const $ = cheerio.load(html);
  const contacts = { email: '', phone: '', website: '', socials: [] };

  // Extract email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const textContent = $('body').text();
  const emails = textContent.match(emailRegex);
  if (emails) {
    contacts.email = [...new Set(emails)].filter(e => 
      !e.includes('@example') && 
      !e.includes('@localhost') &&
      e.length < 50
    )[0] || '';
  }

  // Email links
  $('a[href^="mailto:"]').each((i, el) => {
    const href = $(el).attr('href')?.replace('mailto:', '') || '';
    if (href && !contacts.email) contacts.email = href;
  });

  // Extract phone - multiple patterns
  const phonePatterns = [
    /\+225\s*[0-9\s]{8,12}/g,  // Ivory Coast
    /\+221\s*[0-9\s]{8,12}/g,  // Senegal
    /0[0-9\s]{8,10}/g,         // Local format
    /\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g,  // Generic
  ];

  for (const pattern of phonePatterns) {
    const phones = textContent.match(pattern);
    if (phones) {
      contacts.phone = [...new Set(phones)].map(p => p.trim()).filter(p => p.length > 6)[0] || '';
      if (contacts.phone) break;
    }
  }

  // Phone links
  $('a[href^="tel:"]').each((i, el) => {
    const href = $(el).attr('href')?.replace('tel:', '').replace(/[^\d+]/g, '') || '';
    if (href && !contacts.phone) contacts.phone = href;
  });

  // Website
  $('a[href^="http"]').each((i, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text()?.trim().toLowerCase() || '';
    
    if (href.includes('annuaireci')) return; // Skip internal links
    
    if (!contacts.website && (
      text.includes('website') || 
      text.includes('visit') ||
      text.includes('www.') ||
      href.includes('://') && !href.includes('facebook') && !href.includes('linkedin')
    )) {
      contacts.website = href;
    }

    // Social media
    for (const [platform, pattern] of Object.entries(SOCIAL_PATTERNS)) {
      if (pattern.test(href) && !contacts.socials.includes(platform)) {
        contacts.socials.push(platform);
      }
    }
  });

  // Clean up
  contacts.email = contacts.email.toLowerCase().trim();
  contacts.phone = contacts.phone.replace(/[^\d+]/g, ' ').replace(/\s+/g, ' ').trim();
  contacts.website = contacts.website.replace(/[?&]utm_.*$/, '').trim();

  return contacts;
}

// Parse AnnuaireCI - main listing page
async function parseAnnuaireCIListings(html, country) {
  const $ = cheerio.load(html);
  const leads = [];
  
  // Try multiple selectors for AnnuaireCI
  const selectors = [
    'div.company-item',
    'div.business-item', 
    'div.listing-item',
    'div.company',
    'article.company',
    'div.card-company',
    'div[data-company]',
    'div.company-card',
    'div.item-company',
    // Fallback: any list item that looks like a company
    '.list-company .item',
    '.companies li',
  ];

  let foundSelector = false;
  for (const selector of selectors) {
    const items = $(selector);
    if (items.length > 0) {
      foundSelector = true;
      console.log(`  Found selector: "${selector}" with ${items.length} items`);
      
      items.each((i, el) => {
        if (i >= MAX_PAGES * 20) return; // Limit
        
        const nameEl = $(el).find('h2, h3, h4, .title, .name, .company-name, [class*="title"], [class*="name"]').first();
        const linkEl = $(el).find('a[href]').first();
        const descEl = $(el).find('p, .description, .category, .industry').first();
        
        const name = nameEl?.text()?.trim() || '';
        const link = linkEl?.attr('href') || '';
        
        if (name && name.length > 2 && name.length < 150 && link) {
          const fullLink = link.startsWith('http') ? link : `https://annuaireci.com${link}`;
          
          leads.push({
            company: name,
            website: '',
            email: '',
            phone: '',
            facebook: '',
            linkedin: '',
            twitter: '',
            instagram: '',
            industry: descEl?.text()?.trim() || '',
            country: country,
            source: 'annuaireci.com',
            profile_url: fullLink,
            date_scraped: new Date().toISOString().split('T')[0],
            status: 'new',
            notes: ''
          });
        }
      });
      
      break;
    }
  }

  // Fallback: parse links that look like company profiles
  if (!foundSelector || leads.length === 0) {
    console.log('  Trying fallback: parsing company profile links...');
    
    $('a[href*="/company/"], a[href*="/business/"], a[href*="/profile/"]').each((i, el) => {
      if (i >= MAX_PAGES * 10) return;
      
      const href = $(el).attr('href') || '';
      const text = $(el).text()?.trim() || '';
      
      if (text && text.length > 3 && text.length < 100 && href) {
        const fullLink = href.startsWith('http') ? href : `https://annuaireci.com${href}`;
        if (!leads.find(l => l.profile_url === fullLink)) {
          leads.push({
            company: text,
            website: '',
            email: '',
            phone: '',
            facebook: '',
            linkedin: '',
            twitter: '',
            instagram: '',
            industry: '',
            country: country,
            source: 'annuaireci.com',
            profile_url: fullLink,
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

// Scrape individual company page for more details
async function scrapeCompanyPage(lead) {
  if (!lead.profile_url) return lead;
  
  const html = await fetchPage(lead.profile_url);
  if (!html) return lead;
  
  const contacts = extractContactInfo(html);
  
  // Update lead with found contacts
  if (contacts.email && !lead.email) lead.email = contacts.email;
  if (contacts.phone && !lead.phone) lead.phone = contacts.phone;
  if (contacts.website && !lead.website) lead.website = contacts.website;
  if (contacts.socials.length > 0) {
    contacts.socials.forEach(s => {
      if (s === 'facebook') lead.facebook = '✓';
      if (s === 'linkedin') lead.linkedin = '✓';
      if (s === 'twitter') lead.twitter = '✓';
      if (s === 'instagram') lead.instagram = '✓';
    });
  }
  
  return lead;
}

// Save to CSV with new columns
function saveToCSV(allLeads) {
  const header = [
    'company', 'website', 'email', 'phone', 'facebook', 'linkedin', 'twitter', 'instagram',
    'industry', 'country', 'source', 'profile_url', 'date_scraped', 'status', 'notes'
  ];
  
  // Load existing leads
  let existingLeads = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const content = fs.readFileSync(OUTPUT_FILE, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim());
      if (lines.length > 1) {
        // Parse existing
        const headers = parseCSVLine(lines[0]);
        lines.slice(1).forEach(line => {
          const values = parseCSVLine(line);
          if (values.length >= 10) {
            const lead = {};
            headers.forEach((h, i) => lead[h] = values[i] || '');
            existingLeads.push(lead);
          }
        });
      }
    } catch (e) {
      console.log('  ⚠️ Could not parse existing CSV, starting fresh');
    }
  }
  
  // Merge: update existing leads or add new ones
  const existingByProfile = new Map(existingLeads.filter(l => l.profile_url).map(l => [l.profile_url, l]));
  const updatedCount = { existing: 0, new: 0 };
  
  allLeads.forEach(newLead => {
    if (newLead.profile_url && existingByProfile.has(newLead.profile_url)) {
      // Update existing
      const existing = existingByProfile.get(newLead.profile_url);
      Object.keys(newLead).forEach(k => {
        if (newLead[k] && newLead[k] !== existing[k]) {
          existing[k] = newLead[k];
        }
      });
      updatedCount.existing++;
    } else if (!existingLeads.find(l => l.company?.toLowerCase() === newLead.company?.toLowerCase())) {
      // Add new
      existingLeads.push(newLead);
      updatedCount.new++;
    }
  });
  
  // Write
  const rows = [header.join(',')];
  existingLeads.forEach(lead => {
    const row = header.map(h => escapeCSV(lead[h] || ''));
    rows.push(row.join(','));
  });
  
  fs.writeFileSync(OUTPUT_FILE, rows.join('\n'), 'utf-8');
  
  return updatedCount;
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
  console.log('🚀 LeadScout Enhanced - African Business Directory Scraper');
  console.log('='.repeat(60));
  console.log(`📁 Output: ${OUTPUT_FILE}`);
  console.log(`⏱️  Delay: ${DELAY_MS}ms`);
  console.log('');
  
  let allLeads = [];
  
  for (const dir of DIRECTORIES) {
    console.log(`\n🌍 Scraping: ${dir.name}`);
    console.log(`   URL: ${dir.url}`);
    
    const html = await fetchPage(dir.url);
    if (!html) {
      console.log('   ❌ Failed to fetch page');
      continue;
    }
    
    let leads = [];
    if (dir.type === 'annuaireci') {
      leads = await parseAnnuaireCIListings(html, dir.country);
    }
    
    console.log(`   📊 Found ${leads.length} company links`);
    
    // Scrape individual pages for contact info
    if (leads.length > 0) {
      console.log(`   🔍 Scraping company pages for contact details...`);
      
      const limit = Math.min(leads.length, 20); // Limit for demo
      for (let i = 0; i < limit; i++) {
        if (i > 0 && i % 5 === 0) {
          console.log(`   Progress: ${i}/${limit}`);
        }
        
        leads[i] = await scrapeCompanyPage(leads[i]);
        totalScraped++;
        await sleep(DELAY_MS / 2);
      }
      
      console.log(`   ✅ Scraped ${limit} company pages`);
    }
    
    allLeads = [...allLeads, ...leads];
  }
  
  // Save
  console.log('\n💾 Saving results...');
  const counts = saveToCSV(allLeads);
  
  // Stats
  const stats = {
    total: allLeads.length,
    withEmail: allLeads.filter(l => l.email).length,
    withPhone: allLeads.filter(l => l.phone).length,
    withWebsite: allLeads.filter(l => l.website).length,
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Companies found: ${stats.total}`);
  console.log(`With email: ${stats.withEmail} (${Math.round(stats.withEmail/stats.total*100)}%)`);
  console.log(`With phone: ${stats.withPhone} (${Math.round(stats.withPhone/stats.total*100)}%)`);
  console.log(`With website: ${stats.withWebsite} (${Math.round(stats.withWebsite/stats.total*100)}%)`);
  console.log(`New leads added: ${counts.new}`);
  console.log(`Existing updated: ${counts.existing}`);
  console.log(`\n✅ Saved to: ${OUTPUT_FILE}`);
  console.log('\n📝 Next steps:');
  console.log('   1. Review leads in memory/digibuntu-leads.csv');
  console.log('   2. Run: node scripts/enhanced_scrape.cjs');
  console.log('   3. Check Mission Control for updated stats');
}

main().catch(console.error);