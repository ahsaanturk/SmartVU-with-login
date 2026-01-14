
import EditUserClient from './EditUserClient';

export default async function EditUserPage({ params }) {
    const { id } = await params;
    return <EditUserClient id={id} />;
}
