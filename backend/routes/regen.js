/**
 * routes/regen.js
 * Regenerative Agriculture — Rule-Based Rotation Engine.
 * No external API — uses farm's crop history from SQLite.
 *
 * Routes:
 *   GET /api/regen/rotation?userId=   — suggest next crop rotation
 *   GET /api/regen/cover-crops        — cover crop guide
 */

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'agromind-super-secret-key-123!!'

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Authentication required' })
    try {
        req.user = jwt.verify(token, JWT_SECRET)
        next()
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' })
    }
}

/**
 * Crop Rotation Rules Matrix
 * Based on well-established regenerative agriculture principles:
 * - Nitrogen fixation (legumes after heavy feeders)
 * - Pest break cycles (avoid same family back-to-back)
 * - Root depth variation for soil structure
 * Source: FAO Crop Rotation Guide, ATTRA Sustainable Agriculture
 */
const ROTATION_RULES = {
    'Wheat': {
        avoid: ['Barley', 'Oats', 'Triticale'],  // same family (Poaceae)
        recommend: [
            { crop: 'Chickpea', reason: 'Legume — fixes 80–120 kg N/ha, reducing fertilizer need by 40%', confidence: 95 },
            { crop: 'Lentil', reason: 'Short-season legume — ideal gap filler before next wheat; improves soil porosity', confidence: 88 },
            { crop: 'Mustard', reason: 'Breaks wheat-borne fungal cycles (take-all disease); glucosinolates suppress soilborne pathogens', confidence: 82 },
            { crop: 'Sunflower', reason: 'Deep taproot breaks hardpan; drought tolerant; good cash crop', confidence: 75 },
        ],
        coverCrops: ['Field Pea', 'Dhaincha (Sesbania)', 'Berseem Clover'],
        restPeriod: '1 season',
        notes: 'Monocropping wheat increases Puccinia rust pressure by 2–3x over 3 years.',
    },
    'Rice': {
        avoid: ['Rice'],
        recommend: [
            { crop: 'Black Gram (Urad)', reason: 'Fast-maturing legume (60–65 days) that fits between rice seasons; fixes 40–60 kg N/ha', confidence: 93 },
            { crop: 'Green Gram (Moong)', reason: 'Roots add organic matter; minimal water requirement; suppresses weeds in paddy fields', confidence: 87 },
            { crop: 'Potato', reason: 'Deep tillage breaks rice hardpan (plough layer); different pest profile', confidence: 80 },
            { crop: 'Wheat', reason: 'Classic rice–wheat system; complementary root zones; established in Punjab/Haryana', confidence: 90 },
        ],
        coverCrops: ['Dhaincha (Sesbania)', 'Sun Hemp (Crotalaria)', 'Mung Bean'],
        restPeriod: '1 season (ideally)',
        notes: 'Continuous paddy cultivation causes soil subsidence and methane emissions. Rotate with at least 1 upland crop.',
    },
    'Corn': {
        avoid: ['Sorghum', 'Sugarcane'],
        recommend: [
            { crop: 'Soybean', reason: 'Classic corn-soy rotation; soybean fixes 100–200 kg N/ha, offsetting corn\'s heavy nitrogen demand', confidence: 96 },
            { crop: 'Alfalfa', reason: 'Deep-rooted perennial legume; breaks corn rootworm cycle; excellent for 2-year break', confidence: 85 },
            { crop: 'Winter Wheat', reason: 'Cool-season crop avoids corn stalk borer carry-over; adds ground cover through winter', confidence: 83 },
            { crop: 'Cowpea', reason: 'Heat-tolerant legume; drought resistant; suppresses nematodes that affect corn roots', confidence: 78 },
        ],
        coverCrops: ['Cereal Rye', 'Winter Vetch', 'Radish (Tillage Radish)'],
        restPeriod: '1 season',
        notes: 'Corn-after-corn reduces yield by 10–15% (yield drag) and increases rootworm and gray leaf spot pressure.',
    },
    'Tomato': {
        avoid: ['Potato', 'Pepper', 'Eggplant', 'Tobacco'],  // all Solanaceae
        recommend: [
            { crop: 'Wheat', reason: 'Cereal break from Solanaceae family; wheat straw mulch suppresses Fusarium in tomato beds', confidence: 92 },
            { crop: 'Maize', reason: 'Breaks late blight (Phytophthora) cycle; different water and nutrient use', confidence: 86 },
            { crop: 'Onion', reason: 'Sulfur compounds suppress bacterial wilt (Ralstonia) in soil; complementary root zone', confidence: 81 },
            { crop: 'Basil (inter-crop)', reason: 'Companion: repels aphids, whiteflies; improves flavor; increases pollinator activity', confidence: 74 },
        ],
        coverCrops: ['French Marigold (Tagetes)', 'Buckwheat', 'Hairy Vetch'],
        restPeriod: '2–3 seasons out of Solanaceae',
        notes: 'Tomato consecutive cropping causes Fusarium wilt and bacterial wilt buildup. Minimum 2-year break from all nightshades.',
    },
    'Cotton': {
        avoid: ['Cotton', 'Okra'],  // same Malvaceae family
        recommend: [
            { crop: 'Groundnut', reason: 'Nitrogen-fixing legume; breaks cotton bollworm cycle; higher water-use efficiency', confidence: 91 },
            { crop: 'Sorghum', reason: 'Drought-tolerant cereal; deep roots improve water infiltration after cotton compaction', confidence: 85 },
            { crop: 'Pulses (any)', reason: 'Any legume restores nitrogen depleted by cotton\'s heavy fertilizer demand', confidence: 88 },
            { crop: 'Sesame', reason: 'Drought resistant; minimal pest overlap with cotton; oil crop with good market value', confidence: 76 },
        ],
        coverCrops: ['Cowpea', 'Sunflower', 'Mung Bean'],
        restPeriod: '1–2 seasons',
        notes: 'Cotton monoculture causes rapid organic matter depletion and Pink Bollworm resistance buildup in 3–5 years.',
    },
    'Soybean': {
        avoid: ['Soybean', 'Black Gram', 'Chickpea'],
        recommend: [
            { crop: 'Corn', reason: 'Classic rotation; corn benefits from residual soy nitrogen; breaks soybean cyst nematode cycle', confidence: 94 },
            { crop: 'Wheat', reason: 'Soybean improves soil for wheat; wheat straw decomposes adding carbon', confidence: 87 },
            { crop: 'Sugarcane', reason: 'Soybean\'s nitrogen residual helps sugarcane establishment; different pest spectrum', confidence: 78 },
        ],
        coverCrops: ['Winter Rye', 'Crimson Clover', 'Radish'],
        restPeriod: '1–2 seasons',
        notes: 'Soybean cyst nematode (Heterodera glycines) builds up rapidly under continuous soy — rotation is critical.',
    },
    'Potato': {
        avoid: ['Tomato', 'Pepper', 'Eggplant'],  // Solanaceae
        recommend: [
            { crop: 'Cereal (Wheat/Barley)', reason: 'Cereal break disrupts potato late blight and common scab pathogens', confidence: 90 },
            { crop: 'Onion', reason: 'Antimicrobial sulfur compounds suppress Rhizoctonia and Fusarium', confidence: 84 },
            { crop: 'Legume (any)', reason: 'Nitrogen restoration after potato\'s heavy nutrient demand', confidence: 88 },
        ],
        coverCrops: ['Oats', 'Phacelia', 'Crimson Clover'],
        restPeriod: '3–4 years before growing potato again',
        notes: 'Potato should not follow any Solanaceae. Minimum 3-year break to reduce Verticillium and scab.',
    },
    'Mustard': {
        avoid: ['Canola', 'Radish', 'Cabbage'],  // Brassicaceae
        recommend: [
            { crop: 'Wheat', reason: 'Classic rabi sequence; mustard adds diversity, breaks aphid cycles in wheat monoculture', confidence: 89 },
            { crop: 'Chickpea', reason: 'Both are rabi crops; chickpea adds nitrogen, mustard adds organic matter', confidence: 83 },
            { crop: 'Rice', reason: 'Breaks Brassica disease cycle (blackleg, sclerotinia) with flooded conditions', confidence: 80 },
        ],
        coverCrops: ['Fenugreek', 'Lentil', 'Pea'],
        restPeriod: '2 seasons out of Brassicaceae',
        notes: 'Sclerotinia stem rot spreads rapidly in mustard monoculture. Minimum 3-year break between brassica crops.',
    },
}

