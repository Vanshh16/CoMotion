// apps/ai-service/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { parseFreeTextToQuery } from './parserChain.js';
import { scoreCandidates } from './utils.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const WEB_APP_URL = process.env.WEB_APP_URL || 'http://localhost:3000';

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/parse', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });

    const parsed = await parseFreeTextToQuery(text);
    return res.json({ parsed });
  } catch (err) {
    console.error('parse error', err);
    return res.status(500).json({ error: err.message || 'parse failed' });
  }
});

app.post('/match', async (req, res) => {
  try {
    let query = req.body;

    if (query.text) {
      // use LangChain parser
      const parsed = await parseFreeTextToQuery(query.text);
      query = parsed;
    }

    if (!query.origin || !query.destination) {
      return res.status(400).json({ error: 'origin and destination required' });
    }

    // build search URL for your web app's /api/rides/search
    const searchUrl = new URL('/api/rides/search', WEB_APP_URL);
    if (query.origin) searchUrl.searchParams.append('from', query.origin);
    if (query.destination) searchUrl.searchParams.append('to', query.destination);
    if (query.earliestDepartureISO) searchUrl.searchParams.append('earliest', query.earliestDepartureISO);
    if (query.latestDepartureISO) searchUrl.searchParams.append('latest', query.latestDepartureISO);
    if (query.radiusKm) searchUrl.searchParams.append('radius', String(query.radiusKm));

    const searchResp = await axios.get(searchUrl.toString());
    const candidates = searchResp.data.rides || [];

    if (!candidates.length) {
      return res.json({ results: [], explanation: 'No candidate rides found by baseline search.' });
    }

    const userCoords = (query.originLat && query.originLng) ? { lat: query.originLat, lng: query.originLng } : null;

    const scored = candidates.map((ride) => {
      const candidateCoords = (ride.originLat && ride.originLng) ? { lat: ride.originLat, lng: ride.originLng } : null;
      const scoreObj = scoreCandidates({
        userCoords,
        candidateCoords,
        userEarliest: query.earliestDepartureISO,
        userLatest: query.latestDepartureISO,
        userMaxCost: query.maxCost,
        rideTimeISO: ride.departure,
        rideCost: ride.cost || 0
      });
      return { ride, scoreObj };
    });

    scored.sort((a, b) => a.scoreObj.total - b.scoreObj.total);

    const topK = (req.body.topK && Number(req.body.topK)) || 5;
    const results = scored.slice(0, topK).map((s) => ({
      ride: s.ride,
      score: s.scoreObj.total,
      breakdown: s.scoreObj.breakdown
    }));

    return res.json({ results, debugCount: candidates.length });
  } catch (err) {
    console.error(err?.response?.data || err.message || err);
    return res.status(500).json({ error: 'match failed', details: err.message || err });
  }
});

app.listen(PORT, () => {
  console.log(`AI service running on http://localhost:${PORT}`);
});
