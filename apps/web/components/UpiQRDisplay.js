'use client';

import { useState, useEffect } from 'react';
import { Copy, CheckCircle2, Loader2 } from 'lucide-react';

export default function UpiQRDisplay({ joinRequestId }) {
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchQRCode();
    }, [joinRequestId]);

    const fetchQRCode = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/payment/upi-qr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ joinRequestId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate QR code');
            }

            const data = await response.json();
            setQrData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyUpiId = () => {
        if (qrData?.upiId) {
            navigator.clipboard.writeText(qrData.upiId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 bg-white rounded-lg shadow-md">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Generating payment QR code...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-medium">⚠️ {error}</p>
                <p className="text-red-600 text-sm mt-2">
                    The driver may not have set up UPI payments yet.
                </p>
            </div>
        );
    }

    if (!qrData) return null;

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-lg border border-blue-100">
            <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    💳 Payment Required
                </h3>
                <p className="text-gray-600">
                    Scan QR code or copy UPI ID to make payment
                </p>
            </div>

            {/* QR Code */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-4 mx-auto w-fit">
                <img
                    src={qrData.qrCode}
                    alt="UPI QR Code"
                    className="w-64 h-64 mx-auto"
                />
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-lg p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <p className="text-sm text-gray-500 font-medium">Driver</p>
                        <p className="text-lg font-semibold text-gray-800">{qrData.driverName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 font-medium">Amount</p>
                        <p className="text-2xl font-bold text-green-600">₹{qrData.amount}</p>
                    </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-500 font-medium mb-2">UPI ID</p>
                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                        <code className="flex-1 text-sm font-mono text-gray-700">
                            {qrData.upiId}
                        </code>
                        <button
                            onClick={copyUpiId}
                            className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                            title="Copy UPI ID"
                        >
                            {copied ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                                <Copy className="w-5 h-5 text-gray-600" />
                            )}
                        </button>
                    </div>
                    {copied && (
                        <p className="text-xs text-green-600 mt-1">✓ UPI ID copied!</p>
                    )}
                </div>

                <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-500 font-medium mb-2">Ride Details</p>
                    <div className="text-sm space-y-1">
                        <p>
                            <span className="text-gray-600">From:</span>{' '}
                            <span className="font-medium text-gray-800">
                                {qrData.rideDetails.origin}
                            </span>
                        </p>
                        <p>
                            <span className="text-gray-600">To:</span>{' '}
                            <span className="font-medium text-gray-800">
                                {qrData.rideDetails.destination}
                            </span>
                        </p>
                        <p>
                            <span className="text-gray-600">Departure:</span>{' '}
                            <span className="font-medium text-gray-800">
                                {new Date(qrData.rideDetails.departure).toLocaleString()}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800 text-center">
                    📱 Open any UPI app (PhonePe, Google Pay, Paytm) and scan the QR code to pay
                </p>
            </div>
        </div>
    );
}
