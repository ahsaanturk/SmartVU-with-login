
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import { cookies } from 'next/headers';

export async function GET(req) {
    try {
        await dbConnect();

        // Optional search/filter
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');

        const query = type ? { type } : {};

        const content = await Content.find(query).sort({ createdAt: -1 });

        return NextResponse.json({ content });
    } catch (error) {
        return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        // Simple Auth Check (MVP: Is Logged In?)
        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // In real app, we would verify JWT to check user.role === 'admin'

        const body = await req.json();
        await dbConnect();

        await Content.create(body);

        return NextResponse.json({ message: 'Content created' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
