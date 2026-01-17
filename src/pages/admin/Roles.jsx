import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../../config/api';
import { 
  Shield, 
  Plus, 
  Trash2, 
  X, 
  Check, 
  Loader2, 
  AlertCircle,
  Save,
  RefreshCw,
  ChevronDown,
  Edit2,
  Calendar,
  Clock
} from 'lucide-react';

const API_BASE = API;

// All available permissions with their categories and scopes
const ALL_PERMISSIONS = [
  // User Management
  { key: 'user.create', label: 'Create Users', category: 'User Management' },
  { key: 'user.read', label: 'View Users', category: 'User Management' },
  { key: 'user.update', label: 'Update Users', category: 'User Management' },
  { key: 'user.delete', label: 'Delete Users', category: 'User Management' },
  // Role Management
  { key: 'role.create', label: 'Create Roles', category: 'Role Management' },
  { key: 'role.read', label: 'View Roles', category: 'Role Management' },
  { key: 'role.update', label: 'Update Roles', category: 'Role Management' },
  { key: 'role.delete', label: 'Delete Roles', category: 'Role Management' },
  // Team Management
  { key: 'team.create', label: 'Create Teams', category: 'Team Management' },
  { key: 'team.read', label: 'View Teams', category: 'Team Management' },
  { key: 'team.update', label: 'Update Teams', category: 'Team Management' },
  { key: 'team.delete', label: 'Delete Teams', category: 'Team Management' },
  // Audit
  { key: 'audit.read', label: 'View Audit Logs', category: 'Audit' },
];

