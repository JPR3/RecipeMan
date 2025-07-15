import React, { useState } from "react";
import supabase from "../components/SupabaseClient";
import { useAuth } from "../AuthProvider";
import RecipeDropdown from "../components/RecipeDropdown";

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
        <div className="flex flex-col justify-start items-center w-full px-16">
            <h1>Recipes Page</h1>
            <h2>Welcome, {username}</h2>
            <RecipeDropdown recipeName="MyRecipe" recipeTags={[{ id: 1, "name": "tag1" }, { id: 2, "name": "tag2" }]} recipeIngredients={[{ id: 1, name: "ingredient1" }, { id: 2, name: "ingredient2" }]} recipeCookTime="00:30:00" recipeInstructions={[{ step: 1, instruction: "Mix ingredients." }, { step: 2, instruction: "Cook for 30 minutes." }]} recipeNotes="Serve hot." />
        </div>
    );
};

export default Recipes;