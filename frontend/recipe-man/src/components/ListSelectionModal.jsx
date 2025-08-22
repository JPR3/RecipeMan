import { useState } from "react";
import { useAuth } from "../AuthProvider"
import Modal from "./Modal";
import { createListIngredient } from "../helpers";

const ListSelectionModal = ({ openModal, closeModal, recipeData, lists }) => {
    const { session, user } = useAuth();
    const [selectedList, setSelectedList] = useState(null)
    const [scale, setScale] = useState(1)

    const accessToken = session?.access_token;
    const uid = user?.id;

    const handleSubmit = () => {
        fetch(`http://localhost:3000/api/users/${uid}/lists/${selectedList.id}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error("HTTP error status " + response.status);
            }
            return response.json();
        }).then(data => {
            Promise.all(recipeData.ingredients.map((ing) => {
                console.log(ing)
                return createListIngredient({ ...ing, name_id: ing.ingredient_id, measurement_qty: (ing.measurement_qty * scale), list_item_tags: [], global_tags: ing.tags }, data, selectedList.id, uid, accessToken)
            })).then(res => {
                closeListModal(true)
            })
        })

    }
    const closeListModal = (updated) => {
        setSelectedList(null);
        setScale(1)
        closeModal(updated)
    }
    return (
        <Modal openModal={openModal} closeModal={() => { closeListModal(false) }}>
            <div className="flex flex-col items-center gap-2 mb-4">
                <p className="text-2xl font-bold">Select List:</p>
                <div className="w-full">
                    {
                        lists.map((list, index) => (
                            <div
                                key={index}
                                className={"w-full border-border flex  px-1 pb-1 pt-1 hover:bg-fields cursor-pointer " + (index !== lists.length - 1 ? " border-b-2" : "") + (selectedList?.id === list.id ? " bg-fields" : "")}
                                onClick={() => { setSelectedList(list) }}
                            >
                                {list.title}
                            </div>
                        ))
                    }
                </div>
                <input
                    id="scale"
                    name="scale"
                    type="number"
                    min="0"
                    placeholder="1"
                    value={scale}
                    className="border border-border bg-fields text-content px-2 py-1 w-14 rounded-md focus:border-2"
                    onChange={(e) => setScale(e.target.value)}
                />
                <button
                    className={(selectedList ? "bg-primary hover:bg-primary-hv cursor-pointer" : "bg-button cursor-not-allowed") + " text-content border border-border rounded-2xl px-2 mb-2 mt-3"}
                    disabled={selectedList === null}
                    onClick={handleSubmit}>
                    {selectedList ? "Add Ingredients to " + selectedList.title : "Select a List"}
                </button>
            </div>
        </Modal>
    )
}


export default ListSelectionModal