'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import UpiQRDisplay from './UpiQRDisplay';

export default function UserJoinRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserRequests();
    }, []);

    const fetchUserRequests = async () => {
        try {
            const response = await axios.get('/api/user/requests');
            if (response.status === 200) {
                setRequests(response.data.requests || []);
            }
        } catch (error) {
            console.error('Error fetching user requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            APPROVED: 'bg-green-100 text-green-800 border-green-300',
            REJECTED: 'bg-red-100 text-red-800 border-red-300',
        };

        const icons = {
            PENDING: '⏳',
            APPROVED: '✅',
            REJECTED: '❌',
        };

        return (
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${styles[status]}`}>
                {icons[status]} {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="mt-7 px-6 lg:px-12">
            <h2 className="text-3xl font-extrabold text-center text-blue-800 mb-16 tracking-tight">
                My Ride Requests
            </h2>

            {requests.length === 0 ? (
                <div className="text-center text-lg text-gray-500 italic bg-gray-50 py-12 rounded-xl">
                    <p>You haven't requested any rides yet.</p>
                    <p className="text-sm mt-2">Browse available rides to get started!</p>
                </div>
            ) : (
                <div className="grid gap-8 lg:grid-cols-2">
                    {requests.map((req) => (
                        <div
                            key={req.id}
                            className="bg-gradient-to-br from-white via-blue-20 to-blue-50 border border-blue-200 rounded-3xl p-8 shadow-xl"
                        >
                            {/* Status Badge */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="inline-block text-xs font-medium uppercase tracking-wide bg-blue-600 text-white px-3 py-1 rounded-full shadow-sm">
                                    Ride Request
                                </div>
                                {getStatusBadge(req.status)}
                            </div>

                            {/* Route */}
                            <h3 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                                {req.ride.origin}
                                <span className="text-gray-400 text-xl">→</span>
                                {req.ride.destination}
                            </h3>

                            {/* Ride Details */}
                            <div className="text-gray-700 space-y-2 mb-6">
                                <p>
                                    🚗 <span className="font-semibold">Driver:</span>{' '}
                                    <span className="text-gray-900">{req.ride.driver.name}</span>
                                </p>
                                <p>
                                    🕒 <span className="font-semibold">Departure:</span>{' '}
                                    {new Date(req.ride.departure).toLocaleString()}
                                </p>
                                <p>
                                    💰 <span className="font-semibold">Cost:</span>{' '}
                                    <span className="text-green-600 font-bold">₹{req.ride.cost}</span>
                                </p>
                                <p>
                                    📅 <span className="font-semibold">Requested:</span>{' '}
                                    {new Date(req.createdAt).toLocaleString()}
                                </p>
                            </div>

                            {/* Conditional Display Based on Status */}
                            {req.status === 'PENDING' && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                                    <p className="text-yellow-800 font-medium">⏳ Waiting for driver approval...</p>
                                    <p className="text-yellow-700 text-sm mt-1">You'll be notified once the driver responds</p>
                                </div>
                            )}

                            {req.status === 'APPROVED' && (
                                <div className="mt-6">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-center">
                                        <p className="text-green-800 font-bold text-lg">🎉 Request Approved!</p>
                                        <p className="text-green-700 text-sm mt-1">Please complete payment to confirm your seat</p>
                                    </div>
                                    <UpiQRDisplay joinRequestId={req.id} />
                                </div>
                            )}

                            {req.status === 'REJECTED' && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                    <p className="text-red-800 font-medium">❌ Request was declined</p>
                                    <p className="text-red-700 text-sm mt-1">Try requesting a different ride</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
