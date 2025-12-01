import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { prisma } from '@repo/db';

export async function POST(request) {
    try {
        const { joinRequestId } = await request.json();

        if (!joinRequestId) {
            return NextResponse.json(
                { error: 'Join request ID is required' },
                { status: 400 }
            );
        }

        // Fetch join request with ride and driver details
        const joinRequest = await prisma.joinRequest.findUnique({
            where: { id: joinRequestId },
            include: {
                ride: {
                    include: {
                        driver: true,
                    },
                },
            },
        });

        if (!joinRequest) {
            return NextResponse.json(
                { error: 'Join request not found' },
                { status: 404 }
            );
        }

        const { ride } = joinRequest;
        const { driver } = ride;

        // Check if driver has UPI ID
        if (!driver.upiId) {
            return NextResponse.json(
                { error: 'Driver has not set up UPI payments' },
                { status: 400 }
            );
        }

        // Create UPI payment URL
        // Format: upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&cu=INR&tn=<DESCRIPTION>
        const upiUrl = `upi://pay?pa=${encodeURIComponent(driver.upiId)}&pn=${encodeURIComponent(driver.name)}&am=${ride.cost}&cu=INR&tn=${encodeURIComponent(`CoMotion Ride Payment - ${ride.origin} to ${ride.destination}`)}`;

        // Generate QR code
        const qrCodeDataUrl = await QRCode.toDataURL(upiUrl, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            width: 300,
            margin: 2,
        });

        return NextResponse.json({
            success: true,
            qrCode: qrCodeDataUrl,
            upiId: driver.upiId,
            driverName: driver.name,
            amount: ride.cost,
            rideDetails: {
                origin: ride.origin,
                destination: ride.destination,
                departure: ride.departure,
            },
        });
    } catch (error) {
        console.error('Error generating UPI QR code:', error);
        return NextResponse.json(
            { error: 'Failed to generate QR code' },
            { status: 500 }
        );
    }
}
