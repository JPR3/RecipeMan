import { useState, useEffect } from "react"
import SearchableDropdown from "./SearchableDropdown";
import { useAuth } from "../AuthProvider"
import { capitalizeEachWord } from "../helpers";
import TagDisplay from "./TagDisplay";

const ListItemDisplay = ({ ingredient, index, lastInd, handleCheckChange, listId, updateList, enableEdits, setEnableEdits, editListIngredient, createListIngredient }) => {
    const [editMode, setEditMode] = useState(false);
    const [newIng, setNewIng] = useState({ ...ingredient })
    const [isValid, setIsValid] = useState(false)
    const { session, user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    const accessToken = session?.access_token;
    const uid = user?.id;

    useEffect(() => {
        setNewIng({ ...ingredient })
        validateIng(ingredient)
    }, [ingredient])


    const validateIng = (data) => {
        const localValid = (data.measurement_qty > 0 && data.unit !== "" && data.name != "" && data.name_id != "-1" && data.unit_id != "-1")
        setIsValid(localValid)
        if (!localValid) {
            setEditMode(true)
            setEnableEdits(false)
        }
    }

    const handleEdit = (e, type, id) => {
        let localIng = { ...newIng }
        localIng.measurement_qty = (type === "Q" ? e : newIng.measurement_qty)
        localIng.unit = (type === "U" ? e : newIng.unit)
        localIng.name = (type === "N" ? e : newIng.name)
        if (type === "U") {
            localIng.name_id = newIng.name_id
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
                        unit: localIng.unit.trim().toLowerCase()
                    })
                }).then(response => response.json()).then(data => {
                    localIng.unit_id = data.unit.id
                })
            } else {
                localIng.unit_id = id
            }
        } else if (type === "N") {
            localIng.unit_id = newIng.unit_id
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
                        name: localIng.name.trim().toLowerCase()
                    })
                }).then(response => response.json()).then(data => {
                    localIng.name_id = data.ingredient.id
                })
            } else {
                localIng.name_id = id
            }
        }
        validateIng(localIng)
        setNewIng(localIng)
    }

    const handleSubmit = () => {
        if (!isValid) { return }
        if (ingredient.id !== "-1") {
            //Edit an existing item
            editListIngredient(newIng).then(res => {
                setEditMode(false);
                setEnableEdits(true);
                updateList();
            })
        } else {
            //Create a new item
            createListIngredient(newIng).then(res => {
                setEditMode(false)
                setEnableEdits(true)
                updateList();
            })
        }

    }
    const handleRemove = () => {
        fetch(`http://localhost:3000/api/users/${uid}/lists/${listId}/list_ingredients/${ingredient.id}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        }).then(res => {
            updateList();
        })
    }
    const handleRemoveTag = (index) => {
        const localTags = [...newIng.list_item_tags]
        localTags.splice(index, 1)
        setNewIng({ ...newIng, list_item_tags: localTags })
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
                const newTags = [...newIng.list_item_tags, { description: val, id: data.tag.id }]
                setNewIng({ ...newIng, list_item_tags: newTags })
            })
        } else {
            const newTags = [...newIng.list_item_tags, { description: val, id: id }]
            setNewIng({ ...newIng, list_item_tags: newTags })
        }
    }
    return (
        (editMode) ? (
            <div key={index} className={"flex-col gap-2 px-2 items-center w-full pb-2 border-b-2 border-l-2 border-r-2 border-border bg-surface max-w-3/4 pt-2" + (index === 0 ? " border-t-2 rounded-t-md" : (index === lastInd ? " rounded-b-md" : ""))} >
                <div key={index} className="flex gap-2 items-center w-full">
                    <input
                        type="number"
                        min="0"
                        id={"qty" + index}
                        name={"qty" + index}
                        placeholder="0"
                        value={newIng.measurement_qty}
                        className="border border-border bg-fields text-content pl-1 w-10 rounded-md h-6.5 focus:border-2"
                        onChange={(e) => handleEdit(e.target.value, "Q")}
                    />
                    <SearchableDropdown
                        ingredientPart="Unit"
                        apiPath="units"
                        index={index}
                        onChangeEvent={(val, id) => handleEdit(val, "U", id)}
                        fieldValue={newIng.unit}
                    />
                    <SearchableDropdown
                        ingredientPart="Name"
                        apiPath="ingredients"
                        index={index}
                        onChangeEvent={(val, id) => handleEdit(val, "N", id)}
                        fieldValue={newIng.name}
                    />
                    {isValid &&
                        <div className="flex flex-1 justify-end">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-check2 fill-primary cursor-pointer" viewBox="0 0 16 16" onClick={() => handleSubmit()}>
                                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
                            </svg>
                        </div>
                    }
                </div>
                <p className="text-md text-content">Tags:</p>
                <div className="flex flex-wrap gap-2 items-center mb-2">
                    {newIng.list_item_tags.map((tag, index) => (
                        <div key={tag.description} className="flex items-center bg-fields rounded-full">
                            <span className="text-content px-1.5 pb-0.5 text-sm">
                                {tag.description}
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
                        existingIdsList={newIng.list_item_tags.map((tag) => (tag.id))}
                    />
                </div>
            </div >
        ) : (
            <div key={index} className={"flex gap-2 px-2 items-center w-full pb-2 border-b-2 border-l-2 border-r-2 border-border bg-surface max-w-3/4 pt-2" + (index === 0 ? " border-t-2 rounded-t-md" : (index === lastInd ? " rounded-b-md" : ""))}>
                <input className="accent-primary cursor-pointer" type="checkbox" checked={ingredient.checked} onChange={() => handleCheckChange(ingredient.id, index)} />
                <span className="text-content">{capitalizeEachWord(ingredient.name) + ":"}</span>
                <span className="text-content">{ingredient.measurement_qty} {capitalizeEachWord(ingredient.unit)}</span>
                <TagDisplay tags={[...new Set([...ingredient.global_tags, ...ingredient.list_item_tags])].map((t) => t.description)}></TagDisplay>
                {enableEdits &&
                    <div className="flex flex-1 justify-end gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square hover:fill-primary cursor-pointer" viewBox="0 0 16 16" onClick={() => { validateIng(ingredient); setEditMode(true); setEnableEdits(false) }}>
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                            <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                        </svg>
                        <svg onClick={() => handleRemove()} xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="bi bi-x fill-content hover:fill-red-700 cursor-pointer" viewBox="0 0 14 14">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                        </svg>
                    </div>
                }
            </div>
        )



    )
}

export default ListItemDisplay;