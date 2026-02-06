import { Routes, Route } from 'react-router-dom'
import {
    LandingPage,
    LoginPage,
    TenantDashboard,
    ReportIssue,
    TenantIssueDetail,
    LandlordDashboard,
    LandlordIssueDetail,
    DaoDashboard,
    DaoCaseDetail,
} from '@/pages'

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Tenant Routes */}
            <Route path="/tenant/dashboard" element={<TenantDashboard />} />
            <Route path="/tenant/report" element={<ReportIssue />} />
            <Route path="/tenant/issue/:id" element={<TenantIssueDetail />} />

            {/* Landlord Routes */}
            <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
            <Route path="/landlord/issue/:id" element={<LandlordIssueDetail />} />

            {/* DAO Routes */}
            <Route path="/dao/dashboard" element={<DaoDashboard />} />
            <Route path="/dao/case/:id" element={<DaoCaseDetail />} />
        </Routes>
    )
}

export default App
