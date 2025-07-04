import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';
import supabase from '../components/SupabaseClient';

const Profile = () => {
    const [username, setUsername] = useState('');
    const { session, user, loading } = useAuth();
    if (loading) {
        return <div className="text-white p-4">Loading...</div>;
    }

    const accessToken = session?.access_token;
    const uid = user?.id;

    React.useEffect(() => {
        fetch(`http://localhost:3000/api/users/${uid}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => response.json()).then(data => {
            setUsername(data.username);
        });
    }, [accessToken]);

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
    }

    return (
        <div className="flex flex-col justify-start items-center">
            <div className="grid gap-9 justify-center border border-gray-600 shadow-lg bg-gray-800 p-6 rounded-md max-w-md">
                <h1 className="text-2xl w-full">Profile</h1>
                <p className="text-white">This is your profile page, {username}</p>
            </div>
            <button className="text-white bg-red-700 hover:bg-red-800 font-semibold py-2 px-4 rounded-md mt-4" onClick={() => {
                handleSignOut()
            }}>
                Sign Out
            </button>
        </div>
    );
}

export default Profile;