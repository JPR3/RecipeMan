import { useState } from "react";
import { useAuth } from "../AuthProvider"
import Modal from "./Modal";
import RecipeIngredientsDropdown from "./RecipeIngredientsDropdown";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const RecipeSelectionModal = ({ openModal, closeModal, recipes, createListIngredient }) => {
    const { session, user } = useAuth();
    const queryClient = new QueryClient();
    const [incomingIngredients, setIncomingIngredients] = useState([])

    const handleSubmit = () => {
        const promises = Promise.all(incomingIngredients.map((ing) => createListIngredient({ ...ing, name_id: ing.ingredient_id, list_item_tags: [], global_tags: ing.tags })))
        promises.then(res => {
            closeRecipeModal()
        })
    }
    const closeRecipeModal = () => {
        setIncomingIngredients([])
        closeModal()
    }
    const addToIncoming = (newIngs) => {
        setIncomingIngredients([...incomingIngredients, ...newIngs])
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
                    {incomingIngredients.length > 0 ? `Add ${incomingIngredients.length} Ingredients to List` : "Select Ingredients"}
                </button>
            </div>
        </Modal>
    )
}


export default RecipeSelectionModal;