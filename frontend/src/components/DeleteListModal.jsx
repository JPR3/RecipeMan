import { useAuth } from "../AuthProvider";
import Modal from "../components/Modal";
const API_BASE = import.meta.env.VITE_API_BASE || '';

const DeleteListModal = ({ openModal, closeModal, listId, listTitle }) => {
    const { session, user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    const accessToken = session?.access_token;
    const uid = user?.id;

    const handleDelete = () => {
        fetch(`${API_BASE}/api/users/${uid}/lists/${listId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => {
            closeModal();
        }).catch(error => console.error("Error deleting list:", error));
    }

    return (
        <Modal openModal={openModal} closeModal={closeModal}>
            <div className="flex flex-col justify-center items-center gap-4">
                <h2 className="text-lg font-semibold">Are you sure you want to delete "{listTitle}"?</h2>
                <div className="flex gap-4 pb-2">
                    <button
                        className="bg-red-700 text-white px-4 py-2 rounded-full hover:bg-red-800 cursor-pointer"
                        onClick={() => {
                            handleDelete();
                        }}
                    >
                        Delete
                    </button>
                    <button
                        className="bg-button px-4 py-2 rounded-full hover:bg-border text-white cursor-pointer"
                        onClick={closeModal}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default DeleteListModal;