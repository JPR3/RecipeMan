import React, { useState, useRef } from "react";
import Modal from "../components/Modal";
import SearchableDropdown from "./SearchableDropdown";
import { useAuth } from "../AuthProvider";
import TagDisplay from "./TagDisplay";

const NewRecipeModal = ({ openModal, closeModal }) => {
    const ref = useRef()
    const [title, setTitle] = useState("")
    const [cookHrs, setCookHrs] = useState(0)
    const [cookMins, setCookMins] = useState(0)
    const [instructions, setInstructions] = useState("")
    const [ingredients, setIngredients] = useState([{
        ingQty: 0, ingUnit: "", unitID: "-1", ingName: "", nameID: "-1"
    }])
    const [notes, setNotes] = useState("")
    const [tags, setTags] = useState([])
    const [isIngValid, setIsIngValid] = useState(false)
    const { session, user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    const accessToken = session?.access_token;
    const uid = user?.id;
    const handle = (e, type, index, id) => {
        let localIng = [...ingredients]
        localIng[index].ingQty = (type === "Q" ? e : ingredients[index].ingQty)
        localIng[index].ingUnit = (type === "U" ? e : ingredients[index].ingUnit)
        localIng[index].ingName = (type === "N" ? e : ingredients[index].ingName)
        if (type === "U") {
            localIng[index].nameID = ingredients[index].nameID
            if (id === "0") {
                //Create a new unit here
                fetch(`http://localhost:3000/api/users/${uid}/units`, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`
                    },

                    body: JSON.stringify({
                        unit: localIng[index].ingUnit.trim().toLowerCase()
                    })
                }).then(response => response.json()).then(data => {
                    localIng[index].unitID = data.unit.id
                })
            } else {
                localIng[index].unitID = id
            }
        } else if (type === "N") {
            localIng[index].unitID = ingredients[index].unitID
            if (id === "0") {
                //Create a new raw ingredient here
                fetch(`http://localhost:3000/api/users/${uid}/ingredients`, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`
                    },

                    body: JSON.stringify({
                        name: localIng[index].ingName.trim().toLowerCase()
                    })
                }).then(response => response.json()).then(data => {
                    localIng[index].nameID = data.ingredient.id
                })
            } else {
                localIng[index].nameID = id
            }
        }
        let localValid = true
        localIng.forEach(function (data, _index) {
            localValid = localValid && (data.ingQty > 0 && data.ingUnit !== "" && data.ingName != "" && data.nameID != "-1" && data.unitID != "-1")
        })
        setIsIngValid(localValid && localIng.length > 0);
        setIngredients(localIng)
    }
    const handleAddTag = (val, id) => {
        if (id === "0") {
            fetch(`http://localhost:3000/api/users/${uid}/tags`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },

                body: JSON.stringify({
                    description: val.trim().toLowerCase()
                })
            }).then(response => response.json()).then(data => {
                setTags([...tags, { name: val, id: data.tag.id }])
            })
        } else {
            setTags([...tags, { name: val, id: id }])
        }

    }
    const handleAddIngredient = (e) => {
        e.preventDefault()
        setIsIngValid(false)
        setIngredients([...ingredients, { ingQty: 0, ingUnit: "", unitID: "-1", ingName: "", nameID: "-1" }])
    }

    const handleRemoveIngredient = (index) => {
        setIsIngValid(false)
        const localIngredients = [...ingredients]
        localIngredients.splice(index, 1)
        setIngredients(localIngredients)
        let localValid = true
        localIngredients.forEach(function (data, _index) {
            localValid = localValid && (data.ingQty > 0 && data.ingUnit !== "" && data.ingName != "" && data.nameID != "-1" && data.unitID != "-1")
        })
        setIsIngValid(localValid && localIngredients.length > 0);
    }

    const handleRemoveTag = (index) => {
        const localTags = [...tags]
        localTags.splice(index, 1)
        setTags(localTags)
    }
    const createRecipe = () => {
        fetch(`http://localhost:3000/api/users/${uid}/recipes`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            },

            body: JSON.stringify({
                title: title,
                cook_time: `${cookHrs > 9 ? cookHrs : `0${cookHrs}`}:${cookMins > 9 ? cookMins : `0${cookMins}`}:00`,
                instructions: instructions,
                notes: (notes !== "" ? notes : null)
            })
        }).then(response => response.json()).then(data => {
            const recipe_id = data.recipe.id
            const ingPromiseArr = ingredients.map((ing, index) => {
                return fetch(`http://localhost:3000/api/users/${uid}/recipes/${recipe_id}/recipe_ingredients`, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`
                    },

                    body: JSON.stringify({
                        ingredient_id: ing.nameID,
                        qty: ing.ingQty,
                        unit_id: ing.unitID
                    })
                })
            })
            const ingPromise = Promise.all(ingPromiseArr)
            const tagPromiseArr = tags.map((tag, index) => {
                return fetch(`http://localhost:3000/api/users/${uid}/recipes/${recipe_id}/tags`, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`
                    },

                    body: JSON.stringify({
                        tag_id: tag.id
                    })
                })
            })
            const tagPromise = Promise.all(tagPromiseArr)
            Promise.all([ingPromise, tagPromise]).then(() => {
                closeRecipeModal();
            })
        });
    }
    const isValid = (title !== "") && (cookHrs >= 0) && (cookMins >= 0) && (instructions !== "") && isIngValid
    const closeRecipeModal = () => {
        ref.current?.reset();
        setTitle("");
        setCookHrs(0);
        setCookMins(0);
        setInstructions("");
        setNotes("");
        setIsIngValid(false);
        setIngredients([{
            ingQty: 0, ingUnit: "", unitID: "-1", ingName: "", nameID: "-1"
        }]);
        setTags([]);
        closeModal();
    };

    return (
        <Modal openModal={openModal} closeModal={() => closeRecipeModal()}>
            <h1 className="flex justify-center text-2xl font-semibold">Create New Recipe</h1>
            <form ref={ref}>
                <label className="text-xl text-content" htmlFor="title">Name</label>
                <input
                    id="title"
                    name="title"
                    placeholder="Recipe Name"
                    type="text"
                    className="border border-border bg-fields text-content p-2 w-full rounded-md mb-2 focus:border-2"
                    onChange={(e) => setTitle(e.target.value)}
                />
                <p className="text-xl text-content">Cook Time</p>
                <div id="cookTime" className="w-full flex gap-2 items-center mb-2">
                    <label htmlFor="cookHrs" hidden>Cook Hours</label>
                    <input
                        id="cookHrs"
                        name="cookHrs"
                        type="number"
                        min="0"
                        value={cookHrs}
                        className="border border-border bg-fields text-content px-2 py-1 w-14 rounded-md focus:border-2"
                        onChange={(e) => setCookHrs(e.target.value)}
                    />
                    <p>Hours</p>
                    <label htmlFor="cookMins" hidden>Cook Minutes</label>
                    <input
                        id="cookMins"
                        name="cookMins"
                        type="number"
                        min="0"
                        value={cookMins}
                        className="border border-border bg-fields text-content px-2 py-1 w-14 rounded-md focus:border-2"
                        onChange={(e) => setCookMins(e.target.value)}
                    />
                    <p>Minutes</p>
                </div>
                <p className="text-xl text-content">Ingredients</p>
                {ingredients.map((ingredient, index) => {
                    return (
                        <div key={index} className="flex gap-2 items-center pb-1">
                            <input
                                type="number"
                                min="0"
                                id={"qty" + index}
                                name={"qty" + index}
                                placeholder="0"
                                value={ingredients[index].ingQty}
                                className="border border-border bg-fields text-content pl-1 w-10 rounded-md h-6.5 focus:border-2"
                                onChange={(e) => handle(e.target.value, "Q", index)}
                            />
                            <SearchableDropdown
                                ingredientPart="Unit"
                                apiPath="units"
                                index={index}
                                onChangeEvent={(val, id) => handle(val, "U", index, id)}
                                fieldValue={ingredients[index].ingUnit}
                            />
                            <SearchableDropdown
                                ingredientPart="Name"
                                apiPath="ingredients"
                                index={index}
                                onChangeEvent={(val, id) => handle(val, "N", index, id)}
                                fieldValue={ingredients[index].ingName}
                                existingIdsList={ingredients.map((ing) => (ing.nameID))}
                            />
                            <svg onClick={() => handleRemoveIngredient(index)} xmlns="http://www.w3.org/2000/svg" width="25" height="25" className="bi bi-x fill-fields hover:fill-red-700 cursor-pointer" viewBox="3 0 16 16">
                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                            </svg>
                        </div>
                    )
                })}
                <button type="button" className="cursor-pointer border border-border rounded-2xl bg-primary hover:bg-primary-hv px-2 " onClick={handleAddIngredient}>Add+</button>
                <br />
                <label className="text-xl text-content" htmlFor="instructions">Instructions</label>
                <textarea
                    id="instructions"
                    name="instructions"
                    placeholder="Instructions"
                    value={instructions}
                    className="border border-border bg-fields text-content p-2 w-full rounded-md mb-2 focus:border-2"
                    onChange={(e) => setInstructions(e.target.value)}
                />
                <label className="text-xl text-content" htmlFor="notes">Notes</label>
                <textarea
                    id="notes"
                    name="notes"
                    value={notes}
                    placeholder="(Optional)"
                    className="border border-border bg-fields text-content p-2 w-full rounded-md mb-2 focus:border-2"
                    onChange={(e) => setNotes(e.target.value)}
                />
                <p className="text-xl text-content">Tags</p>
                <div className="flex flex-wrap gap-2 items-center mb-2">
                    {tags.map((tag, index) => (
                        <div key={tag.name} className="flex items-center bg-fields rounded-full">
                            <span className="text-content px-1.5 pb-0.5 text-sm">
                                {tag.name}
                            </span>
                            <svg onClick={() => handleRemoveTag(index)} xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="bi bi-x fill-content hover:fill-red-700 cursor-pointer" viewBox="3 0 16 16">
                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                            </svg>
                        </div>
                    ))}
                </div>
                <div className="max-w-40">
                    <SearchableDropdown
                        ingredientPart="Tag"
                        apiPath="tags"
                        index="0"
                        onChangeEvent={(val, id) => handleAddTag(val, id)}
                        fieldValue={""}
                        existingIdsList={tags.map((tag) => (tag.id))}
                    />
                </div>

                <button
                    type="button"
                    disabled={!isValid}
                    className={`w-full font-semibold py-2 px-4 rounded-md mt-4 mb-2 ${isValid
                        ? 'bg-primary hover:bg-primary-hv text-content'
                        : 'bg-button text-content cursor-not-allowed'
                        }`}
                    onClick={(e) => {
                        createRecipe();
                    }}
                >
                    Create
                </button>

            </form>
        </Modal>
    );

}


export default NewRecipeModal;