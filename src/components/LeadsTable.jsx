import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Phone, Mail, Globe, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { getLeads, updateLead, deleteLead } from '../utils/firebase';

function LeadsTable({ theme }) {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => { loadLeads(); }, []);

  const loadLeads = async () => {
    setIsLoading(true);
    const result = await getLeads();
    if (result.success) {
      setLeads(result.data);
      setFilteredLeads(result.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    let filtered = leads;
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }
    setFilteredLeads(filtered);
  }, [searchTerm, statusFilter, leads]);

  const handleStatusChange = async (leadId, newStatus) => {
    await updateLead(leadId, { status: newStatus });
    loadLeads();
  };

  const handleDelete = async (leadId) => {
    if (window.confirm('Delete this lead?')) {
      await deleteLead(leadId);
      loadLeads();
    }
  };

  const copyToClipboard = async (text, id) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.log('Copy failed');
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return null;
    // Clean up phone format
    const cleaned = phone.replace(/[^\d+]/g, ' ').replace(/\s+/g, ' ').trim();
    return cleaned;
  };

  const statusColors = {
    new: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    contacted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    trial: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    paid: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  const statuses = ['all', 'new', 'contacted', 'trial', 'paid'];

  const hasContact = (lead) => lead.email || lead.phone || lead.website;

  const contactStats = {
    withEmail: leads.filter(l => l.email).length,
    withPhone: leads.filter(l => l.phone).length,
    withWebsite: leads.filter(l => l.website).length,
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Leads</h2>
          <p className={`text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>
            {filteredLeads.length} of {leads.length} companies
            {leads.length > 0 && <span className="text-green-400 ml-2">● Live</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadLeads} className={`btn-secondary flex items-center gap-2 ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700'}`}>
            <Filter className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Contact Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`card p-3 text-center ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Mail className="w-4 h-4 text-green-400" />
            <span className="text-xl font-bold">{contactStats.withEmail}</span>
          </div>
          <p className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>With Email</p>
        </div>
        <div className={`card p-3 text-center ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Phone className="w-4 h-4 text-blue-400" />
            <span className="text-xl font-bold">{contactStats.withPhone}</span>
          </div>
          <p className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>With Phone</p>
        </div>
        <div className={`card p-3 text-center ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-purple-400" />
            <span className="text-xl font-bold">{contactStats.withWebsite}</span>
          </div>
          <p className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>With Website</p>
        </div>
      </div>

      {/* Filters */}
      <div className={`card p-4 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search company, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`input w-full pl-10 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900'}`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`input w-full sm:w-40 ${theme === 'light' ? 'bg-white' : 'bg-slate-900'}`}
          >
            {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Table - Mobile Optimized */}
      <div className={`card overflow-hidden ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${theme === 'light' ? 'border-slate-200' : 'border-slate-700'}`}>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Company</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400 hidden md:table-cell">Contact</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400 hidden lg:table-cell">Phone</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    Loading from Firestore...
                  </div>
                </td></tr>
              ) : filteredLeads.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">No leads found</td></tr>
              ) : (
                filteredLeads.map((lead, index) => (
                  <tr
                    key={lead.id}
                    className={`border-b ${theme === 'light' ? 'border-slate-100 hover:bg-slate-50' : 'border-slate-700 hover:bg-slate-700/20'} animate-slideUp`}
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <td className="p-4">
                      <div className="font-semibold">{lead.company}</div>
                      {lead.industry && (
                        <div className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                          {lead.industry}
                        </div>
                      )}
                      {/* Mobile-only contact row */}
                      <div className="md:hidden mt-2 space-y-1">
                        {lead.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="text-primary-400">{lead.email}</span>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span className="text-primary-400">{formatPhone(lead.phone)}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="space-y-2">
                        {lead.email ? (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-green-400 flex-shrink-0" />
                            <span className="text-sm text-primary-400 truncate max-w-[150px]">{lead.email}</span>
                            <button
                              onClick={() => copyToClipboard(lead.email, `email-${lead.id}`)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {copiedId === `email-${lead.id}` ? (
                                <CheckCircle className="w-3 h-3 text-green-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500">-</span>
                        )}
                        {/* Social indicators */}
                        <div className="flex gap-1">
                          {lead.facebook && <span className="w-5 h-5 rounded bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center">f</span>}
                          {lead.linkedin && <span className="w-5 h-5 rounded bg-blue-600/20 text-blue-400 text-xs flex items-center justify-center">in</span>}
                          {lead.instagram && <span className="w-5 h-5 rounded bg-pink-500/20 text-pink-400 text-xs flex items-center justify-center">ig</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      {lead.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-blue-400 flex-shrink-0" />
                          <span className="text-sm">{formatPhone(lead.phone)}</span>
                          <button onClick={() => copyToClipboard(formatPhone(lead.phone), `phone-${lead.id}`)}>
                            {copiedId === `phone-${lead.id}` ? (
                              <CheckCircle className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <select
                        value={lead.status || 'new'}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
                          statusColors[lead.status] || statusColors.new
                        } ${theme === 'light' ? 'bg-white' : 'bg-slate-900'}`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="trial">Trial</option>
                        <option value="paid">Paid</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {lead.website && (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 text-slate-400" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-4 gap-3">
        <div className={`card p-3 text-center ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <div className="text-xl font-bold">{leads.length}</div>
          <div className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>Total</div>
        </div>
        <div className={`card p-3 text-center ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <div className="text-xl font-bold text-slate-400">{leads.filter(l => l.status === 'new').length}</div>
          <div className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>New</div>
        </div>
        <div className={`card p-3 text-center ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <div className="text-xl font-bold text-blue-400">{leads.filter(l => l.status === 'trial').length}</div>
          <div className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>Trials</div>
        </div>
        <div className={`card p-3 text-center ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <div className="text-xl font-bold text-green-400">{leads.filter(l => l.status === 'paid').length}</div>
          <div className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>Paid</div>
        </div>
      </div>
    </div>
  );
}

export default LeadsTable;