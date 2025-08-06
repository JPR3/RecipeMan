import { useState, useEffect } from "react";
import { useAuth } from "../AuthProvider";
import Modal from "../components/Modal";

const EditElementModal = ({ openModal, closeModal, elementType, elementName, elementId }) => {
    const [input, setInput] = useState("bar");
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
        closeModal();
    }
    useEffect(() => {
        if (openModal && elementName) {
            setInput(elementName);
            validateInput(elementName);
        }
    }, [openModal])
    const handleEdit = () => {
        if (validated && isValid) {
            if (input.trim() === elementName) {
                closeElementModal();
                return;
            }
            const jsonBody = JSON.stringify(elementType === "tags" ? { description: input.trim().toLowerCase() } : elementType === "ingredients" ? { name: input.trim().toLowerCase() } : { unit: input.trim().toLowerCase() });
            fetch(`http://localhost:3000/api/users/${uid}/${elementType}/${elementId}`, {
                method: 'PATCH',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },

                body: jsonBody
            }).then(res => {
                if (!res.ok) {
                    console.error("Error creating element:", res.statusText);
                    return;
                }
                closeElementModal();
            })
        }

    }
    const validateInput = (val) => {
        if (val.trim() === "") {
            setIsValid(false);
        } else if (val.trim() === elementName) {
            setIsValid(true);
            setValidated(true);
        } else {
            setValidated(false);
            const url = `http://localhost:3000/api/users/${uid}/${elementType}?` + new URLSearchParams({ name: val.toLowerCase().trim() }).toString()
            fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }).then(res => res.json()).then(data => {
                const isExisting = data.some(item => (item.name === val.toLowerCase().trim()));
                setValidated(true);
                setIsValid(!isExisting);
            })
        }
    }
    return (
        <Modal openModal={openModal} closeModal={() => closeElementModal()}>
            <div className="flex flex-col justify-center items-center gap-4">
                <h2 className="text-lg font-semibold">Rename {elementType.slice(0, -1)} "{elementName}":</h2>
                <p className="text-content">This will change it across all lists and recipes</p>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => { validateInput(e.target.value); setInput(e.target.value); }}
                    className="border border-border bg-fields text-content p-2 w-full rounded-md focus:border-2"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleEdit();
                        }
                    }}
                    placeholder={`Enter new ${elementType.slice(0, -1)}`}
                />
                <p className="text-red-500"> {(validated && !isValid && input.trim() !== "") ? `This ${elementType.slice(0, -1)} already exists!` : ""}</p>
                <div className="flex gap-4 pb-2">
                    <button
                        disabled={!isValid}
                        className={`text-white px-4 py-2 rounded-full  ${isValid
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
                        onClick={closeModal}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    )
}


export default EditElementModal;