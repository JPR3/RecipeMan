import { useState, useEffect } from "react";
import { useAuth } from "../AuthProvider";
import Modal from "../components/Modal";

const EditListModal = ({ openModal, closeModal, existingLists, oldTitle, listId }) => {
    const [input, setInput] = useState(oldTitle)
    const [isValid, setIsValid] = useState(false)
    const { session, user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    const accessToken = session?.access_token;
    const uid = user?.id;

    const closeListModal = () => {
        setInput("");
        setIsValid(false);
        closeModal();
    }
    const validateInput = (val) => {
        setIsValid(val !== "" && !existingLists.includes(val))
    }
    useEffect(() => {
        setInput(oldTitle)
    }, [oldTitle])

    const handleSubmit = () => {
        if (isValid) {
            fetch(`http://localhost:3000/api/users/${uid}/lists/${listId}`, {
                method: 'PATCH',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },

                body: JSON.stringify({
                    title: input
                })
            }).then(res => res.json().then(data => {
                closeListModal();
            }))
        }
    }
    return (
        <Modal openModal={openModal} closeModal={closeListModal}>
            <div className="flex flex-col justify-center items-center gap-4">
                <h2 className="text-xl font-bold">Update List Name</h2>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => { validateInput(e.target.value); setInput(e.target.value); }}
                    className="border border-border bg-fields text-content px-2 w-3/4 rounded-md focus:border-2"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                    placeholder="List Title"
                />
                <div className="flex gap-4 pb-2">
                    <button
                        disabled={!isValid}
                        className={`text-white px-4 py-2 rounded-full  ${isValid
                            ? 'bg-primary hover:bg-primary-hv text-content cursor-pointer'
                            : 'bg-fields text-content cursor-not-allowed'}`}
                        onClick={() => {
                            handleSubmit();
                        }}
                    >
                        Rename
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

export default EditListModal