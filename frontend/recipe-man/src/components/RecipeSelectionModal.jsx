import { useState } from "react";
import { useAuth } from "../AuthProvider"
import Modal from "./Modal";
import RecipeIngredientsDropdown from "./RecipeIngredientsDropdown";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const RecipeSelectionModal = ({ openModal, closeModal, recipes, createListIngredient, updateList }) => {
    const { session, user } = useAuth();
    const queryClient = new QueryClient();
    const [incomingIngredients, setIncomingIngredients] = useState([])
    const accessToken = session?.access_token;
    const uid = user?.id;

    const handleSubmit = () => {
        const promises = Promise.all(incomingIngredients.map((ing) => createListIngredient({ ...ing, name_id: ing.ingredient_id })))
        promises.then(res => {
            closeRecipeModal()
        })
    }
    const closeRecipeModal = () => {
        setIncomingIngredients([])
        updateList()
        closeModal()
    }
    const addToIncoming = (newIng) => {
        setIncomingIngredients([...incomingIngredients, newIng])
    }
    const removeFromIncoming = (targetIngs) => {
        setIncomingIngredients(incomingIngredients.filter(item => !targetIngs.includes(item)))

    }
    return (
        <Modal openModal={openModal} closeModal={closeRecipeModal}>
            <div className="flex flex-col items-center gap-2 mb-4">
                <p className="text-2xl font-bold">Select Ingredients:</p>
                <div className="w-full">
                    <QueryClientProvider client={queryClient}>
                        {
                            recipes.map((recipe, index) => (
                                <RecipeIngredientsDropdown
                                    key={index}
                                    recipeTitle={recipe.title}
                                    recipeId={recipe.id}
                                    isLast={index === recipes.length - 1}
                                    addToIncoming={addToIncoming}
                                    removeFromIncoming={removeFromIncoming}
                                />
                            ))
                        }
                    </QueryClientProvider>
                </div>
                <button
                    className={(incomingIngredients.length > 0 ? "bg-primary hover:bg-primary-hv cursor-pointer" : "bg-button cursor-not-allowed") + " text-content border border-border rounded-2xl px-2 mb-2 mt-3"}
                    disabled={incomingIngredients.length === 0}
                    onClick={handleSubmit}>
                    {incomingIngredients.length > 0 ? "Add Ingredients to list" : "Select Ingredients"}
                </button>
            </div>
        </Modal>
    )
}


export default RecipeSelectionModal;