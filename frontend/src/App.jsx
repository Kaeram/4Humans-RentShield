import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';

// Pages
import {
    LoginPage,
    RegisterPage,
    DashboardPage,
    ReportIssuePage,
    IssueDetailPage,
    DAOPage,
    AdminPage,
    HeatmapPage,
} from './pages';

// Layout wrapper for authenticated pages
function AuthenticatedLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-900">
            {children}
        </div>
    );
}

export default function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/heatmap" element={<HeatmapPage />} />

                    {/* Protected Routes - Any authenticated user */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/issue/:id"
                        element={
                            <ProtectedRoute>
                                <IssueDetailPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Tenant Only Routes */}
                    <Route
                        path="/report-issue"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['tenant']} redirectTo="/dashboard">
                                    <ReportIssuePage />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />

                    {/* DAO Member Routes */}
                    <Route
                        path="/dao"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['dao_member', 'admin']} redirectTo="/dashboard">
                                    <DAOPage />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Only Routes */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin']} redirectTo="/dashboard">
                                    <AdminPage />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />

                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </AuthProvider>
        </ToastProvider>
    );
}
