import React, { useState } from "react";
import supabase from "../components/SupabaseClient";
import { useAuth } from "../AuthProvider";
import RecipeDropdown from "../components/RecipeDropdown";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const Recipes = () => {
    const queryClient = new QueryClient();
    const [username, setUsername] = useState('');
    const [recipeIds, setRecipeIds] = useState([]);
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
        fetch(`http://localhost:3000/api/users/${uid}/recipes`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => response.json()).then(data => {
            console.log(data);
            setRecipeIds(data);
        });
    }, [accessToken]);

    return (
        <div className="flex flex-col justify-start items-center w-full px-16">
            <h1>Recipes Page</h1>
            <h2>Welcome, {username}</h2>
            <QueryClientProvider client={queryClient}>
                <div className="w-full flex flex-col gap-4">
                    {recipeIds.map((vals) => (
                        <RecipeDropdown key={vals.id} recipeName={vals.title} recipeTags={vals.tags} recipeId={vals.id} />
                    ))}
                </div>

            </QueryClientProvider>

        </div>
    );
};

export default Recipes;