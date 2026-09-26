import { NextResponse } from 'next/server';
import { registerSchema, signJwtToken } from '@/lib/security';
import { createUserInDb, findUserByEmail } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    const existing = await findUserByEmail(validated.email);
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const user = await createUserInDb({
      name: validated.name,
      email: validated.email,
      password: validated.password,
      role: validated.role,
      authProvider: 'JWT',
      companyName: validated.companyName,
      phone: validated.phone,
      gstNumber: validated.gstNumber,
      industrySector: validated.industrySector,
      address: validated.address,
      city: validated.city,
      state: validated.state,
      verifiedSeller: validated.role === 'SELLER',
    });

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
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 400 });
  }
}
