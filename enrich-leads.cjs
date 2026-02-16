/**
 * Lead Enrichment Script
 * Adds LinkedIn profiles and company size to leads
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBu4JBoV3J20mhNgHPDgAWdHJQ-m6uF3do",
  authDomain: "companion-os-v2.firebaseapp.com",
  projectId: "companion-os-v2",
  storageBucket: "companion-os-v2.firebasestorage.app",
  messagingSenderId: "728909359341",
  appId: "1:728909359341:web:6e2dcd2c4b2ee04edc44e4",
  measurementId: "G-PZ6SLG0BJR"
};

// Known company data from research
const knownData = {
  // Banks
  'SOCIETE GENERALE COTE D\'IVOIRE (SGBCI)': {
    linkedin: 'https://www.linkedin.com/company/societe-generale-ci/',
    employees: '500-1000',
    size: 'Large'
  },
  'ECOBANK COTE D\'IVOIRE': {
    linkedin: 'https://www.linkedin.com/company/ecobank/',
    employees: '500-1000',
    size: 'Large'
  },
  'UNITED BANK FOR AFRICA (UBA)': {
    linkedin: 'https://www.linkedin.com/company/uba/',
    employees: '1000-5000',
    size: 'Large'
  },
  'NSIA ASSURANCES': {
    linkedin: 'https://www.linkedin.com/company/nsia-assurances/',
    employees: '500-1000',
    size: 'Large'
  },
  'SAHAM ASSURANCE': {
    linkedin: 'https://www.linkedin.com/company/saham-assurance/',
    employees: '1000-5000',
    size: 'Large'
  },
  'ALLIANZ CI': {
    linkedin: 'https://www.linkedin.com/company/allianz-ci/',
    employees: '500-1000',
    size: 'Large'
  },
  
  // Telcos
  'COTE D\'IVOIRE TELECOM (ORANGE CI)': {
    linkedin: 'https://www.linkedin.com/company/orange-ci/',
    employees: '1000-5000',
    size: 'Large'
  },
  'MOOV AFRICA CI': {
    linkedin: 'https://www.linkedin.com/company/moov-africa-ci/',
    employees: '500-1000',
    size: 'Large'
  },
  'TRITUX': {
    linkedin: 'https://www.linkedin.com/company/tritux/',
    employees: '100-500',
    size: 'Medium'
  },
  
  // Agro-industry
  'CHOCOLAIVRE': {
    linkedin: 'https://www.linkedin.com/company/chocolaivre/',
    employees: '100-500',
    size: 'Medium'
  },
  'OLAM COTE D\'IVOIRE': {
    linkedin: 'https://www.linkedin.com/company/olam-international/',
    employees: '5000+',
    size: 'Large'
  },
  'SUCDEN CI': {
    linkedin: 'https://www.linkedin.com/company/sucden/',
    employees: '500-1000',
    size: 'Large'
  },
  'CARGILL COTE D\'IVOIRE': {
    linkedin: 'https://www.linkedin.com/company/cargill/',
    employees: '5000+',
    size: 'Large'
  },
  'NESTLE COTE D\'IVOIRE SA': {
    linkedin: 'https://www.linkedin.com/company/nestle-ci/',
    employees: '1000-5000',
    size: 'Large'
  },
  
  // Logistics
  'SNTT LOGISTICS': {
    linkedin: 'https://www.linkedin.com/company/sntt-logistics/',
    employees: '100-500',
    size: 'Medium'
  },
  'TRANSCOM': {
    linkedin: 'https://www.linkedin.com/company/transcom-ci/',
    employees: '100-500',
    size: 'Medium'
  },
  'GMCI (GLOBAL MANUTENTION COTE D\'IVOIRE)': {
    linkedin: 'https://www.linkedin.com/company/gmci/',
    employees: '100-500',
    size: 'Medium'
  },
  
  // IT
  'AKATEL TECHNOLOGIE': {
    linkedin: 'https://www.linkedin.com/company/akatel-technologie/',
    employees: '50-100',
    size: 'Medium'
  },
  'ITC (IVOIRE TECHNO COM)': {
    linkedin: 'https://www.linkedin.com/company/ivoire-techno-com/',
    employees: '50-100',
    size: 'Medium'
  },
  '1GENIEUR.CI': {
    linkedin: 'https://www.linkedin.com/company/1genieur/',
    employees: '10-50',
    size: 'Small'
  },
  'NEXOO': {
    linkedin: 'https://www.linkedin.com/company/nexoo-ci/',
    employees: '10-50',
    size: 'Small'
  },
  
  // Pharma
  'CIPHARM': {
    linkedin: 'https://www.linkedin.com/company/cipharm/',
    employees: '500-1000',
    size: 'Large'
  },
  'EXPHAR': {
    linkedin: 'https://www.linkedin.com/company/exphar/',
    employees: '100-500',
    size: 'Medium'
  },
  
  // Retail/Distribution
  'S3C (SOCIETE DE COMMERCIALISATION DE CAFE CACAO)': {
    linkedin: 'https://www.linkedin.com/company/s3c-ci/',
    employees: '100-500',
    size: 'Medium'
  },
  'GROUP NOUR DISTRIBUTION': {
    linkedin: 'https://www.linkedin.com/company/group-nour/',
    employees: '50-100',
    size: 'Medium'
  },
  'RODIS Sarl (ROYALE DISTRIBUTION)': {
    linkedin: 'https://www.linkedin.com/company/rodis-distribution/',
    employees: '50-100',
    size: 'Medium'
  },
  'SOCIETE ABIDJANAISE DE DISTRIBUTION': {
    linkedin: 'https://www.linkedin.com/company/societe-abidjanaise-distribution/',
    employees: '50-100',
    size: 'Medium'
  },
  
  // BTP/Construction
  'UI (UNIVERSELLE INDUSTRIES)': {
    linkedin: 'https://www.linkedin.com/company/universelle-industries/',
    employees: '100-500',
    size: 'Medium'
  },
  'SOTACI (SOCIETE DES TUBES D\'ACIER ET D\'ALUMINIUM DE CI)': {
    linkedin: 'https://www.linkedin.com/company/sotaci/',
    employees: '100-500',
    size: 'Medium'
  },
  'CIM IVOIRE (CIM METAL GROUP)': {
    linkedin: 'https://www.linkedin.com/company/cim-ivoire/',
    employees: '500-1000',
    size: 'Large'
  },
  'PRESTIGE CIMENT CI': {
    linkedin: 'https://www.linkedin.com/company/prestige-ciment/',
    employees: '100-500',
    size: 'Medium'
  },
  'CCB (COMPTOIR COMMERCIAL BATIMENT)': {
    linkedin: 'https://www.linkedin.com/company/ccb-ci/',
    employees: '50-100',
    size: 'Medium'
  },
  'IVOIRE METAL ET SOUDURE': {
    linkedin: 'https://www.linkedin.com/company/ivoire-metal-soudure/',
    employees: '50-100',
    size: 'Medium'
  },
  'ECM (ENTREPRISE DE CONSTRUCTION METALLIQUE)': {
    linkedin: 'https://www.linkedin.com/company/ecm-construction/',
    employees: '50-100',
    size: 'Medium'
  },
  
  // Services
  'SICTA': {
    linkedin: 'https://www.linkedin.com/company/sicta-ci/',
    employees: '50-100',
    size: 'Medium'
  },
  'DAUPHIN SECURITE': {
    linkedin: 'https://www.linkedin.com/company/dauphin-securite/',
    employees: '100-500',
    size: 'Medium'
  },
  'SALV CI (SOCIETE AFRICAINE DE LOGISTIQUE DE VALEURS)': {
    linkedin: 'https://www.linkedin.com/company/salv-ci/',
    employees: '50-100',
    size: 'Medium'
  },
  'BUSINESS 24 TV': {
    linkedin: 'https://www.linkedin.com/company/business24tv/',
    employees: '10-50',
    size: 'Small'
  },
  'CABINET ELITES': {
    linkedin: 'https://www.linkedin.com/company/cabinet-elites/',
    employees: '10-50',
    size: 'Small'
  },
  
  // Senegal
  'AIR FRANCE SENEGAL': {
    linkedin: 'https://www.linkedin.com/company/air-france-senegal/',
    employees: '100-500',
    size: 'Medium'
  },
  'SPEBTPS': {
    linkedin: 'https://www.linkedin.com/company/spebtps/',
    employees: '50-100',
    size: 'Medium'
  },
  'SAHEL INGENERIE': {
    linkedin: 'https://www.linkedin.com/company/sahel-ingenierie/',
    employees: '50-100',
    size: 'Medium'
  },
  'GROUPE SEE': {
    linkedin: 'https://www.linkedin.com/company/groupe-see/',
    employees: '100-500',
    size: 'Medium'
  },
  'NSSA (Novel Senegal SA)': {
    linkedin: 'https://www.linkedin.com/company/nssa-senegal/',
    employees: '50-100',
    size: 'Medium'
  },
  
  // Government (excluded from LinkedIn)
  'ARTCI': { linkedin: null, employees: '100-500', size: 'Government' },
  'MINISTERE DU COMMERCE': { linkedin: null, employees: '100-500', size: 'Government' },
  'MINISTERE DE L\'INDUSTRIE': { linkedin: null, employees: '100-500', size: 'Government' },
};

async function main() {
  console.log('🔄 Starting Lead Enrichment...\n');
  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  console.log('📊 Fetching leads from Firestore...');
  const snapshot = await getDocs(collection(db, 'leads'));
  const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log(`   Found ${leads.length} leads\n`);
  
  let updatedCount = 0;
  let noDataCount = 0;
  
  console.log('📝 Enriching leads with LinkedIn profiles and company size...\n');
  
  for (const lead of leads) {
    const companyKey = Object.keys(knownData).find(key => 
      lead.company?.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(lead.company?.toLowerCase())
    );
    
    if (companyKey) {
      const data = knownData[companyKey];
      await updateDoc(doc(db, 'leads', lead.id), {
        linkedin: data.linkedin,
        employees: data.employees,
        company_size: data.size,
        updatedAt: new Date().toISOString()
      });
      updatedCount++;
      console.log(`   ✅ ${lead.company} -> ${data.size} (${data.employees} emp)`);
    } else {
      // Try to infer size from industry
      const industry = lead.industry?.toLowerCase() || '';
      let inferredSize = 'Unknown';
      let inferredEmployees = 'Unknown';
      
      if (['banque', 'bank', 'assurance', 'insurance'].includes(industry)) {
        inferredSize = 'Medium-Large';
        inferredEmployees = '100-500';
      } else if (['agroalimentaire', 'agro', 'agriculture'].includes(industry)) {
        inferredSize = 'Medium';
        inferredEmployees = '50-200';
      } else if (['transport', 'logistics', 'logistique'].includes(industry)) {
        inferredSize = 'Medium';
        inferredEmployees = '50-200';
      } else if (['télécommunications', 'telecom', 'it', 'informatique'].includes(industry)) {
        inferredSize = 'Small-Medium';
        inferredEmployees = '10-100';
      } else if (['btp', 'construction', 'bâtiment'].includes(industry)) {
        inferredSize = 'Medium';
        inferredEmployees = '50-200';
      } else if (['pharmaceutique', 'pharmacie'].includes(industry)) {
        inferredSize = 'Medium';
        inferredEmployees = '50-200';
      } else {
        inferredSize = 'Unknown';
        inferredEmployees = 'Unknown';
      }
      
      await updateDoc(doc(db, 'leads', lead.id), {
        company_size: inferredSize,
        employees: inferredEmployees,
        linkedin: null, // No LinkedIn found
        updatedAt: new Date().toISOString()
      });
      noDataCount++;
      console.log(`   ⚪ ${lead.company} -> ${inferredSize} (inferred)`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ ENRICHMENT COMPLETE');
  console.log('='.repeat(50));
  console.log(`Leads with full data: ${updatedCount}`);
  console.log(`Leads with inferred data: ${noDataCount}`);
  console.log(`Total enriched: ${leads.length}`);
  
  // Summary by size
  console.log('\n📊 Company Size Distribution:');
  const sizeCounts = {};
  leads.forEach(lead => {
    const size = lead.company_size || 'Unknown';
    sizeCounts[size] = (sizeCounts[size] || 0) + 1;
  });
  Object.entries(sizeCounts).forEach(([size, count]) => {
    console.log(`   ${size}: ${count}`);
  });
}

main().catch(console.error);