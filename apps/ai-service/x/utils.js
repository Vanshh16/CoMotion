// simple haversine distance in km
function haversineDistanceKm(a, b) {
  if (!a || !b) return null;
  const toRad = (deg) => (deg * Math.PI) / 180.0;
  const R = 6371; // km
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const hav = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav));
  return R * c;
}

// scoring function combines distance, time diff, cost diff
function scoreCandidates({ userCoords, candidateCoords, userEarliest, userLatest, userMaxCost, rideTimeISO, rideCost }) {
  const breakdown = {};
  let total = 0;

  // distance score (km) scaled: smaller is better
  if (userCoords && candidateCoords) {
    const d = haversineDistanceKm(userCoords, candidateCoords);
    const distScore = d; // 1 point per km
    breakdown.distanceKm = d;
    breakdown.distanceScore = distScore;
    total += distScore * 2; // weight distance 2
  } else {
    breakdown.distanceKm = null;
    breakdown.distanceScore = 0;
  }

  // time difference score (minutes)
  if (userEarliest || userLatest) {
    const rideTime = new Date(rideTimeISO).getTime();
    let userCenter = null;
    if (userEarliest && userLatest) {
      userCenter = (new Date(userEarliest).getTime() + new Date(userLatest).getTime()) / 2;
    } else if (userEarliest) {
      userCenter = new Date(userEarliest).getTime();
    } else if (userLatest) {
      userCenter = new Date(userLatest).getTime();
    }
    if (userCenter) {
      const diffMin = Math.abs(rideTime - userCenter) / (1000 * 60);
      breakdown.timeDiffMin = diffMin;
      const timeScore = diffMin / 10.0; // 1 point per 10 minutes
      breakdown.timeScore = timeScore;
      total += timeScore * 1.5;
    } else {
      breakdown.timeDiffMin = null;
      breakdown.timeScore = 0;
    }
  }

  // cost score
  if (userMaxCost && rideCost != null) {
    const over = Math.max(0, rideCost - userMaxCost); // penalty if ride is over budget
    breakdown.cost = rideCost;
    breakdown.overBudget = over;
    const costScore = over / Math.max(1, userMaxCost); // fraction over budget
    breakdown.costScore = costScore;
    total += costScore * 3.0; // weight strongly
  } else {
    breakdown.cost = rideCost;
    breakdown.costScore = 0;
  }

  // smaller total = better, so return total
  return { total, breakdown };
}

module.exports = { haversineDistanceKm, scoreCandidates };
