// Mock data for RentShield - 50 Issues, 15 Properties

export const categories = ['Maintenance', 'Safety', 'Harassment', 'Security Deposit', 'Illegal Eviction', 'Amenities', 'Noise', 'Pest Control']
export const statuses = ['Pending', 'Under Review', 'Resolved', 'Rejected']

export const areas = [
    { name: 'Andheri East', lat: 19.1136, lng: 72.8697 },
    { name: 'Andheri West', lat: 19.1362, lng: 72.8296 },
    { name: 'Bandra', lat: 19.0596, lng: 72.8295 },
    { name: 'Powai', lat: 19.1176, lng: 72.9060 },
    { name: 'Malad', lat: 19.1874, lng: 72.8484 },
    { name: 'Goregaon', lat: 19.1663, lng: 72.8526 },
    { name: 'Dadar', lat: 19.0178, lng: 72.8478 },
    { name: 'Kurla', lat: 19.0726, lng: 72.8845 },
    { name: 'Chembur', lat: 19.0522, lng: 72.8994 },
    { name: 'Thane', lat: 19.2183, lng: 72.9781 },
    { name: 'Borivali', lat: 19.2307, lng: 72.8567 },
    { name: 'Kandivali', lat: 19.2045, lng: 72.8525 },
    { name: 'Juhu', lat: 19.1075, lng: 72.8263 },
    { name: 'Versova', lat: 19.1320, lng: 72.8172 },
    { name: 'Santacruz', lat: 19.0837, lng: 72.8368 }
]

const descriptions: Record<string, string[]> = {
    'Maintenance': [
        'Severe water leakage from ceiling for over two weeks with no response from landlord.',
        'Broken air conditioning unit not repaired despite multiple complaints.',
        'Plumbing issues causing water damage to furniture and belongings.',
        'Electrical wiring exposed and sparking, creating fire hazard.',
        'Broken windows letting in rain and mosquitoes for over a month.',
        'Water heater not working for three weeks, no hot water available.',
        'Kitchen sink blocked, water overflowing onto floor daily.'
    ],
    'Safety': [
        'Fire exit blocked by landlord\'s storage items, violating safety codes.',
        'Building elevator malfunctioning frequently, got stuck twice this month.',
        'No fire extinguishers in the building despite repeated requests.',
        'Loose railing on staircase, extremely dangerous for residents.',
        'Gas leak reported but landlord refuses to call professional service.',
        'Emergency exit doors locked from outside during night hours.'
    ],
    'Harassment': [
        'Landlord making unannounced visits at odd hours without permission.',
        'Threatening messages from landlord demanding early lease termination.',
        'Landlord cut off water supply as intimidation tactic.',
        'Verbal abuse from landlord when requesting legitimate repairs.',
        'Landlord harassing family members to vacate before lease end.',
        'Privacy violation - landlord installed cameras without consent.'
    ],
    'Security Deposit': [
        'Full security deposit withheld without valid reason after move-out.',
        'Landlord demanding additional deposit mid-lease without justification.',
        'Deposit not returned 3 months after lease ended despite clean handover.',
        'False damage claims to retain security deposit.',
        'Landlord refusing to provide receipt for security deposit paid.',
        'Unauthorized deductions from deposit for normal wear and tear.'
    ],
    'Illegal Eviction': [
        'Received illegal eviction notice with only 7 days to vacate.',
        'Locks changed while tenant was at work, belongings inaccessible.',
        'Landlord threatening to call police for false complaints to force eviction.',
        'Utilities cut off to force tenant to leave before lease end.',
        'Physical intimidation by landlord\'s associates to vacate property.',
        'Eviction notice served during protected period without cause.'
    ],
    'Amenities': [
        'Gym and pool access denied despite being included in rent agreement.',
        'Parking spot allocated to another tenant, no alternative provided.',
        'Internet connection repeatedly cut without prior notice.',
        'Common area lighting not working for weeks, safety concern.',
        'Promised furnishings removed without rent reduction.',
        'Water supply limited to specific hours despite 24/7 promise.'
    ],
    'Noise': [
        'Construction noise from landlord\'s renovation at 6 AM daily.',
        'Loud parties hosted by landlord in common areas until midnight.',
        'Industrial equipment operated in adjacent unit during night.',
        'No sound insulation despite being advertised as quiet residence.',
        'Persistent noise from landlord\'s commercial activity in building.'
    ],
    'Pest Control': [
        'Severe cockroach infestation not addressed for over a month.',
        'Rat sightings in kitchen, landlord refuses professional pest control.',
        'Bed bug infestation spreading, no response from property management.',
        'Termite damage to furniture, landlord denies responsibility.',
        'Mosquito breeding in stagnant water on property grounds.',
        'Ant infestation in entire apartment, DIY solutions not working.'
    ]
}

