import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import RoleManagement from "./pages/admin/Roles";
import AuditLogs from "./pages/admin/Auditlogs";
import Login from "./pages/User/Login";
import AdminLayout from "./Components/Adminlayout";
import ProtectedRoute from "./Auth/ProtectRoute";
import Team from "./pages/admin/Team";
import AdminLogin from "./pages/admin/Adminlogin";
import RegisterUser from "./pages/admin/RegisterUser";

function App() {
  return (
  <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="roles" element={<RoleManagement />} />
          <Route path="teams" element={<Team />} />
          <Route path="auditlogs" element={<AuditLogs />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;