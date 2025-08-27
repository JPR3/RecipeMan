import { useEffect, useState } from "react";
import { useAuth } from "../AuthProvider";
import RecipeDropdown from "../components/RecipeDropdown";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NewRecipeModal from "../components/NewRecipeModal"
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import SearchableDropdown from "../components/SearchableDropdown";
import EditRecipeModal from "../components/EditRecipeModal";
import ListSelectionModal from "../components/ListSelectionModal";
import { ToastContainer, toast } from 'react-toastify';
const API_BASE = import.meta.env.VITE_API_BASE || '';

const Recipes = () => {
    const queryClient = new QueryClient();
    const [recipes, setRecipes] = useState([]);
    const { session, user, loading } = useAuth();
    const [searchValue, setSearchValue] = useState('');
    const [filterTags, setFilterTags] = useState([]);
    const [recipeModal, setRecipeModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteModalId, setDeleteModalId] = useState(null);
    const [editModal, setEditModal] = useState(false);
    const [editModalData, setEditModalData] = useState(null);
    const [listSelectionModal, setListSelectionModal] = useState(false);
    const [listSelectionData, setListSelectionData] = useState(null);
    const [lists, setLists] = useState([]);
    const [width, setWidth] = useState(0);
    if (loading) return <div>Loading...</div>;

    const accessToken = session?.access_token;
    const uid = user?.id;

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleResize = () => setWidth(window.innerWidth);
            window.addEventListener('resize', handleResize);
            handleResize();
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);
    useEffect(() => {
        fetch(`${API_BASE}/api/users/${uid}/lists`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => response.json()).then(data => {
            setLists(data);
        });
    }, [accessToken])
    useEffect(() => {
        if (!recipeModal && !deleteModal && !editModal) {
            document.body.style.overflow = 'auto';
            fetch(`${API_BASE}/api/users/${uid}/recipes`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }).then(response => response.json()).then(data => {
                setRecipes(data);
            });
        } else {
            document.body.style.overflow = 'hidden';
        }
    }, [accessToken, recipeModal, deleteModal, editModal]);

    const handleOpenDeleteModal = (recipeId) => {
        setDeleteModalId(recipeId);
        setDeleteModal(true);
    }
    const handleOpenEditModal = (recipeData) => {
        setEditModalData(recipeData);
        setEditModal(true);
    }
    const handleOpenListModal = (recipeData) => {
        setListSelectionData(recipeData);
        setListSelectionModal(true);
    }
    const processRecipes = (recipes) => {
        return recipes.filter(recipe =>
            recipe.title.toLowerCase().includes(searchValue.toLowerCase()) &&
            (filterTags.length === 0 || filterTags.every(tag => recipe.tags.some(t => t === tag.name)))
        );
    }
    const handleAddTag = (tagName, tagId) => {
        if (tagName && tagId) {
            setFilterTags([...filterTags, { name: tagName, id: tagId }]);
        }
    };
    const handleRemoveTag = (index) => {
        const localTags = [...filterTags];
        localTags.splice(index, 1);
        setFilterTags(localTags);
    };
    return (
        <div className={"flex flex-col justify-start items-center w-full gap-2 " + ((width < 768) ? "px-2" : "px-16")}>
            <ToastContainer position="top-center" autoClose={3000} hideProgressBar={true} toastStyle={{ color: "var(--color-content)", backgroundColor: "var(--color-background)" }} />
            <h1 className="text-5xl font-semibold text-content pb-4">Recipes</h1>
            <div className="flex gap-2 items-top justify-center">
                <div className="flex flex-col gap-1 max-w-3/8">
                    <SearchableDropdown
                        disableAdd={true}
                        ingredientPart="Tag"
                        apiPath="tags"
                        index="0"
                        onChangeEvent={(val, id) => handleAddTag(val, id)}
                        fieldValue={""}
                        existingIdsList={filterTags.map((tag) => (tag.id))}
                    />
                    <div className="flex flex-wrap gap-1 items-center mb-2">
                        {filterTags.map((tag, index) => (
                            <div key={tag.name} className="flex items-center bg-fields rounded-full">
                                <span className="text-content px-1.5 pb-0.5 text-sm">
                                    {tag.name}
                                </span>
                                <svg onClick={() => handleRemoveTag(index)} xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="bi bi-x fill-content hover:fill-red-700 cursor-pointer" viewBox="3 0 16 16">
                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                                </svg>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-h content-center items-center rounded-md border border-border focus-within:outline-2 focus-within:outline-primary px-1 bg-fields text-content h-6.5 max-w-3/8">
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
            </div>
            <button className="cursor-pointer border border-border rounded-2xl bg-primary hover:bg-primary-hv px-2" onClick={() => setRecipeModal(true)}>
                New+
            </button>
            <NewRecipeModal openModal={recipeModal} closeModal={() => setRecipeModal(false)}></NewRecipeModal>
            <EditRecipeModal openModal={editModal} closeModal={() => setEditModal(false)} recipeData={editModalData} />
            <DeleteConfirmationModal openModal={deleteModal} closeModal={() => setDeleteModal(false)} recipeId={deleteModalId} recipeName={recipes.find(recipe => recipe.id === deleteModalId)?.title} />
            <ListSelectionModal openModal={listSelectionModal} closeModal={(updated) => { setListSelectionModal(false); if (updated) { toast.success("Ingredients added Successfully!") } }} recipeData={listSelectionData} lists={lists} />
            <QueryClientProvider client={queryClient}>
                <div className="w-full flex flex-col gap-4 items-center mb-4">
                    {processRecipes(recipes).map((vals) => (
                        <RecipeDropdown
                            key={vals.id}
                            recipeName={vals.title}
                            recipeTags={vals.tags}
                            recipeId={vals.id}
                            openDeleteModal={() => handleOpenDeleteModal(vals.id)}
                            openEditModal={(data) => handleOpenEditModal(data)}
                            openListModal={(data) => handleOpenListModal(data)}
                            refreshTrigger={editModal && editModalData?.id === vals.id}
                            width={width}
                        />
                    ))}
                </div>
            </QueryClientProvider>
        </div>
    );
};

export default Recipes;