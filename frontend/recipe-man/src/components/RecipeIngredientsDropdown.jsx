import { useState } from "react"
import { useAuth } from "../AuthProvider";
import { useQuery } from '@tanstack/react-query';

const RecipeIngredientsDropdown = ({ recipeTitle, recipeId, isLast, addToIncoming, removeFromIncoming }) => {
    const [isOpen, setIsOpen] = useState(false)
    const { session, user } = useAuth();

    const accessToken = session?.access_token;
    const uid = user?.id;

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['recipeData', recipeId],
        queryFn: () => fetch(`http://localhost:3000/api/users/${uid}/recipes/${recipeId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(res => res.json()),
        enabled: isOpen,
        staleTime: Infinity,
        cacheTime: Infinity,
    });
    if (isLoading) {
        return (
            <div
                className={"w-full border-border flex  px-1 pb-1 pt-1 hover:bg-fields cursor-pointer " + (!isLast ? " border-b-2" : "")}>
                <p>{recipeTitle}</p>
            </div>
        )
    }
    const toggleOpen = () => {
        if (isOpen) {
            console.log('bar')
            removeFromIncoming(data.ingredients)
            // data.ingredients.forEach((ing) => {
            //     removeFromIncoming(ing)
            // })
        }
        setIsOpen(!isOpen)
    }
    const handleCheck = (isChecked, ingredient) => {
        isChecked ? addToIncoming(ingredient) : removeFromIncoming([ingredient])
    }
    return (
        <div
            className={"flex-col w-full border-border flex px-1 pb-1 pt-1 " + (!isLast ? " border-b-2" : "")}

        >
            <p className="w-full hover:bg-fields cursor-pointer" onClick={toggleOpen}>{recipeTitle}</p>
            {isOpen && <div>
                {data.ingredients.map((ingredient) => (
                    <div key={ingredient.ingredient_id} className="text-content bg-surface">
                        <label className="pl-2 flex items-center gap-2"><input id={ingredient.name} className="accent-primary cursor-pointer" type="checkbox" onChange={(e) => { handleCheck(e.target.checked, ingredient) }} />{ingredient.measurement_qty} {ingredient.unit} {ingredient.name}</label>
                    </div>
                ))}
            </div>}


        </div>
    )
}

export default RecipeIngredientsDropdown