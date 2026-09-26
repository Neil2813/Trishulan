import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: "Welcome to Trishulan API",
    status: "success",
    timestamp: new Date().toISOString()
  });
}
