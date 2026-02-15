import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Upload, Eye, Mail, Trash2 } from 'lucide-react';

function LeadsTable() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load leads from CSV/API
    // For demo, using sample data
    const sampleLeads = [
      { id: 1, company: 'Tech Solutions Africa', website: 'techsolutions.ci', email: 'contact@techsolutions.ci', country: "Côte d'Ivoire", industry: 'Technology', source: 'annuaireci.com', status: 'new' },
      { id: 2, company: 'CII Logistics', website: 'ciilogistics.com', email: 'info@ciilogistics.com', country: "Côte d'Ivoire", industry: 'Logistics', source: 'annuaireci.com', status: 'contacted' },
      { id: 3, company: 'Dakar Business Services', website: 'dakarbusiness.sn', email: 'contact@dakarbusiness.sn', country: 'Sénégal', industry: 'Consulting', source: 'senegal-export.com', status: 'new' },
      { id: 4, company: 'Abidjan Retail Group', website: 'arg.ci', email: 'contact@arg.ci', country: "Côte d'Ivoire", industry: 'Retail', source: 'annuaireci.com', status: 'trial' },
      { id: 5, company: 'Senegal Trade Co', website: 'senegaltrade.sn', email: 'info@senegaltrade.sn', country: 'Sénégal', industry: 'Trade', source: 'senegal-export.com', status: 'new' },
      { id: 6, company: 'Ivory Coast Consulting', website: 'icc.ci', email: 'contact@icc.ci', country: "Côte d'Ivoire", industry: 'Consulting', source: 'annuaireci.com', status: 'paid' },
      { id: 7, company: 'Dakar Tech Hub', website: 'dakartech.sn', email: 'hello@dakartech.sn', country: 'Sénégal', industry: 'Technology', source: 'senegal-export.com', status: 'new' },
      { id: 8, company: 'Abidjan Finance', website: 'abidjanfinance.ci', email: 'contact@abidjanfinance.ci', country: "Côte d'Ivoire", industry: 'Finance', source: 'annuaireci.com', status: 'contacted' },
    ];

    setTimeout(() => {
      setLeads(sampleLeads);
      setFilteredLeads(sampleLeads);
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.industry.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    if (selectedCountry !== 'all') {
      filtered = filtered.filter(lead => lead.country === selectedCountry);
    }

    setFilteredLeads(filtered);
  }, [searchTerm, statusFilter, selectedCountry, leads]);

  const statusColors = {
    new: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    contacted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    trial: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    paid: 'bg-green-500/20 text-green-400 border-green-500/30',
    churned: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const countries = [...new Set(leads.map(l => l.country))];
  const statuses = ['all', 'new', 'contacted', 'trial', 'paid'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Leads</h2>
          <p className="text-slate-400 text-sm">{filteredLeads.length} of {leads.length} companies</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies, emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="input"
            >
              <option value="all">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left p-4 text-sm font-medium text-slate-400">Company</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Contact</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Country</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Industry</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Source</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Loading leads...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No leads found
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr key={lead.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{lead.company}</div>
                      {lead.website && (
                        <a href={`https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-400 hover:underline">
                          {lead.website}
                        </a>
                      )}
                    </td>
                    <td className="p-4">
                      <a href={`mailto:${lead.email}`} className="text-sm text-slate-300 hover:text-primary-400">
                        {lead.email}
                      </a>
                    </td>
                    <td className="p-4 text-sm text-slate-300">{lead.country}</td>
                    <td className="p-4 text-sm text-slate-300">{lead.industry}</td>
                    <td className="p-4 text-sm text-slate-400">{lead.source}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs border ${statusColors[lead.status]}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button className="p-2 hover:bg-slate-600/50 rounded transition-colors" title="View">
                          <Eye className="w-4 h-4 text-slate-400" />
                        </button>
                        <button className="p-2 hover:bg-slate-600/50 rounded transition-colors" title="Send Email">
                          <Mail className="w-4 h-4 text-slate-400" />
                        </button>
                        <button className="p-2 hover:bg-slate-600/50 rounded transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4 text-slate-400" />
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

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-2xl font-bold">{leads.length}</div>
          <div className="text-sm text-slate-400">Total Leads</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold">{leads.filter(l => l.status === 'new').length}</div>
          <div className="text-sm text-slate-400">New</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold">{leads.filter(l => l.status === 'trial').length}</div>
          <div className="text-sm text-slate-400">Trials</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold">{leads.filter(l => l.status === 'paid').length}</div>
          <div className="text-sm text-slate-400">Paid</div>
        </div>
      </div>
    </div>
  );
}

export default LeadsTable;