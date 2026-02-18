/**
 * Chat Widget - Direct chat with AI assistant
 * Uses Google Sheets as the message transport
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';

const CHAT_SHEET_URL = 'YOUR_GOOGLE_SHEET_URL_HERE';

function ChatWidget({ theme = 'light' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!isOpen) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    // Initial fetch
    fetchMessages();

    // Poll every 3 seconds
    pollIntervalRef.current = setInterval(fetchMessages, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isOpen]);

  const fetchMessages = async () => {
    try {
      // For now, use local storage as demo
      const stored = localStorage.getItem('chat_messages');
      if (stored) {
        const msgs = JSON.parse(stored);
        setMessages(msgs);
      }
    } catch (e) {
      console.log('Fetching messages...');
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const userMsg = {
      id: Date.now(),
      type: 'user',
      text: inputText,
      time: new Date().toISOString()
    };
    
    const updated = [...messages, userMsg];
    setMessages(updated);
    localStorage.setItem('chat_messages', JSON.stringify(updated));
    setInputText('');
    setIsTyping(true);
    
    // Simulate AI response for demo
    setTimeout(() => {
      const responses = [
        "Thanks for your message! I'm your AI assistant.",
        "Got it! How can I help you today?",
        "Thanks for reaching out! I'm here to assist.",
        "I understand. Let me help you with that."
      ];
      
      const botMsg = {
        id: Date.now() + 1,
        type: 'assistant',
        text: responses[Math.floor(Math.random() * responses.length)],
        time: new Date().toISOString()
      };
      
      const final = [...updated, botMsg];
      setMessages(final);
      localStorage.setItem('chat_messages', JSON.stringify(final));
      setIsTyping(false);
    }, 2000);
  };

  const formatTime = (timeStr) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen 
            ? 'bg-slate-500 hover:bg-slate-600' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
        }`}
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideInUp"
          style={{ 
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            background: theme === 'light' ? 'white' : '#1e293b'
          }}
        >
          {/* Header */}
          <div className={`px-5 py-4 border-b flex items-center gap-3 ${
            theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-800'
          }`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                Chat with Me
              </h3>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                Direct connection • AI Assistant
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${
            theme === 'light' ? 'bg-slate-50' : 'bg-slate-900'
          }`}>
            {messages.length === 0 && (
              <div className={`text-center py-8 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Hi! I'm your AI assistant.</p>
                <p className="text-xs mt-1">Chat with me directly here!</p>
              </div>
            )}
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.type === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                      : 'bg-gradient-to-br from-green-500 to-green-600'
                  }`}>
                    {msg.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`rounded-2xl px-4 py-2.5 ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-sm'
                      : theme === 'light'
                        ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                        : 'bg-slate-800 border border-slate-700 text-white rounded-tl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.type === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                      {formatTime(msg.time)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className={`rounded-2xl rounded-tl-sm px-4 py-3 ${
                    theme === 'light' ? 'bg-white border border-slate-200' : 'bg-slate-800 border border-slate-700'
                  }`}>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={`p-4 border-t ${
            theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-700 bg-slate-800'
          }`}>
            <div className={`flex items-center gap-2 rounded-xl px-4 py-2 ${
              theme === 'light' ? 'bg-slate-100 border border-slate-200' : 'bg-slate-700 border border-slate-600'
            }`}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className={`flex-1 bg-transparent border-none outline-none text-sm placeholder:text-slate-400 ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className={`p-2 rounded-lg transition-all ${
                  inputText.trim()
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slideInUp { animation: slideInUp 0.3s ease-out; }
      `}</style>
    </>
  );
}

export default ChatWidget;
