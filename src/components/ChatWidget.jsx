import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';

const defaultMessages = [
  { id: 1, type: 'bot', text: 'Hi! I\'m your Companion AI assistant. Chat with me here or click the Telegram icon to message me directly.', time: new Date() }
];

function ChatWidget({ theme = 'light' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(defaultMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const userMsg = {
      id: Date.now(),
      type: 'user',
      text: inputText,
      time: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I received your message! For real-time chat, message me on Telegram @JC_iso_bot. I'll respond quickly there!",
        "Got it! The best way to reach me is via Telegram. Send a message to @JC_iso_bot and I'll get back to you.",
        "Thanks for reaching out! Click the Telegram icon to chat with me directly — I'm always responsive there!"
      ];
      
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: responses[Math.floor(Math.random() * responses.length)],
        time: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                Companion AI
              </h3>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                Online • Responds via Telegram
              </p>
            </div>
            <a
              href="https://t.me/JC_iso_bot"
              target="_blank"
              rel="noopener noreferrer"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                theme === 'light' 
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                  : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
              }`}
            >
              Telegram
            </a>
          </div>

          {/* Messages */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${
            theme === 'light' ? 'bg-slate-50' : 'bg-slate-900'
          }`}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.type === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                      : 'bg-gradient-to-br from-slate-600 to-slate-700'
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
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
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
            <p className={`text-[10px] text-center mt-2 ${
              theme === 'light' ? 'text-slate-400' : 'text-slate-500'
            }`}>
              For instant responses, message @JC_iso_bot on Telegram
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideInUp {
          animation: slideInUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

export default ChatWidget;
