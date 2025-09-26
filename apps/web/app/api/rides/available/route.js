import { NextResponse } from 'next/server';
import { prisma } from '@repo/db';
import { verifyToken } from '../../../../lib/auth';

export async function GET(req) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        driver: true
      },
      orderBy: {
        departure: 'asc',
      },
    });

    return NextResponse.json({ rides });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
