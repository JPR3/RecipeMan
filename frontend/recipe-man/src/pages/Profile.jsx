import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';
import supabase from '../components/SupabaseClient';
import UserElementDisplay from '../components/UserElementDisplay';
import DeleteElementModal from '../components/DeleteElementModal';
import NewElementModal from '../components/NewElementModal';
import EditElementModal from '../components/EditElementModal';
const Profile = () => {
    const [username, setUsername] = useState('');
    const [tab, setTab] = useState("tags");
    const [tags, setTags] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [units, setUnits] = useState([]);
    const [deleteModal, setDeleteModal] = useState(false);
    const [newModal, setNewModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [editElement, setEditElement] = useState(null);
    const [deleteElement, setDeleteElement] = useState(null);
    const [searchValue, setSearchValue] = useState('');
    const { session, user, loading } = useAuth();
    if (loading) {
        return <div className="text-content p-4">Loading...</div>;
    }

    const accessToken = session?.access_token;
    const uid = user?.id;

    React.useEffect(() => {
        if (!deleteModal && !newModal && !editModal) {
            fetch(`http://localhost:3000/api/users/${uid}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }).then(response => response.json()).then(data => {
                setUsername(data.username);
            });
            fetch(`http://localhost:3000/api/users/${uid}/tags/custom?` + new URLSearchParams({ name: searchValue.toLowerCase().trim() }).toString(), {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }).then(response => response.json()).then(data => {
                setTags(data);
            });

            fetch(`http://localhost:3000/api/users/${uid}/ingredients/custom?` + new URLSearchParams({ name: searchValue.toLowerCase().trim() }).toString(), {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }).then(response => response.json()).then(data => {
                setIngredients(data);
            });

            fetch(`http://localhost:3000/api/users/${uid}/units/custom?` + new URLSearchParams({ name: searchValue.toLowerCase().trim() }).toString(), {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }).then(response => response.json()).then(data => {
                setUnits(data);
            });
        }

    }, [accessToken, deleteModal, newModal, editModal, searchValue, tab]);

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
    }

    return (
        <div className="flex flex-col justify-start items-center w-full">
            <div className="grid gap-9 justify-center border border-border shadow-lg bg-surface p-6 mb-4 rounded-md max-w-md">
                <h1 className="text-2xl w-full">Profile</h1>
                <p className="text-content">This is your profile page, {username}</p>
            </div>
            <div className="flex flex-h content-center items-center rounded-md border border-border focus-within:outline-2 focus-within:outline-primary px-1 bg-fields text-content h-6.5 max-w-1/8">
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-full text-content"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
                {searchValue && searchValue.length > 0 &&
                    <svg onClick={() => setSearchValue("")} xmlns="http://www.w3.org/2000/svg" width="25" height="25" className="bi bi-x fill-content hover:fill-red-700 cursor-pointer" viewBox="0 0 16 16">
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                    </svg>
                }
            </div>

            <div className="w-full flex justify-center items-end max-w-1/2">
                <div className="border-b-2 border-border w-full"></div>
                <h2
                    className={"text-xl text-content mt-4 border-border border-t-2 border-r-2 border-l-2 rounded-tl-md px-2 cursor-pointer" + (tab === "tags" ? " pb-0.5 bg-surface font-semibold text-primary" : " border-b-2 text-content")}
                    onClick={() => setTab("tags")}
                >
                    Tags
                </h2>
                <h2
                    className={"text-xl mt-4 border-border border-t-2 px-2 cursor-pointer" + (tab === "ingredients" ? " pb-0.5 bg-surface font-semibold text-primary" : " border-b-2 text-content")}
                    onClick={() => setTab("ingredients")}
                >
                    Ingredients
                </h2>
                <h2
                    className={"text-xl text-content mt-4 border-border border-t-2 border-r-2 border-l-2 rounded-tr-md px-2 cursor-pointer" + (tab === "units" ? " pb-0.5 bg-surface font-semibold text-primary" : " border-b-2 text-content")}
                    onClick={() => setTab("units")}
                >
                    Units
                </h2>
                <div className="border-b-2 border-border w-full rotate-180 rounded-b-md"></div>
            </div>
            <DeleteElementModal
                openModal={deleteModal}
                closeModal={() => setDeleteModal(false)}
                elementId={deleteElement?.id}
                elementName={deleteElement?.name}
                elementType={tab}
            />
            <NewElementModal
                openModal={newModal}
                closeModal={() => setNewModal(false)}
                elementType={tab}
            />
            <EditElementModal
                openModal={editModal}
                closeModal={() => setEditModal(false)}
                elementType={tab}
                elementName={editElement?.name}
                elementId={editElement?.id}
            />
            <div className="w-full max-h-dvh overflow-auto bg-surface max-w-1/2 border-b-2 border-r-2 border-l-2 border-border rounded-b-md">
                <div className={"flex px-2 py-1 w-full justify-center items-center " +
                    (tab === "tags" && tags.length > 0 ? "border-b-2 border-border" :
                        (tab === "ingredients" && ingredients.length > 0 ? "border-b-2 border-border" :
                            (tab === "units" && units.length > 0 ? "border-b-2 border-border" : "")))}>
                    <button
                        className="cursor-pointer border border-border rounded-2xl bg-primary hover:bg-primary-hv px-2"
                        onClick={() => setNewModal(true)}>
                        New+
                    </button>
                </div>
                {tab === "tags" && tags.map((tag, ind) => {
                    return (
                        <UserElementDisplay
                            key={tag.id}
                            element={tag}
                            borderStyle={ind < tags.length - 1 ? "border-b-2 border-border" : ""}
                            elementType="tags"
                            onEdit={(element) => { setEditElement(element); setEditModal(true); }}
                            onDelete={(element) => { setDeleteElement(element); setDeleteModal(true); }}
                        />
                    )
                })}
                {tab === "ingredients" && ingredients.map((ingredient, ind) => {
                    return (
                        <UserElementDisplay
                            key={ingredient.id}
                            element={ingredient}
                            borderStyle={ind < ingredients.length - 1 ? "border-b-2 border-border" : ""}
                            elementType="ingredients"
                            onEdit={(element) => { setEditElement(element); setEditModal(true); }}
                            onDelete={(element) => { setDeleteElement(element); setDeleteModal(true); }}
                        />
                    )
                })}
                {tab === "units" && units.map((unit, ind) => {
                    return (
                        <UserElementDisplay
                            key={unit.id}
                            element={unit}
                            borderStyle={ind < units.length - 1 ? "border-b-2 border-border" : ""}
                            elementType="units"
                            onEdit={(element) => { setEditElement(element); setEditModal(true); }}
                            onDelete={(element) => { setDeleteElement(element); setDeleteModal(true); }}
                        />
                    )
                })}

            </div>
            <button className="text-content bg-red-700 hover:bg-red-800 font-semibold py-2 px-4 rounded-md mt-4 mb-4" onClick={() => {
                handleSignOut()
            }}>
                Sign Out
            </button>
        </div>
    );
}

export default Profile;