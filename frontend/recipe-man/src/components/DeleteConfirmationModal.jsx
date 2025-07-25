import React, { useState } from "react";
import { useAuth } from "../AuthProvider";
import Modal from "../components/Modal";

const DeleteConfirmationModal = ({ openModal, closeModal, recipeId, recipeName }) => {
    const { session, user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    const accessToken = session?.access_token;
    const uid = user?.id;

    const handleDelete = () => {
        fetch(`http://localhost:3000/api/users/${uid}/recipes/${recipeId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => {
            console.log("Recipe deleted successfully");
            closeModal();
        }).catch(error => console.error("Error deleting recipe:", error));
    }

    return (
        <Modal openModal={openModal} closeModal={closeModal}>
            <div className="flex flex-col justify-center items-center gap-4">
                <h2 className="text-lg font-semibold">Are you sure you want to delete "{recipeName}"?</h2>
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


export default DeleteConfirmationModal;