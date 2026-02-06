import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowLeft, Building, AlertTriangle, TrendingUp, CheckCircle,
    BarChart3, PieChart, Calendar, ExternalLink
} from 'lucide-react'
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useApp } from '../context/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'

const COLORS = ['#f97316', '#ef4444', '#a855f7', '#22c55e', '#dc2626', '#3b82f6', '#eab308', '#b45309']

export default function PropertyProfile() {
    const { id } = useParams()
    const { getPropertyById, getIssuesByPropertyId } = useApp()

    const property = getPropertyById(id)
    const propertyIssues = getIssuesByPropertyId(id)

    if (!property) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="p-8 text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
                    <p className="text-muted-foreground mb-4">The property you're looking for doesn't exist.</p>
                    <Button asChild>
                        <Link to="/dashboard">Back to Dashboard</Link>
                    </Button>
                </Card>
            </div>
        )
    }

    const categoryData = Object.entries(property.categories_breakdown)
        .filter(([_, count]) => count > 0)
        .map(([category, count]) => ({ name: category, value: count }))

    // Generate mock historical data
    const historicalData = [
        { month: 'Aug', issues: 3, resolved: 1 },
        { month: 'Sep', issues: 5, resolved: 2 },
        { month: 'Oct', issues: 4, resolved: 3 },
        { month: 'Nov', issues: 6, resolved: 4 },
        { month: 'Dec', issues: 3, resolved: 2 },
        { month: 'Jan', issues: propertyIssues.length > 5 ? 4 : 2, resolved: 1 },
    ]

    const riskColor = property.risk_score > 70 ? 'text-red-500' : property.risk_score > 40 ? 'text-yellow-500' : 'text-green-500'
    const riskBg = property.risk_score > 70 ? 'from-red-500' : property.risk_score > 40 ? 'from-yellow-500' : 'from-green-500'

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Back button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-6"
                >
                    <Button asChild variant="ghost" className="gap-2">
                        <Link to="/dashboard">
                            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </Link>
                    </Button>
                </motion.div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Building className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold">{property.property_id}</h1>
                    </div>
                    <p className="text-muted-foreground">{property.address}</p>
                    <p className="text-sm text-muted-foreground mt-1">Managed by: {property.landlord_name}</p>
                </motion.div>

                {/* Stats Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    {/* Risk Score */}
                    <Card className="col-span-2 md:col-span-1">
                        <CardContent className="p-6">
                            <div className="text-center">
                                <div className={`relative w-24 h-24 mx-auto mb-4`}>
                                    <svg className="w-24 h-24 transform -rotate-90">
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            className="text-muted"
                                        />
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={`${property.risk_score * 2.51} 251`}
                                            className={riskColor}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className={`text-2xl font-bold ${riskColor}`}>{property.risk_score}</span>
                                    </div>
                                </div>
                                <p className="font-semibold">Risk Score</p>
                                <p className="text-xs text-muted-foreground">Higher = More Risk</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 text-center">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                            <div className="text-3xl font-bold">{property.total_reports}</div>
                            <p className="text-sm text-muted-foreground">Total Reports</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 text-center">
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                            <div className="text-3xl font-bold text-green-500">{property.resolved_percentage}%</div>
                            <p className="text-sm text-muted-foreground">Resolution Rate</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 text-center">
                            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                            <div className="text-3xl font-bold">{propertyIssues.length}</div>
                            <p className="text-sm text-muted-foreground">Active Issues</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Historical Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5" />
                                    Issue History (6 Months)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={historicalData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="month" className="text-sm" />
                                        <YAxis className="text-sm" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="issues" fill="#ef4444" name="Reported" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="resolved" fill="#22c55e" name="Resolved" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Category Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChart className="w-5 h-5" />
                                    Issue Categories
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {categoryData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RechartsPie>
                                            <Pie
                                                data={categoryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                labelLine={false}
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </RechartsPie>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                        No category data available
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Recent Issues */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Recent Issues at This Property
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {propertyIssues.length > 0 ? (
                                <div className="space-y-4">
                                    {propertyIssues.slice(0, 5).map((issue) => (
                                        <div
                                            key={issue.id}
                                            className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-mono text-sm font-medium">{issue.id}</span>
                                                    <Badge variant="secondary">{issue.category}</Badge>
                                                    <Badge
                                                        variant={
                                                            issue.status === 'Resolved' ? 'success' :
                                                                issue.status === 'Rejected' ? 'destructive' :
                                                                    issue.status === 'Under Review' ? 'warning' : 'pending'
                                                        }
                                                    >
                                                        {issue.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-1">{issue.description}</p>
                                            </div>
                                            <Button asChild variant="ghost" size="sm">
                                                <Link to={`/issue/${issue.id}`}>
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    No issues reported for this property yet.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
