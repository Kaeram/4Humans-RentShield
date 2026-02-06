import { createContext, useContext, useState, useEffect } from 'react'
import { issues, properties } from '../data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'light'
        }
        return 'light'
    })

    const [allIssues] = useState(issues)
    const [allProperties] = useState(properties)

    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light')
    }

    const getIssueById = (id) => {
        return allIssues.find(issue => issue.id === id)
    }

    const getPropertyById = (id) => {
        return allProperties.find(property => property.property_id === id)
    }

    const getIssuesByPropertyId = (propertyId) => {
        return allIssues.filter(issue => issue.property_id === propertyId)
    }

    const getIssuesByStatus = (status) => {
        return allIssues.filter(issue => issue.status === status)
    }

    const getIssuesByCategory = (category) => {
        return allIssues.filter(issue => issue.category === category)
    }

    const getPendingDisputes = () => {
        return allIssues.filter(issue =>
            issue.status === 'Under Review' &&
            issue.dao_verdict.final_decision === 'Pending'
        )
    }

    const value = {
        theme,
        toggleTheme,
        issues: allIssues,
        properties: allProperties,
        getIssueById,
        getPropertyById,
        getIssuesByPropertyId,
        getIssuesByStatus,
        getIssuesByCategory,
        getPendingDisputes,
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useApp must be used within an AppProvider')
    }
    return context
}
