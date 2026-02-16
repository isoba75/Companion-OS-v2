#!/usr/bin/env node
/**
 * Autonomous CMO Campaign System
 * Sends personalized emails via Gmail, qualifies leads, manages pipeline
 */

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// CONFIG - Uses environment variables (more secure)
const EMAIL_CONFIG = {
  user: process.env.GMAIL_USER || 'your-email@gmail.com',
  pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password',
  from: process.env.GMAIL_FROM || 'Your Name <your-email@gmail.com>',
  signature: process.env.GMAIL_SIGNATURE || `
Cordialement,
Votre Nom
Équipe Digibuntu
--
Digibuntu - La gestion d'entreprise simplifiée pour les PME africaines
https://digibuntu.com`
};

// Email templates
const TEMPLATES = {
  cold_1: {
    subject: 'Simplify your business with Digibuntu ERP',
    template: (lead) => `Bonjour ${lead.firstName || 'Madame, Monsieur'},

Je suis [VOTRE NOM] de Digibuntu - une solution ERP conçue spécifiquement pour les PME africaines.

Chez ${lead.company || 'votre entreprise'}, vous devez gérer:
✓ La comptabilité
✓ Les stocks et ventes
✓ Les clients et factures

Digibuntu fait tout ça en UN SEUL logiciel simple.

**Pourquoi les PME nous choisissent:**
- 100% auto-formation (pas de formation nécessaire!)
- Accessible depuis votre téléphone
- Support en français
- Essai gratuit immédiat

**Essayez gratuitement:** https://digibuntu.com/#/signup

C'est gratuit, sans engagement, et vous pouvez commencer maintenant.

Cordialement,
[VOTRE NOM]
Équipe Digibuntu
--
Digibuntu - La gestion d'entreprise simplifiée
https://digibuntu.com`
  },

  cold_2: {
    subject: 'Re: Simplify your business with Digibuntu ERP',
    template: (lead) => `Bonjour ${lead.firstName || 'Madame, Monsieur'},

Je me permets de vous relancer suite à mon dernier message.

Avec Digibuntu, vos équipes peuvent:
- Gérer la comptabilité sans expertise
- Suivre les stocks en temps réel
- Générer des factures professionnelles

Tout ça sans formation - le logiciel est conçu pour être utilisé seul.

**Essayez gratuitement:** https://digibuntu.com/#/signup

Rien à installer, pas de carte bancaire, pas d'engagement.

À bientôt,
[VOTRE NOM]
Équipe Digibuntu
https://digibuntu.com`
  },

  cold_3: {
    subject: `${lead => lead.company ? `${lead.company} - gestion simplifiée` : 'Une idée pour votre entreprise'}`,
    template: (lead) => `Bonjour ${lead.firstName || 'Madame, Monsieur'},

Les PME africaines qui utilisent Digibuntu économisent:
- 10h/semaine sur la gestion administrative
- Des milliers CFA en erreurs de suivi
- Du stress avec la comptabilité

Et tout ça sans formation - le logiciel s'utilise seul.

**Démarrez gratuitement:** https://digibuntu.com/#/signup

C'est vraiment simple - vos équipes peuvent commencer aujourd'hui.

À bientôt,
[VOTRE NOM]
Équipe Digibuntu
https://digibuntu.com`
  },

  linkedin_warm: {
    subject: 'Ravi de vous connecter sur LinkedIn',
    template: (lead) => `Bonjour ${lead.firstName || lead.company?.split(' ')[0]},

Merci d'avoir accepté ma demande de connexion!

Chez Digibuntu, nous aidons les PME africaines à digitaliser leur gestion - et je vois que ${lead.company || 'votre entreprise'} évolue dans ${lead.industry || 'un secteur'} qui nous interesse beaucoup.

Notre promesse: un ERP que vos équipes utilisent seules, sans formation.

**Essayez gratuitement:** https://digibuntu.com/#/signup

N'hésitez pas si vous avez des questions!

Bien cordialement,
[VOTRE NOM]
Équipe Digibuntu
https://digibuntu.com`
  }
};

