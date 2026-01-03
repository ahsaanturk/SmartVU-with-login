
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Module from '@/models/Module';


export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
    const unwrapParams = await params;
    const { id } = unwrapParams;

    try {
        await dbConnect();
        const module = await Module.findById(id);

        if (!module) {
            return NextResponse.json({ error: 'Module not found' }, { status: 404 });
        }

        return NextResponse.json({ module });
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
