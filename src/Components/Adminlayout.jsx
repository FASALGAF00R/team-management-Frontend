import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Shield,
  Users2,
  Activity,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Load user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user') || localStorage.getItem('adminUser');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Update active menu based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('dashboard')) setActiveMenu('dashboard');
    else if (path.includes('users')) setActiveMenu('users');
    else if (path.includes('roles')) setActiveMenu('roles');
    else if (path.includes('teams')) setActiveMenu('teams');
    else if (path.includes('audit')) setActiveMenu('audit');
  }, [location]);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/admin/dashboard",
      description: "Unified view for all user roles",
    },
    {
      id: "users",
      label: "User Management",
      icon: <Users size={20} />,
      path: "/admin/users",
      description: "Admin-only user administration",
    },
    {
      id: "roles",
      label: "Role Management",
      icon: <Shield size={20} />,
      path: "/admin/roles",
      description: "Create roles & assign permissions",
    },
    {
      id: "teams",
      label: "Team Management",
      icon: <Users2 size={20} />,
      path: "/admin/teams",
      description: "Create teams & monitor members",
    },
    {
      id: "audit",
      label: "Audit Logs",
      icon: <Activity size={20} />,
      path: "/admin/auditlogs",
      description: "Visual system activity tracking",
    },
  ];

  const handleLogout = () => {
    // Clear authentication
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-2xl font-bold text-gray-800">Admin Portal</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          {sidebarOpen && (
            <p className="text-sm text-gray-500 mt-2">
              Complete System Administration
            </p>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500"
                    : "text-gray-700 hover:bg-gray-100"
                } ${!sidebarOpen ? "justify-center" : ""}`
              }
              onClick={() => setActiveMenu(item.id)}
            >
              <div className="flex items-center">
                <span className={`${activeMenu === item.id ? "text-blue-500" : "text-gray-500"}`}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <>
                    <span className="ml-3 font-medium">{item.label}</span>
                    <ChevronRight
                      size={16}
                      className={`ml-auto transition-transform ${
                        activeMenu === item.id ? "rotate-90" : ""
                      }`}
                    />
                  </>
                )}
              </div>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full p-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="ml-3 font-medium">Logout</span>}
          </button>
          {sidebarOpen && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">v2.0.0 • Admin System</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {menuItems.find((item) => item.id === activeMenu)?.label}
              </h2>
              <p className="text-sm text-gray-500">
                {menuItems.find((item) => item.id === activeMenu)?.description}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* User Profile */}
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-500 rounded-full absolute -top-0.5 -right-0.5 z-10"></div>
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.name || 'Admin User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.role?.name || 'Role'}
                    </p>
                  </div>
                  <ChevronDown size={16} className="text-gray-500 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                        {user?.role?.name}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;