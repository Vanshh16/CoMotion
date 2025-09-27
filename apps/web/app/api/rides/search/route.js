import { NextResponse } from 'next/server';
import { prisma } from '@repo/db';

export async function GET(req) {
    
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from')?.toLowerCase();
  const to = searchParams.get('to')?.toLowerCase();

  if (!from || !to) {
    return NextResponse.json({ error: 'Missing enteries' }, { status: 400 });
  }

  const rides = await prisma.ride.findMany({
    where: {
      origin: { contains: from, mode: 'insensitive' },
      destination: { contains: to, mode: 'insensitive' },
      seats: { gt: 0 },
      departure: { gt: new Date() },
      status: 'SCHEDULED'
    },
     include: {
        driver: true,
      },
    orderBy: { departure: 'asc' }
  });

  return NextResponse.json({ rides }, {status: 200});
}
