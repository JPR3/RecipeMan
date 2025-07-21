import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';
import { useRef } from 'react';

const SearchableDropdown = ({ ingredientPart, apiPath, onChangeEvent, index, fieldValue }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [ingredients, setIngredients] = useState([])
    const { session, user, loading } = useAuth();
    const ref = useRef(null);

    if (loading) return <div>Loading...</div>;

    const accessToken = session?.access_token;
    const uid = user?.id;


    React.useEffect(() => {
        if (fieldValue.length >= 3) {
            const url = `http://localhost:3000/api/users/${uid}/${apiPath}?` + new URLSearchParams({ name: fieldValue.toLowerCase() }).toString()
            fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }).then(response => response.json()).then(data => {
                setIngredients(data)
            });
        } else {
            setIngredients([])
        }

    }, [fieldValue]);
    const handleBlur = (event) => {
        if (!(event.relatedTarget && event.relatedTarget.id.startsWith("dropdown-selectable"))) {
            setIsOpen(false)
        }
    }
    const capitalizeEachWord = (str) => {
        // Convert the entire string to lowercase to handle cases where input might have mixed casing
        const words = str.toLowerCase().split(' ');

        for (let i = 0; i < words.length; i++) {
            // Check if the word is not empty to avoid errors with multiple spaces
            if (words[i].length > 0) {
                words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
            }
        }

        return words.join(' ');
    }
    return (
        <div className='grid'>
            <input
                type="text"
                id={ingredientPart + "_" + index}
                name={ingredientPart + "_" + index}
                ref={ref}
                className={(isOpen && fieldValue != "" ? "rounded-t-md border-t-2 border-r-2 border-l-2 border-primary " : "rounded-md border border-border focus:border-2 ") + "  bg-fields text-content w-40 h-6.5"}
                // This can be a string instead of e.target.value, to override with dropdown selection!
                onChange={(e) => onChangeEvent(e.target.value)}
                value={fieldValue}
                placeholder='Search...'
                onFocus={() => setIsOpen(true)}
                onBlur={handleBlur}
            />
            {/* <button type="button" onClick={(e) => onChangeEvent("pie")}>pie button</button> */}
            {isOpen && fieldValue != "" && (
                <div>
                    <div className="overflow-y-auto max-h-26" onBlur={handleBlur}>
                        {ingredients.map((ingredient, index) => {
                            return (
                                <p id={"dropdown-selectable-" + ingredient.name} onKeyDownCapture={(e) => { if (e.key === "Enter") { setIsOpen(false); onChangeEvent(ingredient.name) } }} onClick={(e) => { setIsOpen(false); onChangeEvent(ingredient.name) }} key={ingredient.name} tabIndex="0" className="border-r-2 border-l-2 border-primary bg-fields text-content w-40 h-6.5 hover:bg-button">{capitalizeEachWord(ingredient.name)}</p>
                            )
                        })}

                    </div>

                    <p id={"dropdown-selectable-add"} onKeyDownCapture={(e) => { if (e.key === "Enter") { setIsOpen(false); onChangeEvent("ADDTHIS") } }} onClick={(e) => { setIsOpen(false); onChangeEvent("ADDTHIS") }} tabIndex="0" className="border-r-2 border-l-2 border-b-2 border-primary bg-fields text-content w-40 rounded-b-md  hover:bg-button">Add "{fieldValue}"</p>

                </div>

            )}
        </div>
    )
}

export default SearchableDropdown;