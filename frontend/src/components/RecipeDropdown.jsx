import { useEffect, useState } from 'react';
import { useAuth } from '../AuthProvider';
import TagDisplay from './TagDisplay';
import { useQuery } from '@tanstack/react-query';
const API_BASE = import.meta.env.VITE_API_BASE || '';

const RecipeDropdown = ({ recipeName, recipeTags, recipeId, openDeleteModal, openEditModal, openListModal, refreshTrigger, width }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [scale, setScale] = useState(1);
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const { session, user } = useAuth();

    const accessToken = session?.access_token;
    const uid = user?.id;

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['recipeData', recipeId],
        queryFn: () => fetch(`${API_BASE}/api/users/${uid}/recipes/${recipeId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(res => res.json()),
        enabled: isOpen,
        staleTime: Infinity,
        cacheTime: Infinity,
    });

    useEffect(() => {
        if (!refreshTrigger) {
            refetch();
        }

    }, [refreshTrigger]);

    const closedDiv = (<div onClick={toggleDropdown} className={(isOpen ? "border-t border-r border-l rounded-t-2xl pt-2 pb-2 " : "border rounded-2xl pt-4 pl-4 pb-4 ") + " cursor-pointer w-full bg-surface border-border text-content shadow-lg pl-2 flex"}>
        <p className={"text-content min-w-1/8 " + (isOpen ? "font-bold text-xl w-full text-center pl-[33px] " : "relative ml-2 text-lg")}>
            {recipeName}
        </p>
        {!isOpen && (
            <div className="flex gap-2 ml-4 ">
                <TagDisplay tags={recipeTags} />
            </div>
        )}
        <div className="ml-auto flex-shrink-0 content-center pr-4">
            {isOpen ? (<svg xmlns="http://www.w3.org/2000/svg" width="25" height="20" fill="var(--color-primary)" className="bi bi-caret-up-fill" viewBox="0 0 16 16">
                <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
            </svg>) : (<svg xmlns="http://www.w3.org/2000/svg" width="25" height="20" fill="var(--color-primary)" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
            </svg>)}
        </div>

    </div>)
    if (isLoading) {
        return (<div className="w-full max-w-4xl">
            {closedDiv}
        </div>)
    }
    const processInstructions = (instructions) => {
        return instructions.replace(/\{\{([0-9]*.?[0-9]+)\}\}/g, (match, num) => {
            return num * scale
        }).split(/\r?\n/)
    }
    return (
        <div className="w-full max-w-2xl">
            {closedDiv}
            {isOpen && (
                <div className=" bg-surface border-l border-r border-b border-border rounded-b-2xl shadow-lg p-2 pt-0">
                    <div className="flex justify-center items-center pb-2">
                        <div className="flex gap-2">
                            <TagDisplay tags={recipeTags} />
                        </div>
                    </div>
                    <div className="flex justify-center w-full gap-4 pb-2">
                        <p className="text-content hover:text-primary underline cursor-pointer flex-1 text-right" onClick={() => openEditModal(data)}>Edit</p>
                        <p className="text-content">|</p>
                        <p className="text-content hover:text-red-700 underline cursor-pointer flex-1" onClick={openDeleteModal}>Delete</p>
                    </div >
                    <div className="flex gap-4 justify-center w-full">
                        <p className="text-content">
                            Time: {(data.cook_time.hours > 0 ? data.cook_time.hours + (data.cook_time.hours > 1 ? " hours" : " hour") + (data.cook_time.minutes > 0 ? ", " : " ") : "") + (data.cook_time.minutes > 0 ? + data.cook_time.minutes + (data.cook_time.minutes > 1 ? " minutes " : " minute ") : "")}
                        </p>
                    </div>
                    <div className="flex gap-2 items-center pb-2">
                        <label htmlFor={recipeId + "_scale"} className="text-content font-semibold text-xl">Scale</label>
                        <input
                            type="number"
                            min="0"
                            id={recipeId + "_scale"}
                            placeholder="0"
                            value={scale}
                            className="border border-border bg-fields text-content pl-1 w-15 rounded-md h-6.5 focus:border-2"
                            onChange={(e) => setScale(e.target.value)}
                        />
                    </div>
                    <div>
                        <div className="flex gap-4">
                            <h1 className="text-content font-semibold text-xl">Ingredients</h1>
                            <button className="cursor-pointer border border-border rounded-2xl bg-primary hover:bg-primary-hv px-2 text-sm" onClick={() => openListModal(data)}>
                                + Add to List
                            </button>
                        </div>

                        <div>
                            {data.ingredients.map((ingredient) => (
                                <div key={ingredient.ingredient_id} className="text-content">
                                    <label className="pl-2 flex items-center gap-2"><input id={ingredient.name} className="accent-primary cursor-pointer" type="checkbox" />{ingredient.measurement_qty * scale} {ingredient.unit} {ingredient.name}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <br />
                    <div>
                        <h1 className="text-content font-semibold text-xl">Instructions</h1>
                        <div>
                            {processInstructions(data.instructions).map((instruction, index) => (
                                <div key={index} className="text-content">
                                    <label className="pl-2 flex items-center gap-2"><input id={instruction} className="accent-primary cursor-pointer" type="checkbox" />{instruction}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    {data.notes && data.notes != "EMPTY" && (<div>
                        <br />
                        <h1 className="text-content font-semibold text-xl">Notes</h1>
                        <p className="text-content">{data.notes}</p>
                    </div>)}

                </div>
            )}
        </div>
    );
};

export default RecipeDropdown;