const imagesByCategory: Record<string, string[]> = {
    'Maintenance': ['water_leak_1.jpg', 'water_leak_2.jpg', 'broken_pipe.jpg', 'ceiling_damage.jpg'],
    'Safety': ['blocked_exit.jpg', 'broken_railing.jpg', 'exposed_wiring.jpg', 'fire_hazard.jpg'],
    'Harassment': ['threatening_message.jpg', 'evidence_1.jpg', 'camera_installed.jpg'],
    'Security Deposit': ['agreement_copy.jpg', 'receipt_scan.jpg', 'damage_before.jpg', 'damage_after.jpg'],
    'Illegal Eviction': ['eviction_notice.jpg', 'changed_locks.jpg', 'cut_utilities.jpg'],
    'Amenities': ['gym_closed.jpg', 'parking_issue.jpg', 'common_area.jpg'],
    'Noise': ['noise_meter.jpg', 'construction_site.jpg', 'evidence_video.jpg'],
    'Pest Control': ['cockroach_evidence.jpg', 'rat_droppings.jpg', 'termite_damage.jpg', 'infestation.jpg']
}

function generateIssues() {
    const issues = []
    const startDate = new Date('2025-08-01')

    for (let i = 1; i <= 50; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)]
        const area = areas[Math.floor(Math.random() * areas.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const severity = Math.floor(Math.random() * 5) + 1
        const descList = descriptions[category]
        const description = descList[Math.floor(Math.random() * descList.length)]
        const images = imagesByCategory[category].slice(0, Math.floor(Math.random() * 3) + 1)

        const daysAgo = Math.floor(Math.random() * 180)
        const createdAt = new Date(startDate)
        createdAt.setDate(createdAt.getDate() + daysAgo)

        const tamperingProb = Math.random() * 0.3
        const confidenceScore = 0.7 + Math.random() * 0.28

        const votesFor = Math.floor(Math.random() * 10) + 1
        const votesAgainst = Math.floor(Math.random() * 5)
        let finalDecision = 'Pending'
        if (status === 'Resolved') finalDecision = 'Valid'
        else if (status === 'Rejected') finalDecision = 'Invalid'
        else if (votesFor + votesAgainst >= 10) {
            finalDecision = votesFor > votesAgainst ? 'Valid' : 'Invalid'
        }

        issues.push({
            id: `ISS-${String(i).padStart(3, '0')}`,
            category,
            severity,
            description,
            location: {
                area: area.name,
                lat: area.lat + (Math.random() - 0.5) * 0.02,
                lng: area.lng + (Math.random() - 0.5) * 0.02
            },
            status,
            created_at: createdAt.toISOString().split('T')[0],
            images,
            ai_verdict: {
                exif_valid: Math.random() > 0.15,
                tampering_probability: parseFloat(tamperingProb.toFixed(2)),
                confidence_score: parseFloat(confidenceScore.toFixed(2)),
                auto_category: category
            },
            dao_verdict: {
                votes_for: votesFor,
                votes_against: votesAgainst,
                final_decision: finalDecision
            },
            property_id: `PROP-${String(Math.floor(Math.random() * 15) + 1).padStart(3, '0')}`
        })
    }

    return issues.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

function generateProperties() {
    const properties = []
    const landlordNames = [
        'Sunrise Realty', 'Metro Housing', 'Urban Dwellings', 'Golden Gate Properties',
        'Horizon Homes', 'Prime Estates', 'Vista Living', 'Royal Residences',
        'Neptune Builders', 'Skyline Apartments', 'Green Valley Housing', 'Pinnacle Properties',
        'Oasis Homes', 'Harmony Residences', 'Elite Living Spaces'
    ]

    for (let i = 1; i <= 15; i++) {
        const area = areas[i - 1]
        const totalReports = Math.floor(Math.random() * 12) + 3
        const resolvedCount = Math.floor(Math.random() * totalReports)
        const riskScore = Math.min(100, Math.floor((totalReports - resolvedCount) * 8 + Math.random() * 30))

        const categoryBreakdown: Record<string, number> = {}
        categories.forEach(cat => {
            categoryBreakdown[cat] = Math.floor(Math.random() * 4)
        })

        properties.push({
            property_id: `PROP-${String(i).padStart(3, '0')}`,
            area: area.name,
            address: `${Math.floor(Math.random() * 500) + 1}, ${area.name}, Mumbai - ${400000 + Math.floor(Math.random() * 100)}`,
            landlord_name: landlordNames[i - 1],
            risk_score: riskScore,
            total_reports: totalReports,
            resolved_percentage: Math.floor((resolvedCount / totalReports) * 100),
            categories_breakdown: categoryBreakdown,
            lat: area.lat,
            lng: area.lng
        })
    }

    return properties
}

export const issues = generateIssues()
export const properties = generateProperties()
export const categories_list = categories
export const areas_list = areas
export const statuses_list = statuses
