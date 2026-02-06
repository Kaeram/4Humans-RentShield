import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Shield, ArrowRight, Building, Users, Vote } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

const ROLES = [
    { id: 'tenant', label: 'Tenant', icon: User, description: 'Report issues and track resolutions' },
    { id: 'landlord', label: 'Landlord', icon: Building, description: 'Respond to tenant issues' },
    { id: 'dao_member', label: 'DAO Member', icon: Vote, description: 'Vote on dispute resolutions' },
];

export default function RegisterPage() {
    const { signUp, isAuthenticated, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        role: 'tenant',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Redirect if already authenticated
    if (isAuthenticated && !authLoading) {
        return <Navigate to="/dashboard" replace />;
    }

    const validate = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';

        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.fullName) newErrors.fullName = 'Full name is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const { error } = await signUp(formData.email, formData.password, {
                full_name: formData.fullName,
                role: formData.role,
            });

            if (error) {
                toast.error('Registration Failed', error.message);
            } else {
                toast.success('Account Created!', 'Please check your email to verify your account');
            }
        } catch (err) {
            toast.error('Error', 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 py-12">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg relative z-10"
            >
                <Card className="border-gray-700/50 bg-gray-800/80 backdrop-blur-xl">
                    <CardHeader className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            Create Account
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            Join RentShield to resolve housing disputes fairly
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {/* Role Selection */}
                            <div className="space-y-2">
                                <Label>I am a...</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {ROLES.map((role) => (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => handleChange('role', role.id)}
                                            className={`p-3 rounded-lg border transition-all text-center ${formData.role === role.id
                                                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                                                    : 'border-gray-600 bg-gray-700/50 text-gray-400 hover:border-gray-500'
                                                }`}
                                        >
                                            <role.icon className="w-5 h-5 mx-auto mb-1" />
                                            <span className="text-xs font-medium">{role.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <Input
                                        id="fullName"
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={(e) => handleChange('fullName', e.target.value)}
                                        error={errors.fullName}
                                        className="pl-10"
                                    />
                                </div>
                                {errors.fullName && (
                                    <p className="text-sm text-red-400">{errors.fullName}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        error={errors.email}
                                        className="pl-10"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-400">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        error={errors.password}
                                        className="pl-10"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-400">{errors.password}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                        error={errors.confirmPassword}
                                        className="pl-10"
                                    />
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-sm text-red-400">{errors.confirmPassword}</p>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4">
                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                loading={loading}
                            >
                                Create Account
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>

                            <p className="text-sm text-gray-400 text-center">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}
