import React, { useState } from "react";
import { useAuth } from "../AuthProvider";
import RecipeDropdown from "../components/RecipeDropdown";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NewRecipeModal from "../components/NewRecipeModal"
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

const Recipes = () => {
    const queryClient = new QueryClient();
    const [username, setUsername] = useState('');
    const [recipeIds, setRecipeIds] = useState([]);
    const { session, user, loading } = useAuth();
    const [recipeModal, setRecipeModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteModalId, setDeleteModalId] = useState(null);

    if (loading) return <div>Loading...</div>;

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
        fetch(`http://localhost:3000/api/users/${uid}/recipes`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => response.json()).then(data => {
            console.log(data)
            setRecipeIds(data);
        });
    }, [accessToken, recipeModal, deleteModal]);

    const handleOpenDeleteModal = (recipeId) => {
        setDeleteModalId(recipeId);
        setDeleteModal(true);
    }

    return (
        <div className="flex flex-col justify-start items-center w-full px-16 gap-2">
            <h1>Recipes Page</h1>
            <h2>Welcome, {username}</h2>
            <button className="cursor-pointer border border-border rounded-2xl bg-primary hover:bg-primary-hv px-2" onClick={() => setRecipeModal(true)}>
                New+
            </button>
            <NewRecipeModal openModal={recipeModal} closeModal={() => setRecipeModal(false)}></NewRecipeModal>
            <DeleteConfirmationModal openModal={deleteModal} closeModal={() => setDeleteModal(false)} recipeId={deleteModalId} recipeName={recipeIds.find(recipe => recipe.id === deleteModalId)?.title} />
            <QueryClientProvider client={queryClient}>
                <div className="w-full flex flex-col gap-4 items-center mb-4">
                    {recipeIds.map((vals) => (
                        <RecipeDropdown key={vals.id} recipeName={vals.title} recipeTags={vals.tags} recipeId={vals.id} openDeleteModal={() => handleOpenDeleteModal(vals.id)} />
                    ))}
                </div>
            </QueryClientProvider>
        </div>
    );
};

export default Recipes;