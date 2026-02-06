import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/layout/Layout'
import Landing from './pages/Landing'
import ReportIssue from './pages/ReportIssue'
import CommunityHeatmap from './pages/CommunityHeatmap'
import IssuesDashboard from './pages/IssuesDashboard'
import IssueDetail from './pages/IssueDetail'
import PropertyProfile from './pages/PropertyProfile'
import DAOPanel from './pages/DAOPanel'

function App() {
    return (
        <AppProvider>
            <Layout>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/report" element={<ReportIssue />} />
                    <Route path="/heatmap" element={<CommunityHeatmap />} />
                    <Route path="/dashboard" element={<IssuesDashboard />} />
                    <Route path="/issue/:id" element={<IssueDetail />} />
                    <Route path="/property/:id" element={<PropertyProfile />} />
                    <Route path="/dao" element={<DAOPanel />} />
                </Routes>
            </Layout>
        </AppProvider>
    )
}

export default App
