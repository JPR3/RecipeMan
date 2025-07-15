import React, { useState } from 'react';
import TagDisplay from './TagDisplay';

const RecipeDropdown = ({ recipeName, recipeTags, recipeIngredients, recipeCookTime, recipeInstructions, recipeNotes }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="w-full max-w-4xl">
            <div onClick={toggleDropdown} className={(isOpen ? "border-t border-r border-l rounded-t-2xl " : "border rounded-2xl ") + "cursor-pointer w-full bg-surface border-border text-content shadow-lg p-4 pl-2 flex"}>
                <p className={"text-content " + (isOpen ? "font-bold text-xl absolute left-1/2 transform -translate-y-1/4 -translate-x-1/2 pointer-events-none" : "relative ml-2 text-lg")}>
                    {recipeName}
                </p>
                {!isOpen && (
                    <div className="flex gap-2 ml-4">
                        <TagDisplay tags={recipeTags} />
                    </div>
                )}
                <div className="ml-auto flex-shrink-0 content-center">
                    {isOpen ? (<svg xmlns="http://www.w3.org/2000/svg" width="25" height="20" fill="var(--color-primary)" class="bi bi-caret-up-fill" viewBox="0 0 16 16">
                        <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
                    </svg>) : (<svg xmlns="http://www.w3.org/2000/svg" width="25" height="20" fill="var(--color-primary)" class="bi bi-caret-down-fill" viewBox="0 0 16 16">
                        <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                    </svg>)}
                </div>

            </div>
            {isOpen && (
                <div className=" bg-surface border-l border-r border-b border-border rounded-b-2xl shadow-lg p-2 pt-0">
                    <div className="flex justify-center items-center pb-2">
                        <div className="flex gap-2">
                            <TagDisplay tags={recipeTags} />
                        </div>
                    </div>
                    <div className="flex gap-4 justify-center w-full">
                        <p className="text-content">Cook Time: {recipeCookTime}</p>
                        <p className="text-content">|</p>
                        <p className="text-content">Edit</p>
                        <p className="text-content">|</p>
                        <p className="text-content">Delete</p>
                    </div>
                    <div>
                        <h1 className="text-content font-semibold text-xl">Ingredients</h1>
                        <div>
                            {recipeIngredients.map((ingredient) => (
                                <div key={ingredient.id} className="text-content">
                                    <label className="pl-2 flex items-center gap-2"><input className="accent-primary" type="checkbox" />{ingredient.name}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <br />
                    <div>
                        <h1 className="text-content font-semibold text-xl">Instructions</h1>
                        <div>
                            {recipeInstructions.map((instruction) => (
                                <div key={instruction.id} className="text-content">
                                    <label className="pl-2 flex items-center gap-2"><input className="accent-primary" type="checkbox" />{instruction.instruction}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <br />
                    <div>
                        <h1 className="text-content font-semibold text-xl">Notes</h1>
                        <p className="text-content">{recipeNotes}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipeDropdown;