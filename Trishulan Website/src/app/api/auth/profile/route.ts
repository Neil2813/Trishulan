import { NextResponse } from 'next/server';
import { getSessionUser, updateUserProfileInDb } from '@/lib/auth';

export async function PUT(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login to update profile.' }, { status: 401 });
    }

    const body = await req.json();
    
    const updatedUser = await updateUserProfileInDb(user.id, {
      name: body.name,
      companyName: body.companyName,
      phone: body.phone,
      gstNumber: body.gstNumber,
      industrySector: body.industrySector,
      address: body.address,
      city: body.city,
      state: body.state,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update profile' }, { status: 400 });
  }
}
