import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2 } from 'lucide-react';
import { getLeads, updateLead, deleteLead } from '../utils/firebase';

function LeadsTable({ theme }) {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

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
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const statusColors = {
    new: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    contacted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    trial: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    paid: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  const statuses = ['all', 'new', 'contacted', 'trial', 'paid'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Leads</h2>
          <p className={`text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>
            {filteredLeads.length} of {leads.length} companies 
            {leads.length > 0 && <span className="text-green-400 ml-2">Firestore</span>}
          </p>
        </div>
        <button onClick={loadLeads} className={`btn-secondary ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700'}`}>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className={`card p-4 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`input w-full pl-10 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900'}`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`input ${theme === 'light' ? 'bg-white' : 'bg-slate-900'}`}
          >
            {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All' : s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={`card overflow-hidden ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${theme === 'light' ? 'border-slate-200' : 'border-slate-700'}`}>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Company</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Contact</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Phone</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading from Firestore...</td></tr>
              ) : filteredLeads.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">No leads found</td></tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr key={lead.id} className={`border-b ${theme === 'light' ? 'border-slate-100 hover:bg-slate-50' : 'border-slate-700 hover:bg-slate-700/20'}`}>
                    <td className="p-4">
                      <div className="font-medium">{lead.company}</div>
                      {lead.website && <a href={lead.website} target="_blank" className="text-xs text-primary-400">{lead.website}</a>}
                    </td>
                    <td className="p-4 text-sm">{lead.email || '-'}</td>
                    <td className="p-4 text-sm">{lead.phone || '-'}</td>
                    <td className="p-4">
                      <select
                        value={lead.status || 'new'}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`px-2 py-1 rounded text-xs border cursor-pointer ${statusColors[lead.status] || statusColors.new}`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="trial">Trial</option>
                        <option value="paid">Paid</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <button onClick={() => handleDelete(lead.id)} className="p-2 hover:bg-red-500/20 rounded">
                        <Trash2 className="w-4 h-4 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className={`card p-4 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <div className="text-2xl font-bold">{leads.length}</div>
          <div className={`text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>Total</div>
        </div>
        <div className={`card p-4 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <div className="text-2xl font-bold">{leads.filter(l => l.status === 'new').length}</div>
          <div className={`text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>New</div>
        </div>
        <div className={`card p-4 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <div className="text-2xl font-bold">{leads.filter(l => l.status === 'trial').length}</div>
          <div className={`text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>Trials</div>
        </div>
        <div className={`card p-4 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <div className="text-2xl font-bold">{leads.filter(l => l.status === 'paid').length}</div>
          <div className={`text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>Paid</div>
        </div>
      </div>
    </div>
  );
}

export default LeadsTable;