import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  BarChart3, 
  Users, 
  Shield, 
  Users2, 
  Activity,
  UserPlus,
  Plus,
  Loader2,
  RefreshCw,
  LogIn,
  Edit,
  Trash2,
  Clock,
  TrendingUp,
  AlertCircle
} from "lucide-react";

const API_BASE = 'http://localhost:5000/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: [],
    roles: [],
    teams: [],
    auditLogs: []
  });
  const [error, setError] = useState('');

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    return { Authorization: `Bearer ${token}` };
  };

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const headers = { headers: getAuthHeaders() };
      
      const [usersRes, rolesRes, teamsRes, auditRes] = await Promise.all([
        axios.get(`${API_BASE}/users/`, headers).catch(() => ({ data: { users: [] } })),
        axios.get(`${API_BASE}/roles/`, headers).catch(() => ({ data: { roles: [] } })),
        axios.get(`${API_BASE}/teams`, headers).catch(() => ({ data: { teams: [] } })),
        axios.get(`${API_BASE}/auditlogs`, headers).catch(() => ({ data: { logs: [] } }))
      ]);

      setStats({
        users: usersRes.data.users || [],
        roles: rolesRes.data.roles || [],
        teams: teamsRes.data.teams || [],
        auditLogs: auditRes.data.logs || []
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get time ago
  const getTimeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(dateString).toLocaleDateString();
  };

  // Get action icon and color
  const getActionStyle = (action) => {
    switch (action) {
      case 'CREATE': return { icon: UserPlus, color: 'bg-green-500', textColor: 'text-green-600' };
      case 'UPDATE': return { icon: Edit, color: 'bg-blue-500', textColor: 'text-blue-600' };
      case 'DELETE': return { icon: Trash2, color: 'bg-red-500', textColor: 'text-red-600' };
      case 'LOGIN': return { icon: LogIn, color: 'bg-purple-500', textColor: 'text-purple-600' };
      default: return { icon: Activity, color: 'bg-gray-500', textColor: 'text-gray-600' };
    }
  };

  // Active users count
  const activeUsers = stats.users.filter(u => u.isActive).length;
  const activeRoles = stats.roles.filter(r => r.isActive).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening in your system.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-800 rounded-xl border border-red-200">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">{stats.users.length}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-green-600 font-medium">{activeUsers} active</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
              <Users className="text-white" size={28} />
            </div>
          </div>
        </div>

        {/* Active Roles */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Roles</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">{activeRoles}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">{stats.roles.length} total</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
              <Shield className="text-white" size={28} />
            </div>
          </div>
        </div>

        {/* Teams */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Teams</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">{stats.teams.length}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">
                  {stats.users.filter(u => u.team).length} members assigned
                </span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
              <Users2 className="text-white" size={28} />
            </div>
          </div>
        </div>

        {/* Audit Events */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Audit Events</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">{stats.auditLogs.length}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">
                  {stats.auditLogs.filter(l => l.action === 'LOGIN').length} logins
                </span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
              <BarChart3 className="text-white" size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
            <button 
              onClick={() => navigate('/admin/users')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.users.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No users yet</div>
            ) : (
              stats.users.slice(0, 5).map(user => (
                <div key={user._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Roles Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Roles</h2>
            <button 
              onClick={() => navigate('/admin/roles')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Manage
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.roles.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No roles yet</div>
            ) : (
              stats.roles.slice(0, 5).map(role => (
                <div key={role._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <Shield className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{role.name}</p>
                        <p className="text-sm text-gray-500">
                          {role.permissions?.filter(p => !p.revoked && p.isActive !== false).length || 0} permissions
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      role.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {role.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <button 
              onClick={() => navigate('/admin/auditlogs')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.auditLogs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No activity yet</div>
            ) : (
              stats.auditLogs.slice(0, 6).map(log => {
                const style = getActionStyle(log.action);
                const ActionIcon = style.icon;
                return (
                  <div key={log._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full ${style.color} flex items-center justify-center flex-shrink-0`}>
                        <ActionIcon className="text-white" size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{log.user?.name || 'User'}</span>
                          {' '}
                          <span className={`font-medium ${style.textColor}`}>
                            {log.action.toLowerCase()}d
                          </span>
                          {' '}a {log.entity}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <Clock size={12} />
                          {getTimeAgo(log.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <UserPlus className="text-blue-600" size={20} />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Add User</p>
              <p className="text-sm text-gray-500">Create new user</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('/admin/roles')}
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <Shield className="text-green-600" size={20} />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Create Role</p>
              <p className="text-sm text-gray-500">Define permissions</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('/admin/teams')}
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Users2 className="text-purple-600" size={20} />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">New Team</p>
              <p className="text-sm text-gray-500">Create team</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('/admin/auditlogs')}
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all group"
          >
            <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
              <Activity className="text-orange-600" size={20} />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">View Logs</p>
              <p className="text-sm text-gray-500">Audit activity</p>
            </div>
          </button>
        </div>
      </div>

      {/* Teams Section */}
      {stats.teams.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Teams Overview</h2>
            <button 
              onClick={() => navigate('/admin/teams')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Manage Teams
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.teams.slice(0, 4).map(team => {
              const memberCount = stats.users.filter(u => 
                u.team?._id === team._id || u.team === team._id
              ).length;
              return (
                <div key={team._id} className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Users2 className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{team.name}</p>
                      <p className="text-sm text-gray-500">{memberCount} members</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;