// Lead qualification criteria
const QUALIFICATION = {
  hot: ['demo_request', 'pricing_question', 'interested', 'meeting_booked'],
  warm: ['replied', 'opened', 'clicked'],
  cold: ['new', 'bounced']
};

async function sendEmail(lead, templateName = 'cold_1') {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_CONFIG.user,
      pass: EMAIL_CONFIG.pass
    }
  });

  const template = TEMPLATES[templateName];
  const subject = typeof template.subject === 'function' 
    ? template.subject(lead) 
    : template.subject;

  const mailOptions = {
    from: EMAIL_CONFIG.from,
    to: lead.email,
    subject: subject,
    text: template.template(lead),
    html: template.template(lead).replace(/\n/g, '<br>')
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${lead.company}: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.log(`❌ Failed to send to ${lead.company}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runCampaign(options = {}) {
  const {
    maxEmails = 50,
    delay = 5000,           // 5 seconds between emails
    template = 'cold_1'
  } = options;

  console.log('🚀 Starting Autonomous CMO Campaign');
  console.log('='.repeat(50));
  console.log(`Template: ${template}`);
  console.log(`Max emails: ${maxEmails}`);
  console.log(`Delay: ${delay}ms`);
  console.log('');

  // Load leads from Firestore
  const { getLeads, updateLead } = require('../utils/firebase');
  const result = await getLeads({ status: 'new', limit: maxEmails * 2 });

  if (!result.success) {
    console.log('❌ Failed to load leads');
    return;
  }

  const leads = result.data.filter(l => l.email && l.email.includes('@'));
  console.log(`Found ${leads.length} leads with emails\n`);

  let sent = 0;
  let failed = 0;

  for (const lead of leads.slice(0, maxEmails)) {
    // Send email
    const result = await sendEmail(lead, template);

    if (result.success) {
      sent++;
      await updateLead(lead.id, {
        status: 'contacted',
        last_email_sent: new Date().toISOString(),
        email_opens: 0,
        email_clicks: 0
      });
    } else {
      failed++;
      if (result.error.includes('quota')) {
        console.log('📪 Gmail quota reached (500/day limit)');
        break;
      }
    }

    // Delay between sends
    await new Promise(r => setTimeout(r, delay));
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 CAMPAIGN SUMMARY');
  console.log('='.repeat(50));
  console.log(`Sent: ${sent}`);
  console.log(`Failed: ${failed}`);
  console.log(`Remaining quota: ${500 - sent}`);
  console.log('\n✅ Campaign complete!');
}

// Auto-qualify leads based on responses
async function qualifyLeads() {
  const { getLeads } = require('../utils/firebase');
  const result = await getLeads();

  if (!result.success) return;

  let hot = 0, warm = 0, cold = 0;

  for (const lead of result.data) {
    if (QUALIFICATION.hot.some(k => lead.status?.includes(k))) {
      lead.qualified = 'hot';
      hot++;
    } else if (QUALIFICATION.warm.some(k => lead.status?.includes(k))) {
      lead.qualified = 'warm';
      warm++;
    } else {
      lead.qualified = 'cold';
      cold++;
    }
  }

  console.log(`📊 Lead Qualification: ${hot} hot, ${warm} warm, ${cold} cold`);
  return { hot, warm, cold };
}

module.exports = { sendEmail, runCampaign, qualifyLeads, TEMPLATES };

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'run';

  if (command === 'run') {
    runCampaign({
      maxEmails: parseInt(args[1]) || 50,
      template: args[2] || 'cold_1'
    });
  } else if (command === 'qualify') {
    qualifyLeads();
  } else if (command === 'test') {
    // Test send to yourself
    sendEmail({
      company: 'TEST',
      email: EMAIL_CONFIG.user,
      firstName: 'Test'
    }, 'cold_1');
  }
}