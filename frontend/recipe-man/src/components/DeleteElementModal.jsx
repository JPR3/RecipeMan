import { useAuth } from "../AuthProvider";
import Modal from "../components/Modal";

const DeleteElementModal = ({ openModal, closeModal, elementId, elementName, elementType }) => {
    const { session, user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    const accessToken = session?.access_token;
    const uid = user?.id;

    const handleDelete = () => {
        fetch(`http://localhost:3000/api/users/${uid}/${elementType}/${elementId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => {
            console.log("Deleted successfully");
            closeModal();
        }).catch(error => console.error("Error deleting element:", error));
    }

    return (
        <Modal openModal={openModal} closeModal={closeModal}>
            <div className="flex flex-col justify-center items-center gap-4">
                <h2 className="text-lg font-semibold">Really delete "{elementName}"?</h2>
                <p className="text-content">This will remove it from ALL lists and recipes (cannot be undone)!</p>
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


export default DeleteElementModal;