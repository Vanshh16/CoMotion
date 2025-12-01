import { NextResponse } from 'next/server';

export async function POST() {
  // Create response with logout message
  const response = NextResponse.json({ message: 'Logged out' }, { status: 200 });

  // Expire the cookie
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    expires: new Date(0), // expired immediately
  });

  return response;
}
