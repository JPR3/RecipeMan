import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';
import { useRef } from 'react';

const SearchableDropdown = ({ ingredientPart, apiPath, onChangeEvent, index, fieldValue }) => {
    const [localValue, setLocalValue] = useState("")
    const [displayAdd, setDisplayAdd] = useState(true)
    const [isOpen, setIsOpen] = useState(false);
    const [ingredients, setIngredients] = useState([])
    const ref = useRef(null);
    const { session, user, loading } = useAuth();


    if (loading) return <div>Loading...</div>;

    const accessToken = session?.access_token;
    const uid = user?.id;


    React.useEffect(() => {
        if (localValue.length >= 1) {
            const url = `http://localhost:3000/api/users/${uid}/${apiPath}?` + new URLSearchParams({ name: localValue.toLowerCase().trim() }).toString()
            fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }).then(response => response.json()).then(data => {
                console.log(data)
                setIngredients(data)
                changeAddDisplay(localValue, data)
            });
        } else {
            setIngredients([])
            setDisplayAdd(true)
        }


    }, [localValue]);
    const handleBlur = (event) => {
        if (!(event.relatedTarget && event.relatedTarget.id.startsWith("dropdown-selectable"))) {
            setIsOpen(false)
            setLocalValue(fieldValue)
        }
    }
    const changeAddDisplay = (val, ingList) => {
        var localDisplay = true
        ingList.map((ingredient, index) => {
            if (localDisplay && ingredient.name === val.toLowerCase().trim()) {
                localDisplay = false;
            }
        })
        setDisplayAdd(localDisplay)
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
                className={(isOpen && localValue != "" ? "rounded-t-md border-t-2 border-r-2 border-l-2 border-primary " : "rounded-md border border-border focus:border-2 ") + " px-1 bg-fields text-content w-40 h-6.5"}
                onChange={(e) => { setLocalValue(e.target.value); }}
                value={isOpen ? localValue : fieldValue}
                placeholder={ingredientPart + " (Search...)"}
                onFocus={() => { setIsOpen(true) }}
                onBlur={handleBlur}
            />
            {isOpen && localValue != "" && (
                <div>
                    <div className="overflow-y-auto max-h-26" onBlur={handleBlur}>
                        {ingredients.map((ingredient, index) => {
                            return (
                                <p
                                    id={"dropdown-selectable-" + ingredient.name}
                                    onKeyDownCapture={(e) => { if (e.key === "Enter") { setIsOpen(false); onChangeEvent(ingredient.name, ingredient.id) } }}
                                    onClick={(e) => { setIsOpen(false); onChangeEvent(ingredient.name, ingredient.id) }}
                                    key={ingredient.name}
                                    tabIndex="0"
                                    className="border-r-2 border-l-2 border-primary bg-fields text-content w-40 h-6.5 px-1 hover:bg-button"
                                >
                                    {capitalizeEachWord(ingredient.name)}
                                </p>
                            )
                        })}
                    </div>
                    <p
                        id={"dropdown-selectable-add"}
                        onKeyDownCapture={(e) => { if (e.key === "Enter") { setIsOpen(false); onChangeEvent(localValue, "0") } }}
                        onClick={(e) => { setIsOpen(false); onChangeEvent(localValue, "0") }}
                        tabIndex="0"
                        className="border-r-2 border-l-2 border-b-2 border-primary bg-fields text-content w-40 rounded-b-md px-1 hover:bg-button"
                    >
                        {displayAdd && ("Add " + localValue)}
                    </p>
                </div>

            )}
        </div>
    )
}

export default SearchableDropdown;