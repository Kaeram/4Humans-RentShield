import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

// Role-based redirect destinations
const ROLE_REDIRECTS = {
    tenant: '/dashboard',
    landlord: '/dashboard',
    dao_member: '/dao',
    admin: '/admin',
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch user profile from profiles table
    const fetchProfile = useCallback(async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }

            return data;
        } catch (err) {
            console.error('Profile fetch error:', err);
            return null;
        }
    }, []);

    // Handle session changes
    const handleSession = useCallback(async (session) => {
        if (session?.user) {
            setUser(session.user);
            const userProfile = await fetchProfile(session.user.id);
            if (userProfile) {
                setProfile(userProfile);
                setRole(userProfile.role);
            }
        } else {
            setUser(null);
            setProfile(null);
            setRole(null);
        }
        setLoading(false);
    }, [fetchProfile]);

    // Initialize auth state
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth event:', event);
                await handleSession(session);

                // Redirect after login based on role
                if (event === 'SIGNED_IN' && session?.user) {
                    const userProfile = await fetchProfile(session.user.id);
                    if (userProfile?.role) {
                        const redirectPath = ROLE_REDIRECTS[userProfile.role] || '/dashboard';
                        navigate(redirectPath);
                    }
                }

                // Redirect to login after logout
                if (event === 'SIGNED_OUT') {
                    navigate('/login');
                }
            }
        );

        return () => {
            subscription?.unsubscribe();
        };
    }, [handleSession, fetchProfile, navigate]);

    // Sign in with email and password
    const signIn = async (email, password) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Sign in error:', error);
            return { data: null, error };
        } finally {
            setLoading(false);
        }
    };

    // Sign up with email and password
    const signUp = async (email, password, metadata = {}) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                },
            });

            if (error) throw error;

            // Create profile after signup
            if (data.user) {
                const { error: profileError } = await supabase.from('profiles').insert({
                    id: data.user.id,
                    email: data.user.email,
                    full_name: metadata.full_name || '',
                    role: metadata.role || 'tenant',
                });

                if (profileError) {
                    console.error('Profile creation error:', profileError);
                }
            }

            return { data, error: null };
        } catch (error) {
            console.error('Sign up error:', error);
            return { data: null, error };
        } finally {
            setLoading(false);
        }
    };

    // Sign out
    const signOut = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Sign out error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Refresh profile data
    const refreshProfile = async () => {
        if (user) {
            const userProfile = await fetchProfile(user.id);
            if (userProfile) {
                setProfile(userProfile);
                setRole(userProfile.role);
            }
        }
    };

    const value = {
        user,
        profile,
        role,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        isAuthenticated: !!user,
        isTenant: role === 'tenant',
        isLandlord: role === 'landlord',
        isDAOMember: role === 'dao_member',
        isAdmin: role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
