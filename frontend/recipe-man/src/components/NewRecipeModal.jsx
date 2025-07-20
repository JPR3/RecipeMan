import React, { useState, useRef } from "react";
import Modal from "../components/Modal";
import SearchableDropdown from "./SearchableDropdown";

const NewRecipeModal = ({ openModal, closeModal }) => {
    const ref = useRef()
    const [title, setTitle] = useState("")
    const [cookHrs, setCookHrs] = useState(0)
    const [cookMins, setCookMins] = useState(0)
    const [instructions, setInstructions] = useState("")
    const [ingredients, setIngredients] = useState([{
        ingQty: 0, ingUnit: "", ingName: ""
    }])
    const [notes, setNotes] = useState("")
    const [isIngValid, setIsIngValid] = useState(false)
    const handle = (e, type, index) => {
        let localIng = [...ingredients]
        localIng[index].ingQty = (type === "Q" ? e : ingredients[index].ingQty)
        localIng[index].ingUnit = (type === "U" ? e : ingredients[index].ingUnit)
        localIng[index].ingName = (type === "N" ? e : ingredients[index].ingName)
        let localValid = true
        localIng.forEach(function (data, _index) {
            localValid = localValid && (data.ingQty !== 0 && data.ingUnit !== "" && data.ingName != "")
        })
        setIsIngValid(localValid)
        setIngredients(localIng)
    }

    const handleAddIngredient = (e) => {
        e.preventDefault()
        setIsIngValid(false)
        setIngredients([...ingredients, { ingQty: 0, ingUnit: "", ingName: "" }])
    }
    const isValid = title && cookHrs && cookMins && instructions && isIngValid
    return (
        <Modal openModal={openModal} closeModal={() => {
            closeModal(); ref.current?.reset(); setIngredients([{
                ingQty: 0, ingUnit: "", ingName: ""
            }])
        }}>
            <h1 className="flex justify-center text-2xl font-semibold">Create New Recipe</h1>
            <form ref={ref}>
                <label className="text-xl text-content" htmlFor="title">Name</label>
                <input
                    id="title"
                    name="title"
                    placeholder="Recipe Name"
                    type="text"
                    className="border border-border bg-fields text-content p-2 w-full rounded-md mb-2"
                    onChange={(e) => setTitle(e.target.value)}
                />
                <p className="text-xl text-content">Cook Time</p>
                <div id="cookTime" className="w-full flex gap-2 items-center mb-2">
                    <label htmlFor="cookHrs" hidden>Cook Hours</label>
                    <input
                        id="cookHrs"
                        name="cookHrs"
                        type="number"
                        className="border border-border bg-fields text-content p-2 w-12 hover:w-15 focus:w-15 rounded-md"
                        onChange={(e) => setCookHrs(e.target.value)}
                    />
                    <p>Hours</p>
                    <label htmlFor="cookMins" hidden>Cook Minutes</label>
                    <input
                        id="cookMins"
                        name="cookMins"
                        type="number"
                        className="border border-border bg-fields text-content p-2 w-12 hover:w-15 focus:w-15 rounded-md"
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
                                className="border border-border bg-fields text-content w-8 hover:w-10 focus:w-10 rounded-md h-6.5"
                                onChange={(e) => handle(e.target.value, "Q", index)}
                            />
                            <SearchableDropdown type="unit" apiPath="" index={index} onChangeEvent={(val) => handle(val, "U", index)} fieldValue={ingredients[index].ingUnit}></SearchableDropdown>
                            <SearchableDropdown type="name" apiPath="" index={index} onChangeEvent={(val) => handle(val, "N", index)} fieldValue={ingredients[index].ingName}></SearchableDropdown>
                        </div>
                    )
                })}
                <button className="cursor-pointer border border-border rounded-2xl bg-primary hover:bg-primary-hv px-2 " onClick={handleAddIngredient}>Add+</button>
                <br />
                <label className="text-xl text-content" htmlFor="instructions">Instructions</label>
                <textarea
                    id="instructions"
                    name="instructions"
                    placeholder="Instructions"
                    className="border border-border bg-fields text-content p-2 w-full rounded-md mb-2"
                    onChange={(e) => setInstructions(e.target.value)}
                />
                <label className="text-xl text-content" htmlFor="notes">Notes</label>
                <textarea
                    id="notes"
                    name="notes"
                    placeholder="(Optional)"
                    className="border border-border bg-fields text-content p-2 w-full rounded-md mb-4"
                    onChange={(e) => setNotes(e.target.value)}
                />
                <button
                    type="button"
                    disabled={!isValid}
                    className={`w-full font-semibold py-2 px-4 rounded-md ${isValid
                        ? 'bg-primary hover:bg-primary-hv text-content'
                        : 'bg-button text-content cursor-not-allowed'
                        }`}
                    onClick={(e) => console.log(ingredients)}
                >
                    Create
                </button>
            </form>

        </Modal>
    );

}


export default NewRecipeModal;