const SCOPES = ['global', 'team', 'self'];

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [selectedRole, setSelectedRole] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  
  const [newRole, setNewRole] = useState({ 
    name: '', 
    description: '', 
    permissions: [],
    validFrom: '',
    validTill: ''
  });

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  // Fetch roles from backend
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/roles/`, {
        headers: getAuthHeaders()
      });
      setRoles(response.data.roles || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setMessage({ type: 'error', text: 'Failed to load roles' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Group permissions by category
  const groupedPermissions = ALL_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {});

  // Check if a permission is active for a role and get its details
  const getPermissionStatus = (role, permKey) => {
    const perm = role.permissions?.find(p => p.key === permKey && !p.revoked && p.isActive !== false);
    return perm 
      ? { 
          active: true, 
          scope: perm.scope || 'global',
          validFrom: perm.validFrom,
          validTill: perm.validTill
        } 
      : { active: false, scope: 'global', validFrom: null, validTill: null };
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format date for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  // Handle permission toggle for selected role
  const handlePermissionToggle = async (permKey) => {
    if (!selectedRole) return;
    
    const currentStatus = getPermissionStatus(selectedRole, permKey);
    let updatedPermissions;

    if (currentStatus.active) {
      // Remove permission
      updatedPermissions = selectedRole.permissions.filter(p => p.key !== permKey);
    } else {
      // Add permission with default scope
      updatedPermissions = [
        ...selectedRole.permissions,
        { key: permKey, scope: 'global', isActive: true, revoked: false }
      ];
    }

    await updateRolePermissions(selectedRole._id, updatedPermissions);
  };

  // Handle scope change for a permission
  const handleScopeChange = async (permKey, newScope) => {
    if (!selectedRole) return;

    const updatedPermissions = selectedRole.permissions.map(p => 
      p.key === permKey ? { ...p, scope: newScope } : p
    );

    await updateRolePermissions(selectedRole._id, updatedPermissions);
  };

  // Handle permission date change
  const handlePermissionDateChange = async (permKey, field, value) => {
    if (!selectedRole) return;

    const updatedPermissions = selectedRole.permissions.map(p => 
      p.key === permKey ? { ...p, [field]: value ? new Date(value).toISOString() : null } : p
    );

    await updateRolePermissions(selectedRole._id, updatedPermissions);
  };

  // Update role permissions via API
  const updateRolePermissions = async (roleId, permissions) => {
    setSaving(true);
    try {
      await axios.patch(`${API_BASE}/roles/${roleId}`, 
        { permissions },
        { headers: getAuthHeaders() }
      );

      // Update local state
      const updatedRoles = roles.map(r => 
        r._id === roleId ? { ...r, permissions } : r
      );
      setRoles(updatedRoles);
      setSelectedRole(updatedRoles.find(r => r._id === roleId));
      setMessage({ type: 'success', text: 'Permissions updated successfully' });
    } catch (error) {
      console.error('Error updating permissions:', error);
      setMessage({ type: 'error', text: 'Failed to update permissions' });
    } finally {
      setSaving(false);
    }
  };

  // Create new role
  const handleCreateRole = async () => {
    if (!newRole.name.trim()) {
      setMessage({ type: 'error', text: 'Role name is required' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: newRole.name.toUpperCase(),
        description: newRole.description,
        permissions: newRole.permissions,
        validFrom: newRole.validFrom ? new Date(newRole.validFrom).toISOString() : new Date().toISOString(),
        validTill: newRole.validTill ? new Date(newRole.validTill).toISOString() : null
      };

      await axios.post(`${API_BASE}/roles/`, payload, {
        headers: getAuthHeaders()
      });

      setMessage({ type: 'success', text: 'Role created successfully' });
      setShowCreateModal(false);
      setNewRole({ name: '', description: '', permissions: [], validFrom: '', validTill: '' });
      fetchRoles();
    } catch (error) {
      console.error('Error creating role:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create role' });
    } finally {
      setSaving(false);
    }
  };

  // Delete role
  const handleDeleteRole = async () => {
    if (!roleToDelete) return;

    setSaving(true);
    try {
      await axios.delete(`${API_BASE}/roles/${roleToDelete._id}`, {
        headers: getAuthHeaders()
      });

      setMessage({ type: 'success', text: 'Role deleted successfully' });
      setShowDeleteModal(false);
      
      if (selectedRole?._id === roleToDelete._id) {
        setSelectedRole(null);
      }
      setRoleToDelete(null);
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete role' });
    } finally {
      setSaving(false);
    }
  };

  // Toggle permission in create modal
  const toggleNewRolePermission = (permKey) => {
    const exists = newRole.permissions.find(p => p.key === permKey);
    if (exists) {
      setNewRole({
        ...newRole,
        permissions: newRole.permissions.filter(p => p.key !== permKey)
      });
    } else {
      setNewRole({
        ...newRole,
        permissions: [...newRole.permissions, { key: permKey, scope: 'global', isActive: true }]
      });
    }
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
          <span>Loading roles...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="text-indigo-600" size={32} />
                Role Management
              </h1>
              <p className="text-gray-600 mt-2">Create and manage roles with custom permissions</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchRoles}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-500/30"
              >
                <Plus size={20} />
                Create Role
              </button>
            </div>
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles List */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-900">Roles ({roles.length})</h2>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {roles.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No roles found. Create one to get started.
                </div>
              ) : (
                roles.map(role => (
                  <div
                    key={role._id}
                    onClick={() => setSelectedRole(role)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedRole?._id === role._id 
                        ? 'bg-indigo-50 border-l-4 border-indigo-600' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{role.name}</h3>
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {role.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className={`px-2 py-0.5 rounded-full ${
                            role.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {role.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span>{role.permissions?.length || 0} permissions</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRoleToDelete(role);
                          setShowDeleteModal(true);
                        }}
                        className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Permissions Panel */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {selectedRole ? (
              <>
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600">
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      <h2 className="text-xl font-semibold">{selectedRole.name}</h2>
                      <p className="text-indigo-100 mt-1">{selectedRole.description || 'No description'}</p>
                      {/* Role Validity Dates */}
                      <div className="flex items-center gap-4 mt-3 text-sm text-indigo-100">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          <span>From: {formatDate(selectedRole.validFrom) || 'Not set'}</span>
                        </div>
                        {selectedRole.validTill && (
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} />
                            <span>Till: {formatDate(selectedRole.validTill)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {saving && (
                        <span className="flex items-center gap-2 text-indigo-100 text-sm">
                          <Loader2 className="animate-spin" size={16} />
                          Saving...
                        </span>
                      )}
                      <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium backdrop-blur-sm">
                        {selectedRole.permissions?.filter(p => !p.revoked && p.isActive !== false).length || 0} Permissions
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 max-h-[500px] overflow-y-auto">
                  <h3 className="font-semibold text-gray-900 mb-4">Manage Permissions</h3>
                  <div className="space-y-6">
                    {Object.entries(groupedPermissions).map(([category, perms]) => (
                      <div key={category} className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            <div className="w-1 h-5 bg-indigo-600 rounded"></div>
                            {category}
                          </h4>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {perms.map(perm => {
                            const status = getPermissionStatus(selectedRole, perm.key);
                            return (
                              <div
                                key={perm.key}
                                className={`flex items-center justify-between p-4 transition-colors ${
                                  status.active ? 'bg-indigo-50/50' : 'hover:bg-gray-50'
                                }`}
                              >
                                <label className="flex items-center gap-3 cursor-pointer flex-1">
                                  <div className="relative">
                                    <input
                                      type="checkbox"
                                      checked={status.active}
                                      onChange={() => handlePermissionToggle(perm.key)}
                                      disabled={saving}
                                      className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                      status.active 
                                        ? 'bg-indigo-600 border-indigo-600' 
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}>
                                      {status.active && <Check size={14} className="text-white" />}
                                    </div>
                                  </div>
                                  <span className={`text-sm ${status.active ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                                    {perm.label}
                                  </span>
                                  <span className="text-xs text-gray-400 font-mono">{perm.key}</span>
                                </label>
                                
                                {status.active && (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {/* Scope Selector */}
                                    <div className="relative">
                                      <select
                                        value={status.scope}
                                        onChange={(e) => handleScopeChange(perm.key, e.target.value)}
                                        disabled={saving}
                                        className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                      >
                                        {SCOPES.map(scope => (
                                          <option key={scope} value={scope}>
                                            {scope.charAt(0).toUpperCase() + scope.slice(1)}
                                          </option>
                                        ))}
                                      </select>
                                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                    
                                    {/* Validity Dates */}
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-400">From:</span>
                                        <input
                                          type="date"
                                          value={formatDateForInput(status.validFrom)}
                                          onChange={(e) => handlePermissionDateChange(perm.key, 'validFrom', e.target.value)}
                                          disabled={saving}
                                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        />
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-400">Till:</span>
                                        <input
                                          type="date"
                                          value={formatDateForInput(status.validTill)}
                                          onChange={(e) => handlePermissionDateChange(perm.key, 'validTill', e.target.value)}
                                          disabled={saving}
                                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full p-12">
                <div className="text-center">
                  <Shield className="mx-auto text-gray-300 mb-4" size={64} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Role Selected</h3>
                  <p className="text-gray-600">Select a role from the list to manage its permissions</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Plus className="text-indigo-600" size={24} />
                Create New Role
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                  placeholder="e.g., DEVELOPER"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none uppercase"
                />
                <p className="text-xs text-gray-500 mt-1">Role name will be converted to uppercase</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                  placeholder="Brief description of the role"
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              {/* Role Validity Dates */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Calendar size={14} />
                    Valid From
                  </label>
                  <input
                    type="date"
                    value={newRole.validFrom}
                    onChange={(e) => setNewRole({...newRole, validFrom: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for immediate</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Clock size={14} />
                    Valid Till
                  </label>
                  <input
                    type="date"
                    value={newRole.validTill}
                    onChange={(e) => setNewRole({...newRole, validTill: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for no expiry</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Initial Permissions</label>
                <div className="space-y-4 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category}>
                      <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">{category}</h5>
                      <div className="space-y-1">
                        {perms.map(perm => {
                          const isSelected = newRole.permissions.some(p => p.key === perm.key);
                          return (
                            <label
                              key={perm.key}
                              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleNewRolePermission(perm.key)}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                              <span className="text-sm text-gray-700">{perm.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                disabled={saving || !newRole.name.trim()}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && roleToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-600" size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Role</h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete the role <span className="font-semibold">{roleToDelete.name}</span>? 
                This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setRoleToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRole}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}