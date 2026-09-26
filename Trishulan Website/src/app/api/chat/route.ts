import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { ChatMessage } from '@/types';

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login to access chats.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rfqId = searchParams.get('rfqId');
    const partnerId = searchParams.get('partnerId');

    const db = await readDb();
    let chats = db.chats;

    // Filter to only chats where the user is sender or receiver
    chats = chats.filter(c => c.senderId === user.id || c.receiverId === user.id);

    if (rfqId) {
      chats = chats.filter(c => c.rfqId === rfqId);
    } else if (partnerId) {
      chats = chats.filter(c => c.senderId === partnerId || c.receiverId === partnerId);
    }

    return NextResponse.json({ chats });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login to send messages.' }, { status: 401 });
    }

    const body = await req.json();

    const senderId = user.id;
    const senderName = user.companyName || user.name;

    if (!body.text && !body.attachmentUrl) {
      return NextResponse.json({ error: 'Message text or attachment is required' }, { status: 400 });
    }

    const newMessage: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      senderId,
      senderName,
      receiverId: body.receiverId || 'seller_default',
      receiverName: body.receiverName || 'Verified Supplier',
      rfqId: body.rfqId,
      text: body.text || '',
      attachmentUrl: body.attachmentUrl,
      timestamp: new Date().toISOString(),
    };

    const db = await readDb();
    db.chats.push(newMessage);
    await writeDb(db);

    return NextResponse.json({ success: true, message: newMessage });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to send message' }, { status: 500 });
  }
}
