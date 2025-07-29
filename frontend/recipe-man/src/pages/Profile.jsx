import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';
import supabase from '../components/SupabaseClient';
import UserElementDisplay from '../components/UserElementDisplay';

const Profile = () => {
    const [username, setUsername] = useState('');
    const [tab, setTab] = useState(0);
    const [tags, setTags] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [units, setUnits] = useState([]);
    const { session, user, loading } = useAuth();
    if (loading) {
        return <div className="text-content p-4">Loading...</div>;
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
        fetch(`http://localhost:3000/api/users/${uid}/tags/custom`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => response.json()).then(data => {
            console.log(data)
            setTags(data);
        });
        fetch(`http://localhost:3000/api/users/${uid}/ingredients/custom`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => response.json()).then(data => {
            setIngredients(data);
        });
        fetch(`http://localhost:3000/api/users/${uid}/units/custom`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => response.json()).then(data => {
            setUnits(data);
        });
    }, [accessToken]);

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
    }

    return (
        <div className="flex flex-col justify-start items-center w-full">
            <div className="grid gap-9 justify-center border border-border shadow-lg bg-surface p-6 rounded-md max-w-md">
                <h1 className="text-2xl w-full">Profile</h1>
                <p className="text-content">This is your profile page, {username}</p>
            </div>
            <div className="w-full flex justify-center items-end max-w-1/2">
                <div className="border-b-2 border-border w-full"></div>
                <h2
                    className={"text-xl text-content mt-4 border-border border-t-2 border-r-2 border-l-2 px-2 cursor-pointer" + (tab === 0 ? " pb-0.5 bg-surface font-semibold text-primary" : " border-b-2 text-content")}
                    onClick={() => setTab(0)}
                >
                    Tags
                </h2>
                <h2
                    className={"text-xl mt-4 border-border border-t-2 px-2 cursor-pointer" + (tab === 1 ? " pb-0.5 bg-surface font-semibold text-primary" : " border-b-2 text-content")}
                    onClick={() => setTab(1)}
                >
                    Ingredients
                </h2>
                <h2
                    className={"text-xl text-content mt-4 border-border border-t-2 border-r-2 border-l-2 px-2 cursor-pointer" + (tab === 2 ? " pb-0.5 bg-surface font-semibold text-primary" : " border-b-2 text-content")}
                    onClick={() => setTab(2)}
                >
                    Units
                </h2>
                <div className="border-b-2 border-border w-full"></div>
            </div>
            <div className="w-full max-h-dvh overflow-auto bg-surface max-w-1/2 border-b-2 border-r-2 border-l-2 border-border rounded-b-md">
                {tab === 0 && tags.map((tag, ind) => {
                    return (
                        <UserElementDisplay
                            key={tag.id}
                            element={tag}
                            borderStyle={ind < tags.length - 1 ? "border-b-2 border-border" : ""}
                        />
                    )
                })}
                {tab === 1 && ingredients.map((ingredient, ind) => {
                    return (
                        <UserElementDisplay
                            key={ingredient.id}
                            element={ingredient}
                            borderStyle={ind < ingredients.length - 1 ? "border-b-2 border-border" : ""}
                        />
                    )
                })}
                {tab === 2 && units.map((unit, ind) => {
                    return (
                        <UserElementDisplay
                            key={unit.id}
                            element={unit}
                            borderStyle={ind < units.length - 1 ? "border-b-2 border-border" : ""}
                        />
                    )
                })}
            </div>
            <button className="text-content bg-red-700 hover:bg-red-800 font-semibold py-2 px-4 rounded-md mt-4" onClick={() => {
                handleSignOut()
            }}>
                Sign Out
            </button>
        </div>
    );
}

export default Profile;