
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Module from '@/models/Module';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/models/User';

export async function POST(req, { params }) {
    try {
        const { id } = await params;
        const moduleId = id;
        const { questions } = await req.json();

        // Admin Auth
        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Admin only' }, { status: 403 });
        }

        await dbConnect();

        const updatedModule = await Module.findByIdAndUpdate(moduleId, {
            unitQuiz: { questions }
        }, { new: true });

        if (!updatedModule) {
            return NextResponse.json({ error: 'Module not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, module: updatedModule });

    } catch (error) {
        console.error('Quiz Create Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
