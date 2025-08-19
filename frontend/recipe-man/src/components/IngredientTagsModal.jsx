import { useState, useEffect } from "react";
import { useAuth } from "../AuthProvider";
import Modal from "../components/Modal";
import SearchableDropdown from "./SearchableDropdown";

const IngredientTagsModal = ({ openModal, closeModal }) => {
    const [tags, setTags] = useState([])
    const [selectedIngredient, setSelectedIngredient] = useState({ name: "", id: "-1" })
    const [changesMade, setChangesMade] = useState(false)
    const [displayConfirmation, setDisplayConfirmation] = useState(false)
    const { session, user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    const accessToken = session?.access_token;
    const uid = user?.id;

    const closeIngredientModal = () => {
        setTags([])
        setSelectedIngredient({ name: "", id: "-1" })
        setChangesMade(false)
        setDisplayConfirmation(false)
        closeModal()
    }
    const handleSelect = (val, id) => {
        setSelectedIngredient({ name: val, id: id })
        setChangesMade(false)
        fetch(`http://localhost:3000/api/users/${uid}/ingredients/${id}/tags`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        }).then(res => res.json().then(data => {
            setTags(data)
            setDisplayConfirmation(false)
        }))
    }
    const handleRemoveTag = (ind) => {
        const localTags = [...tags]
        localTags.splice(ind, 1)
        setTags(localTags)
        setChangesMade(true)
        setDisplayConfirmation(false)
    }
    const handleAddTag = (val, id) => {
        setChangesMade(true)
        setDisplayConfirmation(false)
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
                setTags([...tags, { description: val, id: data.tag.id }])
            })
        } else {
            setTags([...tags, { description: val, id: id }])
        }
    }
    const handleEdit = async () => {
        await fetch(`http://localhost:3000/api/users/${uid}/ingredients/${selectedIngredient.id}/tags`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        })
        const tagPromiseArr = tags.map((tag) => {
            return fetch(`http://localhost:3000/api/users/${uid}/ingredients/${selectedIngredient.id}/tags`, {
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
        Promise.all(tagPromiseArr).then(res => { setChangesMade(false); setDisplayConfirmation(true) })
    }
    return (
        <Modal openModal={openModal} closeModal={closeIngredientModal}>
            <div className="flex flex-col justify-center items-center w-full">
                <p className="text-2xl font-bold">Select Ingredient:</p>
                <SearchableDropdown
                    ingredientPart="Name"
                    apiPath="ingredients"
                    index="0"
                    onChangeEvent={(val, id) => handleSelect(val, id)}
                    fieldValue={selectedIngredient.name}
                    existingIdsList={[]}
                    disableAdd={true}
                />
                <div className="w-full flex flex-col items-start gap-1">
                    <p className="text-xl text-content">Tags:</p>
                    <div className="flex flex-wrap gap-2 items-center mb-2">
                        {tags.map((tag, index) => (
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
                            existingIdsList={tags.map((tag) => (tag.id))}
                        />
                    </div>
                </div>
                {displayConfirmation && (
                    <p className="font-bold text-primary text-lg">Updated Successfully!</p>
                )}
                <div className="flex gap-4 pb-2">
                    <button
                        disabled={!changesMade}
                        className={`text-white px-4 py-2 rounded-full  ${changesMade
                            ? 'bg-primary hover:bg-primary-hv text-content cursor-pointer'
                            : 'bg-fields text-content cursor-not-allowed'}`}
                        onClick={() => {
                            handleEdit();
                        }}
                    >
                        Update
                    </button>
                    <button
                        className="bg-red-600 px-4 py-2 rounded-full hover:bg-red-700 text-white cursor-pointer"
                        onClick={closeIngredientModal}
                    >
                        Cancel
                    </button>
                </div>
            </div>

        </Modal>
    )
}

export default IngredientTagsModal