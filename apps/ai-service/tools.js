import { z } from 'zod';
import { DynamicTool } from 'langchain/tools';
import { prisma } from '@repo/db'; // Import your shared Prisma client
import { haversineDistance } from './utils.js';

/**
 * --- TOOL 1: Database Search (Rule-Based) ---
 * Searches the SQL database for rides matching specific criteria.
 */
export const dbSearchTool = new DynamicTool({
  name: 'database_search',
  description:
    'Searches the ride database for candidates. Use this for specific, filtered queries. Always use ISO 8601 for dates.',
  schema: z.object({
    earliestDepartureISO: z
      .string()
      .datetime()
      .optional()
      .describe('The earliest departure time in ISO 8601 format.'),
    latestDepartureISO: z
      .string()
      .datetime()
      .optional()
      .describe('The latest departure time in ISO 8601 format.'),
    maxCost: z.number().optional().describe('The maximum cost.'),
    originText: z.string().optional().describe('Text to search for in origin.'),
    destText: z
      .string()
      .optional()
      .describe('Text to search for in destination.'),
  }),
  func: async ({
    earliestDepartureISO,
    latestDepartureISO,
    maxCost,
    originText,
    destText,
  }) => {
    try {
      const whereClause = {
        status: 'SCHEDULED', // Changed from 'active' to 'SCHEDULED' to match RideStatus enum
        seats: { gt: 0 }, // Only find rides with available seats
      };

      if (earliestDepartureISO) {
        whereClause.departure = { ...whereClause.departure, gte: new Date(earliestDepartureISO) };
      }
      if (latestDepartureISO) {
        whereClause.departure = { ...whereClause.departure, lte: new Date(latestDepartureISO) };
      }
      if (maxCost) {
        whereClause.cost = { lte: maxCost };
      }
      if (originText) {
        // Using 'contains' for a simple text search. 'search' is for full-text.
        whereClause.origin = { contains: originText, mode: 'insensitive' };
      }
      if (destText) {
        whereClause.destination = { contains: destText, mode: 'insensitive' };
      }

      console.log('Running DB Search with clause:', whereClause);

      const rides = await prisma.ride.findMany({
        where: whereClause,
        include: { driver: true }, // Include driver info
        take: 25, // Limit results
      });

      console.log(`DB Search found ${rides.length} candidates.`);
      // Return as JSON string as required by agent
      return JSON.stringify(rides);
    } catch (error) {
      console.error('Error in dbSearchTool:', error);
      return JSON.stringify({ error: 'Failed to search database.' });
    }
  },
});

/**
 * --- TOOL 2: Vector Search (Stubbed) ---
 * Searches a vector store for semantically similar rides.
 * We will implement this in Sprint D.
 */
export const vectorSearchTool = new DynamicTool({
  name: 'vector_search',
  description:
    "Searches for rides based on semantic meaning. Use this for vague queries like 'ride to the beach' or 'trip near downtown hotspots'.",
  schema: z.object({
    queryText: z
      .string()
      .describe('The vague or semantic query from the user.'),
  }),
  func: async ({ queryText }) => {
    console.log(`--- STUBBED: Vector search called with: "${queryText}" ---`);
    console.log('--- STUBBED: This tool will be implemented in Sprint D. ---');
    return JSON.stringify([]); // Return empty for now
  },
});

/**
 * --- TOOL 3: Score and Rank Candidates ---
 * Takes a list of rides and the user's query to score and explain them.
 */
export const scoreAndRankTool = new DynamicTool({
  name: 'score_and_rank',
  description:
    'Takes a list of ride candidates and the original parsed query. It scores, ranks, and annotates them. You MUST use this before presenting results to the user.',
  schema: z.object({
    candidates: z
      .array(z.any())
      .describe('The array of ride objects found by search tools.'),
    parsedQuery: z
      .any()
      .describe(
        'The full structured query object from the initial parsing step.'
      ),
  }),
  func: async ({ candidates, parsedQuery }) => {
    console.log(`Scoring ${candidates.length} candidates...`);

    // Check if we have user coordinates for distance scoring
    const hasUserOriginCoords = parsedQuery.originLat && parsedQuery.originLng;
    // Note: If origin is "user current location" without coords, we skip distance scoring
    // This is fine - we can still rank by time and cost

    const scoredResults = candidates.map((ride) => {
      // 1. Distance Score (if possible)
      // Note: Ride schema doesn't have originLat/originLng fields, so distance cannot be calculated
      const hasRideCoords = ride.originLat !== undefined && ride.originLng !== undefined;
      const canCalculateDistance = hasUserOriginCoords && hasRideCoords;

      const distKm = canCalculateDistance
        ? haversineDistance(
          parsedQuery.originLat,
          parsedQuery.originLng,
          ride.originLat,
          ride.originLng
        )
        : 0; // Can't score distance

      // 2. Time Score
      const rideTime = new Date(ride.departure).getTime();
      const earliestTime = parsedQuery.earliestDepartureISO
        ? new Date(parsedQuery.earliestDepartureISO).getTime()
        : rideTime; // No penalty if no preference
      const timeDiffMin = Math.abs(rideTime - earliestTime) / (1000 * 60);

      // 3. Cost Score
      const costDiff = parsedQuery.maxCost
        ? Math.max(0, ride.cost - parsedQuery.maxCost) // Penalty for being over budget
        : 0; // No penalty if no budget

      // Simple Scoring (lower is better)
      // These weights are from your blueprint (step 9)
      const distanceScore = distKm * 2;
      const timeScore = (timeDiffMin / 10) * 1.5;
      const costScore = (costDiff / (parsedQuery.maxCost || 1)) * 3; // Normalize cost penalty

      const totalScore = distanceScore + timeScore + costScore;

      // Build explanation based on available data
      const distanceInfo = canCalculateDistance
        ? `${distKm.toFixed(1)}km away, `
        : '';

      const explanation = `${ride.origin} → ${ride.destination}. Departs ${new Date(ride.departure).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}. ${distanceInfo}$${ride.cost}, ${ride.seats} seats available.`;

      return {
        ride,
        score: totalScore,
        breakdown: { distanceScore, timeScore, costScore, distKm, timeDiffMin },
        explanation,
      };
    });

    // Sort by score (lowest is best)
    const rankedResults = scoredResults.sort((a, b) => a.score - b.score);

    return JSON.stringify(rankedResults);
  },
});

export const allTools = [dbSearchTool, vectorSearchTool, scoreAndRankTool];