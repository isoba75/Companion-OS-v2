#!/usr/bin/env node
/**
 * Autonomous CMO Campaign System
 * Sends personalized emails via Gmail, qualifies leads, manages pipeline
 */

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// CONFIG - Fill in your Gmail credentials
const EMAIL_CONFIG = {
  user: 'your-email@gmail.com',       // YOUR GMAIL
  pass: 'your-app-password',          // GMAIL APP PASSWORD
  from: 'Your Name <your-email@gmail.com>',
  signature: `
Cordialement,
Votre Nom
Équipe Digibuntu
--
Digibuntu - La gestion d'entreprise simplifiée pour les PME africaines
WhatsApp: https://wa.me/your-number
Calendly: https://calendly.com/your-link
`
};

// Email templates
const TEMPLATES = {
  cold_1: {
    subject: 'Simplify your business with Digibuntu ERP',
    template: (lead) => `Bonjour ${lead.firstName || 'Madame, Monsieur'},

Je suis [VOTRE NOM] de Digibuntu - une solution ERP conçue spécifiquement pour les PME africaines.

J'ai vu que vous travaillez chez ${lead.company} et je pense que notre logiciel pourrait vous aider à:

✓ Gagner 10h/semaine sur la gestion administrative
✓ Réduire les erreurs de comptabilité de 50%
✓ Suivre votre entreprise en temps réel, depuis votre téléphone

Nous aidons déjà +50 PME en Côte d'Ivoire et au Sénégal.

Je serais ravi de vous montrer une démo gratuite de 15 minutes - calendrier ici: https://calendly.com/your-link/demo

Quand seriez-vous disponible cette semaine?

${EMAIL_CONFIG.signature}`
  },

  cold_2: {
    subject: 'Re: Simplify your business with Digibuntu ERP',
    template: (lead) => `Bonjour ${lead.firstName || 'Madame, Monsieur'},

Je me permets de vous relancer suite à mon dernier message.

J'imagine que vous êtes très occupé - c'est exactement pourquoi Digibuntu existe: pour vous faire gagner du temps!

En résumé, nous aidons les PME comme ${lead.company} à:
- Automatiser la comptabilité
- Suivre les ventes et stocks en temps réel
- Prendre de meilleures décisions avec des rapports simples

Prenez 2 minutes pour réserver votre démo gratuite: https://calendly.com/your-link/demo

À très bientôt,
${EMAIL_CONFIG.signature}`
  },

  cold_3: {
    subject: `${lead => lead.company ? `${lead.company} et l'avenir de la gestion d'entreprise` : 'Une idée pour votre entreprise'}`,
    template: (lead) => `Bonjour ${lead.firstName || 'Madame, Monsieur'},

Je partage avec vous une réflexion qui pourrait vous interesser:

Les PME africaines qui adoptent un ERP comme Digibuntu réduisent leur temps de paperwork de 60% en moyenne.

Chez ${lead.company || 'votre entreprise'}, cela pourrait signifier:
- ${lead.phone ? '+' : ''}${lead.phone ? '1 jour/semaine récupéré pour la stratégie' : '10h/semaine pour ce qui compte vraiment'}
- ${lead.email ? '+' : ''}${lead.email ? 'Zéro erreur de stock' : 'Meilleure visibilité sur les finances'}

Je ne veux pas vous déranger davantage. Voici mon calendrier pour une démo de 10min: https://calendly.com/your-link/demo

À bientôt,
${EMAIL_CONFIG.signature}`
  },

  linkedin_warm: {
    subject: 'Ravi de vous connecter sur LinkedIn',
    template: (lead) => `Bonjour ${lead.firstName || lead.company.split(' ')[0]},

Merci d'avoir accepté ma demande de connexion sur LinkedIn!

Chez Digibuntu, nous aidons les PME africaines à digitaliser leur gestion - et je vois que ${lead.company || 'votre entreprise'} évolue dans ${lead.industry || 'un secteur'} qui nous interesse beaucoup.

Avez-vous des défis particuliers dans la gestion quotidienne de votre entreprise? Je serais curieux d'échanger.

En attendant, n'hésitez pas à consulter notre site: https://digibuntu.com

Bien cordialement,
${EMAIL_CONFIG.signature}`
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