const DEFAULT_RULE = {
    recommend: [
        { crop: 'Legume (any)', reason: 'Legumes restore nitrogen to soil depleted by the previous crop', confidence: 70 },
        { crop: 'Cereal', reason: 'Provides a crop family break; reduces buildup of soil-borne diseases', confidence: 65 },
    ],
    coverCrops: ['Clover', 'Dhaincha', 'Cowpea'],
    restPeriod: '1 season',
    notes: 'No specific rotation data for this crop. General recommendation: rotate with a legume or cereal.',
}

/**
 * Cover Crop Benefits Guide
 */
const COVER_CROPS = [
    {
        name: 'Dhaincha (Sesbania bispinosa)',
        family: 'Legume',
        nFixation: '80–120 kg N/ha',
        biomass: '15–20 tonnes/ha (green mass)',
        bestAfter: ['Rice', 'Wheat', 'Corn'],
        plantingWindow: 'June–August (Kharif season start)',
        benefits: ['Nitrogen fixation', 'Weed suppression', 'Waterlogging tolerance', 'Animal fodder'],
        bricsNote: 'Widely used in India, Vietnam, and Brazil as green manure before rice transplanting.',
    },
    {
        name: 'Sun Hemp (Crotalaria juncea)',
        family: 'Legume',
        nFixation: '100–150 kg N/ha',
        biomass: '10–15 tonnes/ha',
        bestAfter: ['Cotton', 'Sorghum', 'Sunflower'],
        plantingWindow: 'May–June or September–October',
        benefits: ['High nitrogen fixation', 'Nematode suppression', 'Deep rooting improves soil structure'],
        bricsNote: 'Used across India, Brazil, and South Africa as a soil restorative in degraded lands.',
    },
    {
        name: 'Berseem Clover (Trifolium alexandrinum)',
        family: 'Legume',
        nFixation: '150–200 kg N/ha',
        biomass: '50–60 tonnes/ha (multiple cuts)',
        bestAfter: ['Wheat', 'Potato', 'Mustard'],
        plantingWindow: 'October–November (Rabi)',
        benefits: ['Very high N fixation', 'Excellent livestock fodder', 'Suppresses soil erosion', 'Attracts pollinators'],
        bricsNote: 'Common in India and Egypt; being adopted in China\'s Yangtze basin for double-rice system recovery.',
    },
    {
        name: 'French Marigold (Tagetes patula)',
        family: 'Asteraceae',
        nFixation: 'None (non-legume)',
        biomass: '5–8 tonnes/ha',
        bestAfter: ['Tomato', 'Brinjal', 'Pepper'],
        plantingWindow: 'Before main crop (45 days ahead) or as border crop',
        benefits: ['Nematode suppression (root-knot)', 'Whitefly repellent', 'Attracts beneficial insects'],
        bricsNote: 'Used in India and Brazil for soil biofumigation before tomato and vegetable crops.',
    },
    {
        name: 'Radish (Tillage Radish / Raphanus sativus)',
        family: 'Brassicaceae',
        nFixation: 'None',
        biomass: '4–6 tonnes/ha (roots)',
        bestAfter: ['Corn', 'Soybean', 'Wheat'],
        plantingWindow: 'September–October (post-harvest)',
        benefits: ['Deep taproot breaks hardpan (compaction)', 'Rapid soil coverage reduces erosion', 'Winter-kills — no termination needed'],
        bricsNote: 'Popular in no-till systems in Brazil\'s Paraná state; increasingly used in India\'s Indo-Gangetic Plain.',
    },
]

