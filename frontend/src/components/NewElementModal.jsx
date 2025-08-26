import { useState } from "react";
import { useAuth } from "../AuthProvider";
import Modal from "../components/Modal";
import SearchableDropdown from "./SearchableDropdown";

const NewElementModal = ({ openModal, closeModal, elementType }) => {
    const [input, setInput] = useState("");
    const [tags, setTags] = useState([])
    const [isValid, setIsValid] = useState(false);
    const [validated, setValidated] = useState(false);
    const { session, user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    const accessToken = session?.access_token;
    const uid = user?.id;

    const closeElementModal = () => {
        setIsValid(false);
        setValidated(false);
        setInput("");
        setTags([]);
        closeModal();
    }
    const handleAdd = () => {
        if (validated && isValid) {
            const jsonBody = JSON.stringify(elementType === "tags" ? { description: input.trim().toLowerCase() } : elementType === "ingredients" ? { name: input.trim().toLowerCase() } : { unit: input.trim().toLowerCase() });
            fetch(`http://localhost:3000/api/users/${uid}/${elementType}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },

                body: jsonBody
            }).then(res => res.json().then(data => {
                const tagPromiseArr = tags.map((tag, index) => {
                    return fetch(`http://localhost:3000/api/users/${uid}/ingredients/${data.ingredient.id}/tags`, {
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
                Promise.all(tagPromiseArr).then(res => {
                    closeElementModal();
                })

            })

            )
        }

    }
    const validateInput = (val) => {
        if (val.trim() === "") {
            setIsValid(false);
        } else {
            setValidated(false);
            const url = `http://localhost:3000/api/users/${uid}/${elementType}?` + new URLSearchParams({ name: val.toLowerCase().trim() }).toString()
            fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }).then(res => res.json()).then(data => {
                const isExisting = data.some(item => item.name === val.toLowerCase().trim());
                setValidated(true);
                setIsValid(!isExisting);
            })
        }
    }
    const handleRemoveTag = (ind) => {
        const localTags = [...tags]
        localTags.splice(ind, 1)
        setTags(localTags)
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
                setTags([...tags, { description: val, id: data.tag.id }])
            })
        } else {
            setTags([...tags, { description: val, id: id }])
        }
    }
    return (
        <Modal openModal={openModal} closeModal={() => closeElementModal()}>
            <div className="flex flex-col justify-center items-center gap-4">
                <h2 className="text-lg font-semibold">Create custom {elementType.slice(0, -1)}:</h2>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => { validateInput(e.target.value); setInput(e.target.value); }}
                    className="border border-border bg-fields text-content p-2 w-full rounded-md focus:border-2"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAdd();
                        }
                    }}
                    placeholder={`Enter new ${elementType.slice(0, -1)}`}
                />
                <p className="text-red-500"> {(validated && !isValid && input.trim() !== "") ? `This ${elementType.slice(0, -1)} already exists!` : ""}</p>
                {elementType === "ingredients" && (
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
                                index="New"
                                onChangeEvent={(val, id) => handleAddTag(val, id)}
                                fieldValue={""}
                                existingIdsList={tags.map((tag) => (tag.id))}
                            />
                        </div>
                    </div>
                )
                }
                <div className="flex gap-4 pb-2">
                    <button
                        disabled={!isValid}
                        className={`text-white px-4 py-2 rounded-full  ${isValid
                            ? 'bg-primary hover:bg-primary-hv text-content cursor-pointer'
                            : 'bg-fields text-content cursor-not-allowed'}`}
                        onClick={() => {
                            handleAdd();
                        }}
                    >
                        Create
                    </button>
                    <button
                        className="bg-red-600 px-4 py-2 rounded-full hover:bg-red-700 text-white cursor-pointer"
                        onClick={closeModal}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    )
}


export default NewElementModal;