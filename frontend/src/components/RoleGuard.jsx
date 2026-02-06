import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleGuard - Requires user to have specific role(s)
 * @param {string|string[]} allowedRoles - Role or array of roles allowed
 * @param {string} redirectTo - Path to redirect if unauthorized (default: /dashboard)
 */
export function RoleGuard({ children, allowedRoles, redirectTo = '/dashboard' }) {
    const { role, loading } = useAuth();

    // Show nothing while loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400">Checking permissions...</p>
                </div>
            </div>
        );
    }

    // Normalize allowedRoles to array
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Check if user's role is allowed
    if (!roles.includes(role)) {
        return <Navigate to={redirectTo} replace />;
    }

    return children;
}

export default RoleGuard;
