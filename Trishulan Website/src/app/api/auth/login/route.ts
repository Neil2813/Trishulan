import { NextResponse } from 'next/server';
import { verifyUserCredentials, createUserInDb, findUserByEmail } from '@/lib/auth';
import { signJwtToken } from '@/lib/security';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Firebase Auth Handler
    if (body.authProvider === 'FIREBASE') {
      let user = await findUserByEmail(body.email);
      if (!user) {
        user = await createUserInDb({
          name: body.name || body.email.split('@')[0],
          email: body.email,
          role: body.role || 'BUYER',
          authProvider: 'FIREBASE',
          companyName: body.companyName,
          phone: body.phone,
        });
      }

      const token = signJwtToken({ id: user.id, email: user.email, role: user.role });
      const response = NextResponse.json({ success: true, user });
      response.cookies.set('trishulan_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    // Standard JWT Password Login Handler
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await verifyUserCredentials(email, password);
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = signJwtToken({ id: user.id, email: user.email, role: user.role });
    const response = NextResponse.json({ success: true, user });
    response.cookies.set('trishulan_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Login failed' }, { status: 500 });
  }
}
