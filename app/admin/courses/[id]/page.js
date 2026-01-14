
import CourseEditorClient from './CourseEditorClient';



export default async function CourseEditorPage({ params }) {
    // Await params for Next.js 15+
    const resolvedParams = await params;
    const { id } = resolvedParams;

    return <CourseEditorClient id={id} />;
}
