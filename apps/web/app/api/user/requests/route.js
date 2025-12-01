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

        // Fetch all join requests for this user
        const requests = await prisma.joinRequest.findMany({
            where: {
                userId: decoded.id,
            },
            include: {
                ride: {
                    include: {
                        driver: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ requests }, { status: 200 });
    } catch (error) {
        console.error('Error fetching user requests:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
