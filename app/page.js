
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token) {
    redirect('/login');
  } else {
    redirect('/dashboard');
  }

  // content becomes unreachable but keeping structure valid if we ever want a landing page
  return null;
}
