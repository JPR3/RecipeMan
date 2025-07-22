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
        setIsIngValid(localValid)
        setIngredients(localIng)
    }
    const handleAddTag = (val, id) => {
        let localId = "-1"
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
                cook_time: `${cookHrs}:${cookMins}:00`,
                instructions: instructions,
                notes: notes
            })
        }).then(response => response.json()).then(data => {
            const recipe_id = data.recipe.id
            ingredients.map((ing, index) => {
                fetch(`http://localhost:3000/api/users/${uid}/recipes/${recipe_id}/recipe_ingredients`, {
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
            tags.map((tag, index) => {
                fetch(`http://localhost:3000/api/users/${uid}/recipes/${recipe_id}/tags`, {
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
        });
    }

    const isValid = (title !== "") && (cookHrs > 0) && (cookMins > 0) && (instructions !== "") && isIngValid
    const closeRecipeModal = () => {
        closeModal();
        ref.current?.reset();
        setTitle("");
        setCookHrs(0);
        setCookMins(0);
        setInstructions("");
        setNotes("");
        setIsIngValid(false);
        setIngredients([{
            ingQty: 0, ingUnit: "", unitID: "-1", ingName: "", nameID: "-1"
        }])
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
                        value={cookHrs}
                        className="border border-border bg-fields text-content p-2 w-12 hover:w-15 focus:w-15 rounded-md focus:border-2"
                        onChange={(e) => setCookHrs(e.target.value)}
                    />
                    <p>Hours</p>
                    <label htmlFor="cookMins" hidden>Cook Minutes</label>
                    <input
                        id="cookMins"
                        name="cookMins"
                        type="number"
                        value={cookMins}
                        className="border border-border bg-fields text-content p-2 w-12 hover:w-15 focus:w-15 rounded-md focus:border-2"
                        onChange={(e) => setCookMins(e.target.value)}
                    />
                    <p>Minutes</p>
                </div>
                <p className="text-xl text-content">Ingredients</p>
                {ingredients.map((ingredient, index) => {
                    return (
                        <div key={index} className="flex gap-2 items-top pb-1">
                            <input
                                type="number"
                                id={"qty" + index}
                                name={"qty" + index}
                                placeholder="0"
                                value={ingredients[index].ingQty}
                                className="border border-border bg-fields text-content w-10 rounded-md h-6.5 focus:border-2"
                                onChange={(e) => handle(e.target.value, "Q", index)}
                            />
                            <SearchableDropdown ingredientPart="Unit" apiPath="units" index={index} onChangeEvent={(val, id) => handle(val, "U", index, id)} fieldValue={ingredients[index].ingUnit}></SearchableDropdown>
                            <SearchableDropdown ingredientPart="Name" apiPath="ingredients" index={index} onChangeEvent={(val, id) => handle(val, "N", index, id)} fieldValue={ingredients[index].ingName}></SearchableDropdown>
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
                    className="border border-border bg-fields text-content p-2 w-full rounded-md mb-2 focus:border-2"
                    onChange={(e) => setInstructions(e.target.value)}
                />
                <label className="text-xl text-content" htmlFor="notes">Notes</label>
                <textarea
                    id="notes"
                    name="notes"
                    placeholder="(Optional)"
                    className="border border-border bg-fields text-content p-2 w-full rounded-md mb-2 focus:border-2"
                    onChange={(e) => setNotes(e.target.value)}
                />
                <label className="text-xl text-content" htmlFor="tagDisplay">Tags</label>
                <TagDisplay id="tagDisplay"
                    tags={tags.map((val) => (val.name))}>
                </TagDisplay>
                <SearchableDropdown ingredientPart="Tag" apiPath="tags" index="0" onChangeEvent={(val, id) => handleAddTag(val, id)} fieldValue={""}></SearchableDropdown>
                <button
                    type="button"
                    disabled={!isValid}
                    className={`w-full font-semibold py-2 px-4 rounded-md ${isValid
                        ? 'bg-primary hover:bg-primary-hv text-content'
                        : 'bg-button text-content cursor-not-allowed'
                        }`}
                    onClick={(e) => {
                        createRecipe(); closeRecipeModal()
                    }}
                >
                    Create
                </button>

            </form>
            <button type="button" onClick={() => console.log(tags.map((val) => (val.name)))}>show tags</button>
        </Modal>
    );

}


export default NewRecipeModal;