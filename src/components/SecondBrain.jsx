import React, { useState, useEffect } from 'react';
import { Brain, Plus, Trash2, FileText, Zap, Archive, Send } from 'lucide-react';

const templates = {
  missionReport: {
    name: 'UNESCO Mission Report',
    fields: [
      { key: 'purpose', label: 'Purpose of Mission', type: 'text' },
      { key: 'background', label: 'Background', type: 'text' },
      { key: 'outcomes', label: 'Outcomes & Results Obtained', type: 'textarea' },
      { key: 'notAchieved', label: 'Outcomes That Could Not Be Achieved', type: 'text' },
      { key: 'followUp', label: 'Follow-up Required', type: 'text' },
      { key: 'recommendations', label: 'Recommendations', type: 'text' }
    ]
  },
  quickNote: {
    name: 'Quick Note',
    fields: [
      { key: 'content', label: 'Note', type: 'textarea' },
      { key: 'tags', label: 'Tags (comma separated)', type: 'text' }
    ]
  }
};

function SecondBrain({ theme }) {
  const [inbox, setInbox] = useState([]);
  const [processed, setProcessed] = useState([]);
  const [activeTab, setActiveTab] = useState('inbox');
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [quickInput, setQuickInput] = useState('');

  // Load from localStorage
  useEffect(() => {
    const savedInbox = localStorage.getItem('secondbrain_inbox');
    const savedProcessed = localStorage.getItem('secondbrain_processed');
    if (savedInbox) setInbox(JSON.parse(savedInbox));
    if (savedProcessed) setProcessed(JSON.parse(savedProcessed));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('secondbrain_inbox', JSON.stringify(inbox));
    localStorage.setItem('secondbrain_processed', JSON.stringify(processed));
  }, [inbox, processed]);

  const addToInbox = (content, type = 'note') => {
    const item = {
      id: Date.now().toString(),
      content,
      type,
      createdAt: new Date().toISOString(),
      tags: []
    };
    setInbox(prev => [item, ...prev]);
    setQuickInput('');
  };

  const deleteFromInbox = (id) => {
    setInbox(prev => prev.filter(item => item.id !== id));
  };

  const processItem = (id) => {
    const item = inbox.find(i => i.id === id);
    if (item) {
      setProcessed(prev => [{ ...item, processedAt: new Date().toISOString() }, ...prev]);
      setInbox(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleTemplateSubmit = (e) => {
    e.preventDefault();
    const content = JSON.stringify(formData, null, 2);
    addToInbox(content, currentTemplate);
    setFormData({});
    setCurrentTemplate(null);
  };

  const quickSubmit = (e) => {
    e.preventDefault();
    if (quickInput.trim()) {
      addToInbox(quickInput.trim(), 'quick');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary-400" />
            Second Brain
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Dump thoughts, process later
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-4">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            activeTab === 'inbox' 
              ? 'bg-primary-500 text-white' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          📥 Inbox ({inbox.length})
        </button>
        <button
          onClick={() => setActiveTab('processed')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            activeTab === 'processed' 
              ? 'bg-primary-500 text-white' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          📦 Processed ({processed.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            activeTab === 'templates' 
              ? 'bg-primary-500 text-white' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          📄 Templates
        </button>
      </div>

      {/* Quick Input */}
      {activeTab === 'inbox' && (
        <form onSubmit={quickSubmit} className={`card p-4 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <textarea
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Quick dump: notes, ideas, tasks, anything..."
            className={`w-full h-24 p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 resize-none mb-3`}
          />
          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={!quickInput.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Add to Inbox
            </button>
          </div>
        </form>
      )}

      {/* Template Selection */}
      {activeTab === 'templates' && !currentTemplate && (
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(templates).map(([key, template]) => (
            <button
              key={key}
              onClick={() => setCurrentTemplate(key)}
              className={`card p-6 text-left hover:border-primary-500/50 transition-all ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}
            >
              <FileText className="w-8 h-8 text-primary-400 mb-3" />
              <h4 className="font-semibold text-white mb-1">{template.name}</h4>
              <p className="text-sm text-slate-400">{template.fields.length} fields</p>
            </button>
          ))}
        </div>
      )}

      {/* Template Form */}
      {currentTemplate && (
        <div className={`card p-6 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-400" />
              {templates[currentTemplate].name}
            </h3>
            <button 
              onClick={() => { setCurrentTemplate(null); setFormData({}); }}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleTemplateSubmit}>
            <div className="space-y-4">
              {templates[currentTemplate].fields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm text-slate-400 mb-1">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full h-24 p-3 rounded-lg bg-slate-900 border border-slate-700 text-white resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-6 justify-end">
              <button 
                type="button"
                onClick={() => { setCurrentTemplate(null); setFormData({}); }}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                <Plus className="w-4 h-4" />
                Add to Inbox
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inbox List */}
      {activeTab === 'inbox' && (
        <div className="space-y-3">
          {inbox.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Inbox is empty. Dump something!</p>
            </div>
          ) : (
            inbox.map(item => (
              <div 
                key={item.id}
                className={`card p-4 border-l-4 border-l-primary-500 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-white whitespace-pre-wrap">{item.content}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(item.createdAt).toLocaleString()}
                      {item.tags?.length > 0 && ` • ${item.tags.join(', ')}`}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button 
                      onClick={() => processItem(item.id)}
                      className="p-2 hover:bg-green-500/20 rounded text-green-400"
                      title="Process"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteFromInbox(item.id)}
                      className="p-2 hover:bg-red-500/20 rounded text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Processed List */}
      {activeTab === 'processed' && (
        <div className="space-y-3">
          {processed.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Archive className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No processed items yet</p>
            </div>
          ) : (
            processed.map(item => (
              <div 
                key={item.id}
                className={`card p-4 border-l-4 border-l-green-500 opacity-75 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}
              >
                <p className="text-white whitespace-pre-wrap">{item.content}</p>
                <p className="text-xs text-slate-500 mt-2">
                  Processed: {new Date(item.processedAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default SecondBrain;