/**
 * GET /api/regen/rotation
 * Reads crop history from SQLite, returns rotation suggestions.
 */
router.get('/rotation', authMiddleware, async (req, res) => {
    const db = req.app.locals.db

    // Get user's crop history from farm_records, ordered by recency
    const records = await new Promise((resolve, reject) => {
        db.all(
            `SELECT crop, field, planted, harvest, status
             FROM farm_records
             WHERE user_id = ?
             ORDER BY planted DESC`,
            [req.user.id],
            (err, rows) => err ? reject(err) : resolve(rows)
        )
    }).catch(err => {
        return res.status(500).json({ error: 'Database error reading farm records', detail: err.message })
    })

    if (!records || records.length === 0) {
        return res.json({
            message: 'No crop history found. Add crops in Farm Records to get rotation suggestions.',
            suggestions: [],
            coverCrops: COVER_CROPS.slice(0, 3),
        })
    }

    // Group by field, find the most recent crop per field
    const fieldMap = {}
    for (const r of records) {
        if (!fieldMap[r.field]) {
            fieldMap[r.field] = []
        }
        fieldMap[r.field].push(r.crop)
    }

    // For each field, generate rotation suggestions
    const suggestions = Object.entries(fieldMap).map(([field, crops]) => {
        const lastCrop = crops[0]  // most recent
        const history = crops.slice(0, 3)  // last 3 crops in this field
        const rule = ROTATION_RULES[lastCrop] || DEFAULT_RULE

        // Filter out crops grown in last 2 seasons in this field
        const filtered = rule.recommend.filter(r => !history.slice(0, 2).includes(r.crop))

        return {
            field,
            lastCrop,
            cropHistory: history,
            avoidCrops: rule.avoid || [],
            recommendations: (filtered.length > 0 ? filtered : rule.recommend).slice(0, 3),
            suggestedCoverCrops: rule.coverCrops,
            restPeriod: rule.restPeriod,
            agronomicNote: rule.notes,
            bricsContext: `This rotation strategy is aligned with regenerative practices in Brazil, India, and China under the BRICS Agricultural Research Group framework.`,
        }
    })

    return res.json({
        userId: req.user.id,
        totalFields: Object.keys(fieldMap).length,
        suggestions,
        coverCropGuide: COVER_CROPS,
        principle: 'Regenerative rotation: diversify crop families, include a legume every 2 seasons, maintain soil cover year-round.',
        timestamp: new Date().toISOString(),
    })
})

/**
 * GET /api/regen/cover-crops
 * Returns the full cover crop reference guide.
 */
router.get('/cover-crops', (req, res) => {
    return res.json({
        coverCrops: COVER_CROPS,
        principle: 'Cover crops protect and restore soil between cash crop seasons. Choose based on previous crop and season.',
        timestamp: new Date().toISOString(),
    })
})

module.exports = router
