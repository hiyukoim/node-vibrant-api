const express = require('express');
const cors = require('cors');
const { Vibrant } = require('node-vibrant/node');
const app = express();

// Allow origins defined in ALLOWED_ORIGINS env var (comma-separated)
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [];
app.use(cors({ origin: allowedOrigins }));

app.use(express.json());
// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/api/analyze', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: "Image URL is required." });
        }
        const palette = await Vibrant.from(url).getPalette();
        // Extract all available properties from each swatch
        const swatchNames = ['Vibrant', 'Muted', 'DarkVibrant', 'DarkMuted', 'LightVibrant', 'LightMuted'];
        const result = {};
        for (const name of swatchNames) {
            const swatch = palette[name];
            result[name] = swatch ? {
                hex: swatch.hex,
                rgb: swatch.rgb,
                hsl: swatch.hsl,
                population: swatch.population,
                titleTextColor: swatch.titleTextColor,
                bodyTextColor: swatch.bodyTextColor
            } : null;
        }
        res.json(result);
    } catch (error) {
        console.error("Color extraction failed:", error);
        res.status(500).json({ error: "Internal server error during color extraction." });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Swatch API is running on port ${PORT}`);
});
