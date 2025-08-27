import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import Modal from "../components/Modal";
const API_BASE = import.meta.env.VITE_API_BASE || '';

const NewListModal = ({ openModal, closeModal, existingLists }) => {
    const [input, setInput] = useState("")
    const [isValid, setIsValid] = useState(false)
    const navigate = useNavigate();
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
    const handleSubmit = () => {
        if (isValid) {
            fetch(`${API_BASE}/api/users/${uid}/lists`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },

                body: JSON.stringify({
                    title: input
                })
            }).then(res => res.json().then(data => {
                navigate(`/lists/${data.list.id}`)
            }))
        }
    }
    return (
        <Modal openModal={openModal} closeModal={closeListModal}>
            <div className="flex flex-col justify-center items-center gap-4">
                <h2 className="text-xl font-bold">Create New List</h2>
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

export default NewListModal