import { useState } from "react"
import { useAuth } from "../AuthProvider";
import { useQuery } from '@tanstack/react-query';
const API_BASE = import.meta.env.VITE_API_BASE || '';

const RecipeIngredientsDropdown = ({ recipeTitle, recipeId, isLast, addToIncoming, removeFromIncoming }) => {
    const [isOpen, setIsOpen] = useState(false)
    const { session, user } = useAuth();
    const [checkedArray, setCheckedArray] = useState([])

    const accessToken = session?.access_token;
    const uid = user?.id;

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['recipeData', recipeId],
        queryFn: () => fetch(`${API_BASE}/api/users/${uid}/recipes/${recipeId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(async res => {
            const resJson = await res.json();
            setCheckedArray(Array(resJson.ingredients.length).fill(false));
            return resJson;

        }),
        enabled: true,
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
        setIsOpen(!isOpen)
    }
    const handleCheck = (isChecked, ingredient, ind) => {
        if (isChecked) {
            addToIncoming([ingredient])
            setCheckedArray(checkedArray.with(ind, true))
        } else {
            removeFromIncoming([ingredient])
            setCheckedArray(checkedArray.with(ind, false))
        }
    }
    const handleMasterCheck = (isChecked) => {
        if (isChecked) {
            setIsOpen(true)
            addToIncoming(data.ingredients)
            setCheckedArray(Array(data.ingredients.length).fill(true));

        } else {
            removeFromIncoming(data.ingredients)
            setCheckedArray(Array(data.ingredients.length).fill(false));
        }
    }
    return (
        <div className={"flex-col w-full border-border flex px-1 pb-1 pt-1 " + (!isLast ? " border-b-2" : "")}>
            <div className="flex w-full gap-2 hover:bg-fields">
                <label className="pl-2 flex items-center gap-2"><input id={recipeTitle} className="accent-primary cursor-pointer" type="checkbox" checked={checkedArray.includes(true)} onChange={(e) => { handleMasterCheck(e.target.checked) }} /></label>
                <div className="flex w-full  cursor-pointer" onClick={toggleOpen}>
                    <p>{recipeTitle}</p>
                    <div className="ml-auto flex-shrink-0 content-center">
                        {isOpen ? (<svg xmlns="http://www.w3.org/2000/svg" width="25" height="20" fill="var(--color-primary)" className="bi bi-caret-up-fill" viewBox="0 0 16 16">
                            <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
                        </svg>) : (<svg xmlns="http://www.w3.org/2000/svg" width="25" height="20" fill="var(--color-primary)" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
                            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                        </svg>)}
                    </div>
                </div>
            </div>
            {isOpen && <div>
                {data.ingredients.map((ingredient, ind) => (
                    <div key={ingredient.ingredient_id} className="text-content bg-surface">
                        <label className="pl-2 flex items-center gap-2"><input id={ingredient.name} className="accent-primary cursor-pointer" type="checkbox" checked={checkedArray[ind]} onChange={(e) => { handleCheck(e.target.checked, ingredient, ind) }} />{ingredient.measurement_qty} {ingredient.unit} {ingredient.name}</label>
                    </div>
                ))}
            </div>}

        </div>
    )
}

export default RecipeIngredientsDropdown