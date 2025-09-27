import { NextResponse } from 'next/server';
import { prisma } from '@repo/db';
import { verifyToken } from '../../../../lib/auth';

export async function GET(req) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'user') {
      return NextResponse.json({ error: 'Forbidden: Users only' }, { status: 403 });
    }


    const joinedRides = await prisma.joinRequest.findMany({
    where: { 
      userId: decoded.id,
      status: 'REJECTED'
     },
    include: {
      ride: {
        include: {
          driver: true
        }
      },
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

    return NextResponse.json({ joinedRides }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
