/**
 * Chat Bridge - Monitors Firestore for messages and responds as AI
 * Runs as a cron job
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp } = require('firebase-admin/firestore');

// Firebase Admin SDK credentials from Mission Control
const serviceAccount = JSON.parse(require('fs').readFileSync('/data/workspace/src/firebase-service-account.json', 'utf8'));

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const CHAT_COLLECTION = 'mission_control_chat';
const SESSION_ID = 'assistant';

async function checkMessages() {
  try {
    console.log('🔍 Checking for new chat messages...');
    
    // Get messages from the last 10 minutes
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    
    // Get all unprocessed messages
    const q = query(
      collection(db, CHAT_COLLECTION),
      where('type', '==', 'user'),
      where('processed', '!=', true),
      orderBy('timestamp', 'asc'),
      limit(10)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('✅ No new messages');
      return;
    }
    
    console.log(`📬 Found ${snapshot.docs.length} new message(s)`);
    
    for (const docSnapshot of snapshot.docs) {
      const message = docSnapshot.data();
      console.log(`💬 Message: "${message.text}"`);
      
      // Generate AI response (simple version - OpenClaw will handle real AI)
      const response = generateResponse(message.text);
      
      // Save assistant response
      await addDoc(collection(db, CHAT_COLLECTION), {
        type: 'assistant',
        text: response,
        originalMessageId: docSnapshot.id,
        sessionId: SESSION_ID,
        timestamp: Date.now(),
        createdAt: serverTimestamp()
      });
      
      // Mark original as processed
      const { doc } = require('firebase-admin/firestore');
      await doc(db, CHAT_COLLECTION, docSnapshot.id).update({ processed: true });
      
      console.log('✅ Response sent');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function generateResponse(text) {
  const lowerText = text.toLowerCase();
  
  // Simple response logic - in production, this would call OpenClaw's AI
  if (lowerText.includes('hello') || lowerText.includes('hi')) {
    return "Hi there! I'm your AI assistant. How can I help you today?";
  }
  if (lowerText.includes('mission')) {
    return "I can help you with mission reports. Just share your notes and I'll draft it for you!";
  }
  if (lowerText.includes('help')) {
    return "I'm here to help! I can assist with mission reports, reminders, tasks, and more. What do you need?";
  }
  if (lowerText.includes('time') || lowerText.includes('date')) {
    return `It's ${new Date().toLocaleString()}. Is there anything you'd like me to help you with?`;
  }
  
  return "Thanks for your message! I'm your AI assistant. I'll respond to your queries here in Mission Control, or you can chat with me on Telegram @JC_iso_bot for faster responses.";
}

// Export for cron jobs
module.exports = { checkMessages };

// Run if called directly
if (require.main === module) {
  checkMessages();
}
