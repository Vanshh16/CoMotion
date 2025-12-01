import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@repo/db';
import { signToken } from '../../../../../lib/auth';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    console.log('Driver login attempt:', { email, password });
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const driver = await prisma.driver.findUnique({ where: { email } });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // const passwordMatch = await bcrypt.compare(password, driver.password);
const passwordMatch = password === driver.password;
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ id: driver.id, role: 'driver' });

    const response = NextResponse.json({ message: 'Login successful (Driver)' });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
