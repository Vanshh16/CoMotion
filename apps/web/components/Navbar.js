'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import JoinRequestsPanel from './JoinRequestsPanel';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Navbar() {
  const [role, setRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Try to decode the JWT from cookie (if exists)
    async function getRole() {
      try {
        const res = await fetch('/api/auth/me'); // You can implement this endpoint to return { role }
        const data = await res.json();
        if (res.ok) setRole(data.role);
      } catch (err) {
        setRole(null);
      }
    }

    getRole();
  }, []);

  const handleLogout = async () => {
    console.log("XXXX");
    
    const response = await axios.post('/api/auth/logout');
    if (response.status === 200) {
      
      setRole(null);
      
      router.push('/'); // Redirect to home page
    } else {
      console.error('Logout failed');
    }
  };

  return (
  <nav className="w-full bg-white border-b border-gray-200 shadow-sm">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      
      {/* Logo */}
      <Link
        href="/"
        className="text-3xl font-extrabold text-blue-700 tracking-tight hover:opacity-90 transition duration-200"
      >
        RidePool
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center space-x-6 text-base font-medium text-gray-800">
        {role === 'user' && (
          <>
            <Link
              href="/dashboard/u"
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/u/my-rides"
              className="hover:text-blue-600 transition-colors duration-200"
            >
              My Rides
            </Link>
          </>
        )}

        {role === 'driver' && (
          <>
            <Link
              href="/dashboard/d"
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/d/requests"
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Join Requests
            </Link>
          </>
        )}

        {/* Auth Buttons */}
        {role ? (
          <button
            onClick={handleLogout}
            className="ml-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition duration-200"
          >
            Logout
          </button>
        ) : (
          <div className="flex gap-4 ml-4">
            <Link
              href="/auth/user/login"
              className="px-6 py-3 rounded-lg border border-blue-600 text-blue-600 font-semibold hover:bg-blue-100 active:scale-95 transition-all duration-200 shadow-md"
            >
              User Login
            </Link>
            <Link
              href="/auth/driver/login"
              className="px-6 py-3 rounded-lg border border-blue-600 text-blue-600 font-semibold hover:bg-blue-100 active:scale-95 transition-all duration-200 shadow-md"
            >
              Driver Login
            </Link>
          </div>
        )}
      </div>
    </div>
  </nav>
);


}
