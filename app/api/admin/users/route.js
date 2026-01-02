
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('q') || '';

        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        return NextResponse.json({ users });
    } catch (error) {
        return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();

        // Basic Check
        if (!body.email || !body.password || !body.name) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(body.password, 10);
        const user = await User.create({ ...body, password: hashedPassword });

        return NextResponse.json({ user }, { status: 201 });
    } catch (error) {
        if (error.code === 11000) return NextResponse.json({ error: 'Email exists' }, { status: 400 });
        return NextResponse.json({ error: 'Create failed' }, { status: 500 });
    }
}
