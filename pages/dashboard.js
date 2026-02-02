import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to organizer dashboard for backward compatibility
        router.replace('/organizer-dashboard');
    }, [router]);

    return null;
}
