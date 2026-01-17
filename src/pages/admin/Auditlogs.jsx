import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../../config/api';
import { 
  FileText, 
  Search, 
  RefreshCw, 
  Loader2, 
  AlertCircle,
  X,
  Check,
  User,
  UserPlus,
  Edit,
  Trash2,
  LogIn,
  Filter,
  Calendar,
  ChevronDown
} from 'lucide-react';

const API_BASE = API;

// Action icons and colors
const ACTION_CONFIG = {
  CREATE: { 
    icon: UserPlus, 
    color: 'bg-green-100 text-green-700 border-green-200',
    iconColor: 'text-green-600'
  },
  UPDATE: { 
    icon: Edit, 
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    iconColor: 'text-blue-600'
  },
  DELETE: { 
    icon: Trash2, 
    color: 'bg-red-100 text-red-700 border-red-200',
    iconColor: 'text-red-600'
  },
  LOGIN: { 
    icon: LogIn, 
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    iconColor: 'text-purple-600'
  },
};

// Entity colors
const ENTITY_COLORS = {
  User: 'bg-indigo-50 text-indigo-700',
  Role: 'bg-amber-50 text-amber-700',
  Team: 'bg-cyan-50 text-cyan-700',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    return { Authorization: `Bearer ${token}` };
  };

  // Fetch audit logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/auditlogs`, {
        headers: getAuthHeaders()
      });
      console.log(response.data.logs,"ioioioio");
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setMessage({ type: 'error', text: 'Failed to load audit logs' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = !actionFilter || log.action === actionFilter;
    const matchesEntity = !entityFilter || log.entity === entityFilter;
    
    return matchesSearch && matchesAction && matchesEntity;
  });

  // Get unique entities for filter
  const uniqueEntities = [...new Set(logs.map(log => log.entity))];

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      })
    };
  };

  // Get time ago
  const getTimeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(dateString).date;
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading audit logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="text-indigo-600" size={32} />
              Audit Logs
            </h1>
            <p className="text-gray-600 mt-1">Track all system activities and user actions</p>
          </div>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-500/30"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 flex items-center gap-3 p-4 rounded-xl border ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border-green-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{message.text}</span>
            <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by user, entity, or action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Action Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white min-w-[150px]"
              >
                <option value="">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="LOGIN">Login</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>

            {/* Entity Filter */}
            <div className="relative">
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="px-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white min-w-[150px]"
              >
                <option value="">All Entities</option>
                {uniqueEntities.map(entity => (
                  <option key={entity} value={entity}>{entity}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>

            {/* Clear Filters */}
            {(searchTerm || actionFilter || entityFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActionFilter('');
                  setEntityFilter('');
                }}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserPlus className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {logs.filter(l => l.action === 'CREATE').length}
                </p>
                <p className="text-xs text-gray-500">Creates</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Edit className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {logs.filter(l => l.action === 'UPDATE').length}
                </p>
                <p className="text-xs text-gray-500">Updates</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Trash2 className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {logs.filter(l => l.action === 'DELETE').length}
                </p>
                <p className="text-xs text-gray-500">Deletes</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <LogIn className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {logs.filter(l => l.action === 'LOGIN').length}
                </p>
                <p className="text-xs text-gray-500">Logins</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Action</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Entity</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Entity ID</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      Timestamp
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <FileText className="mx-auto text-gray-300 mb-3" size={48} />
                      <p className="text-gray-500">No audit logs found</p>
                      {(searchTerm || actionFilter || entityFilter) && (
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const actionConfig = ACTION_CONFIG[log.action] || ACTION_CONFIG.CREATE;
                    const ActionIcon = actionConfig.icon;
                    const entityColor = ENTITY_COLORS[log.entity] || 'bg-gray-50 text-gray-700';
                    const { date, time } = formatDate(log.createdAt);

                    return (
                      <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                        {/* User */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                              {log.user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {log.user?.name || 'Unknown User'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {log.user?.email || '—'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${actionConfig.color}`}>
                            <ActionIcon size={12} />
                            {log.action}
                          </span>
                        </td>

                        {/* Entity */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${entityColor}`}>
                            {log.entity}
                          </span>
                        </td>

                        {/* Entity ID */}
                        <td className="px-6 py-4">
                          <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-mono">
                            {log.entityId ? log.entityId.slice(-8) : '—'}
                          </code>
                        </td>

                        {/* Timestamp */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm text-gray-900">{date}</p>
                            <p className="text-xs text-gray-500">{time}</p>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{filteredLogs.length}</span> of{' '}
              <span className="font-medium">{logs.length}</span> logs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}