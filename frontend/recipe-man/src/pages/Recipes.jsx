import React, { useState } from "react";
import supabase from "../components/SupabaseClient";
import { useAuth } from "../AuthProvider";

const Recipes = () => {
    const [username, setUsername] = useState('');
    const { session, user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    const accessToken = session?.access_token;
    const uid = user?.id;

    React.useEffect(() => {
        fetch(`http://localhost:3000/api/users/${uid}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => response.json()).then(data => {
            console.log(data);
            setUsername(data.username);
        });
    }, [accessToken]);

    return (
        <div>
            <h1>Recipes Page</h1>
            <h2>Welcome, {username}</h2>
        </div>
    );
};

export default Recipes;