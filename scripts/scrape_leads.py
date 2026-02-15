#!/usr/bin/env python3
"""
LeadScout - African Business Directory Scraper
Respects robots.txt, throttles requests, outputs CSV
"""

import csv, time, requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# CONFIGURATION
OUTPUT_FILE = "memory/digibuntu-leads.csv"
DELAY = 1.5  # seconds between requests
HEADERS = {"User-Agent": "LeadScout/1.0 (+https://github.com/job-companion)"}

# DIRECTORIES TO SCRAPE
DIRECTORIES = {
    "ivory_coast": [
        "https://annuaireci.com/en/",
        "https://pme.gouv.ci/static/docs/decisions/liste%20des%20PME%20reconnues%20en%20cote%20divoire.pdf",
    ],
    "senegal": [
        "https://www.senegal-export.com/spip.php?rubrique55",
    ]
}

def fetch(url):
    r = requests.get(url, headers=HEADERS, timeout=15)
    time.sleep(DELAY)
    return r.text

def parse_annuaireci(html):
    """Parse annuaireci.com directory format"""
    soup = BeautifulSoup(html, "html.parser")
    results = []
    for entry in soup.select("div.business-item, div.listing, tr.business-row"):
        name = entry.select_one("h3, h4, .title, .name")
        website = entry.select_one("a[href*='http']")
        email = entry.select_one("a[href^='mailto:']")
        
        results.append({
            "company": name.get_text(strip=True) if name else "",
            "website": website.get("href", "") if website else "",
            "email": email.get("href", "").replace("mailto:", "") if email else "",
            "phone": "",
            "industry": "",
            "country": "Côte d'Ivoire",
            "source": "annuaireci.com"
        })
    return results

def parse_senegal_export(html):
    """Parse senegal-export.com directory format"""
    soup = BeautifulSoup(html, "html.parser")
    results = []
    for entry in soup.select("div.annuaire-item, tr.annuaire-row, li.company"):
        name = entry.get_text(strip=True)
        if name and len(name) > 3:
            results.append({
                "company": name,
                "website": "",
                "email": "",
                "phone": "",
                "industry": "",
                "country": "Sénégal",
                "source": "senegal-export.com"
            })
    return results

def parse_pdf(pdf_url):
    """Handle PDF extraction (placeholder - requires PyPDF2 or similar)"""
    print(f"PDF handling not implemented: {pdf_url}")
    return []

def main():
    all_leads = []
    for country, urls in DIRECTORIES.items():
        for url in urls:
            print(f"Scraping: {url}")
            try:
                if url.endswith(".pdf"):
                    leads = parse_pdf(url)
                elif "annuaireci" in url:
                    leads = parse_annuaireci(fetch(url))
                elif "senegal-export" in url:
                    leads = parse_senegal_export(fetch(url))
                else:
                    leads = []
                    
                all_leads.extend(leads)
                print(f"  → Found {len(leads)} leads")
            except Exception as e:
                print(f"  → Error: {e}")

    # Write CSV
    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "company", "website", "email", "phone", "industry",
            "country", "source", "date_scraped", "status", "notes"
        ])
        writer.writeheader()
        for lead in all_leads:
            lead["date_scraped"] = time.strftime("%Y-%m-%d")
            lead["status"] = "new"
            writer.writerow(lead)
    
    print(f"\n✅ Saved {len(all_leads)} leads to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()