
import EditContentClient from './EditContentClient';

export default async function EditContentPage({ params }) {
    const { id } = await params;
    return <EditContentClient id={id} />;
}
