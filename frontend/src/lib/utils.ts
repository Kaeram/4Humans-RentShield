import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

export function formatDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function getTimeAgo(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000)

    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + ' years ago'

    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + ' months ago'

    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + ' days ago'

    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + ' hours ago'

    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + ' minutes ago'

    return 'just now'
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
}

export function getSeverityColor(severity: number): string {
    if (severity >= 8) return 'danger'
    if (severity >= 5) return 'warning'
    return 'success'
}

export function getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
        pending: 'warning',
        'in-review': 'primary',
        'under-investigation': 'accent',
        resolved: 'success',
        dismissed: 'neutral',
        escalated: 'danger',
    }
    return statusColors[status.toLowerCase()] || 'neutral'
}
