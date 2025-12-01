function parsePrompt(userText) {
  // instruct the model to output strict JSON
  return `
Extract structured search parameters from the user's request. Output ONLY a JSON object with fields:
- origin (string)
- destination (string)
- earliestDepartureISO (ISO datetime string) OR null
- latestDepartureISO (ISO datetime string) OR null
- originLat (number) and originLng (number) if the user gives coordinates, else omit
- maxCost (number) optional, else omit
- radiusKm (number) optional (search radius around origin)

Examples:

User: "I need a ride from Hostel Gate to City Mall around 8pm tonight under 100 rupees"
Output JSON:
{
  "origin": "Hostel Gate",
  "destination": "City Mall",
  "earliestDepartureISO": "2025-09-27T19:30:00.000Z",
  "latestDepartureISO": "2025-09-27T20:30:00.000Z",
  "maxCost": 100,
  "radiusKm": 3
}

User: "${userText}"
Output JSON:
  `;
}

module.exports = { parsePrompt };
