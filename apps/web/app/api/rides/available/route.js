import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { verifyToken } from "../../../../lib/auth";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Get IDs of rides the user already requested (to exclude)
    const existingRequests = await prisma.joinRequest.findMany({
      where: {
        userId: decoded.id,
      },
      select: {
        rideId: true,
      },
    });

    const excludedRideIds = existingRequests.map((req) => req.rideId);

    const rides = await prisma.ride.findMany({
      where: {
        status: "SCHEDULED",
        departure: {
          gt: now,
        },
        seats: {
          gt: 0,
        },
        id: {
          notIn: excludedRideIds,
        },
      },
      include: {
        driver: true,
        joinRequests: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        departure: "asc",
      },
    });

    // Build alteredRides array with users from joinRequests
    let alteredRides = [];
    for (let index = 0; index < rides.length; index++) {
      const ride = rides[index];
      const users = ride.joinRequests.map(jr => jr.user);
      alteredRides.push({ ride, user: users });
    }

    return NextResponse.json({ rides, alteredRides });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
