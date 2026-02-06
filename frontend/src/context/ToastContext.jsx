import React, { createContext, useContext, useState, useCallback } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ title, description, variant = 'default', duration = 5000 }) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, title, description, variant, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback((options) => addToast(options), [addToast]);

    toast.success = (title, description) => addToast({ title, description, variant: 'success' });
    toast.error = (title, description) => addToast({ title, description, variant: 'error' });
    toast.warning = (title, description) => addToast({ title, description, variant: 'warning' });

    return (
        <ToastContext.Provider value={{ toast, removeToast }}>
            <ToastPrimitive.Provider swipeDirection="right">
                {children}
                {toasts.map((t) => (
                    <ToastPrimitive.Root
                        key={t.id}
                        open={true}
                        onOpenChange={(open) => !open && removeToast(t.id)}
                        className={cn(
                            'fixed bottom-4 right-4 z-[100] flex w-full max-w-sm items-center justify-between gap-4 rounded-lg border p-4 shadow-lg transition-all',
                            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-bottom-full',
                            {
                                'border-gray-700 bg-gray-800 text-white': t.variant === 'default',
                                'border-green-600 bg-green-900/90 text-green-100': t.variant === 'success',
                                'border-red-600 bg-red-900/90 text-red-100': t.variant === 'error',
                                'border-yellow-600 bg-yellow-900/90 text-yellow-100': t.variant === 'warning',
                            }
                        )}
                    >
                        <div className="flex flex-col gap-1">
                            {t.title && (
                                <ToastPrimitive.Title className="text-sm font-semibold">
                                    {t.title}
                                </ToastPrimitive.Title>
                            )}
                            {t.description && (
                                <ToastPrimitive.Description className="text-sm opacity-90">
                                    {t.description}
                                </ToastPrimitive.Description>
                            )}
                        </div>
                        <ToastPrimitive.Close className="rounded p-1 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20">
                            <X className="h-4 w-4" />
                        </ToastPrimitive.Close>
                    </ToastPrimitive.Root>
                ))}
                <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] m-0 flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]" />
            </ToastPrimitive.Provider>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
