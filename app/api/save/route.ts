import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
    }

    await sql`
      INSERT INTO writings (content, created_at, updated_at)
      VALUES (${content}, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE 
      SET content = ${content}, updated_at = NOW()
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}