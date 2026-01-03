
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Module from '@/models/Module';

export async function POST(req, { params }) {
    // Unwrap params for Next.js 15+
    const unwrapParams = await params;
    const { id } = unwrapParams; // Module ID

    try {
        await dbConnect();
        const data = await req.json();

        // Data Validation (Basic)
        if (!data.questions || !Array.isArray(data.questions)) {
            return NextResponse.json({ error: 'Invalid format. Questions array required.' }, { status: 400 });
        }

        const updatedModule = await Module.findByIdAndUpdate(
            id,
            {
                preAssessment: {
                    questions: data.questions,
                    passingPercentage: data.passingPercentage || 60
                }
            },
            { new: true }
        );

        if (!updatedModule) {
            return NextResponse.json({ error: 'Module not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, module: updatedModule });

    } catch (error) {
        console.error('Pre-Assessment Update Error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
