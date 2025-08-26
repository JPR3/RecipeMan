import { useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import { useAuth } from '../AuthProvider';
import ListItemDisplay from "../components/ListItemDisplay";
import { editListIngredient, createListIngredient } from "../helpers";
import RecipeSelectionModal from "../components/RecipeSelectionModal"

const ListDisplay = () => {
    const { session, user, loading } = useAuth();
    const [dataLoaded, setDataLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [list, setList] = useState(null);
    const [enableEdits, setEnableEdits] = useState(true)
    const [checkedIds, setCheckedIds] = useState([])
    const [recipeSelectionModal, setRecipeSelectionModal] = useState(false)
    const [recipes, setRecipes] = useState([])
    const [sortMenu, setSortMenu] = useState(false)
    const [sortValue, setSortValue] = useState(0)
    const [width, setWidth] = useState(0)
    if (loading) {
        return <div className="text-content p-4">Loading...</div>;
    }
    const accessToken = session?.access_token;
    const uid = user?.id;
    let params = useParams();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleResize = () => setWidth(window.innerWidth);
            window.addEventListener('resize', handleResize);
            handleResize();
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);
    useEffect(() => {
        if (recipeSelectionModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
            updateList();
        }
    }, [recipeSelectionModal]);
    useEffect(() => {
        updateList();
        fetch(`http://localhost:3000/api/users/${uid}/recipes`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => response.json()).then(data => {
            setRecipes(data);
        });
    }, [params.listId]);

    const setSortedList = (data, sortVal) => {
        const getFirstTags = (combinedTagsA, combinedTagsB) => {
            const firstA = combinedTagsA.reduce((minString, currentString) => {
                if (currentString.localeCompare(minString) < 0) {
                    return currentString;
                } else {
                    return minString;
                }
            });
            const firstB = combinedTagsB.reduce((minString, currentString) => {
                if (currentString.localeCompare(minString) < 0) {
                    return currentString;
                } else {
                    return minString;
                }
            });
            return [firstA, firstB]
        }
        let compareFunc
        switch (sortVal) {
            case 0:
                compareFunc = (a, b) => { return (a.name < b.name) ? -1 : 1 }
                break;
            case 1:
                compareFunc = (a, b) => { return (a.name > b.name) ? -1 : 1 }
                break;
            case 2:
                compareFunc = (a, b) => { return Date.parse(b.created_at) - Date.parse(a.created_at) }
                break;
            case 3:
                compareFunc = (a, b) => { return Date.parse(a.created_at) - Date.parse(b.created_at) }
                break;
            case 4:
                compareFunc = (a, b) => {
                    const combinedTagsA = [...a.list_item_tags.map((t) => t.description), ...a.global_tags.map((t) => t.description)]
                    const combinedTagsB = [...b.list_item_tags.map((t) => t.description), ...b.global_tags.map((t) => t.description)]
                    if (combinedTagsA.length === 0 || combinedTagsB.length === 0) {
                        return combinedTagsB.length - combinedTagsA.length
                    }
                    const [firstA, firstB] = getFirstTags(combinedTagsA, combinedTagsB)
                    return (firstA < firstB) ? -1 : 1
                }
                break;
            case 5:
                compareFunc = (a, b) => {
                    const combinedTagsA = [...a.list_item_tags.map((t) => t.description), ...a.global_tags.map((t) => t.description)]
                    const combinedTagsB = [...b.list_item_tags.map((t) => t.description), ...b.global_tags.map((t) => t.description)]
                    if (combinedTagsA.length === 0 || combinedTagsB.length === 0) {
                        return combinedTagsB.length - combinedTagsA.length
                    }
                    const [firstA, firstB] = getFirstTags(combinedTagsA, combinedTagsB)
                    return (firstA > firstB) ? -1 : 1
                }
                break;

        }
        setList({ ...data, ingredients: data.ingredients.toSorted(compareFunc) })
    }
    const updateList = () => {
        setDataLoaded(false);
        setError(null);
        fetch(`http://localhost:3000/api/users/${uid}/lists/${params.listId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error("HTTP error status " + response.status);
            }
            return response.json();
        }).then(data => {
            setSortedList(data, sortValue);
            setCheckedIds(data.ingredients.filter((ing) => ing.checked).map((ing) => ing.id))
            setDataLoaded(true);
            setError(null);
        }).catch(err => {
            setError(err);
        });
    }

    if (error) {
        return (
            <h1 className="text-content p-4 text-xl font-bold">Error: {error.message}</h1>
        );
    }
    if (!dataLoaded) {
        return (
            <div className="text-content p-4">Loading...</div>
        );
    }

    const handleCheckChange = (ingredientId, ingredientIndex) => {
        fetch(`http://localhost:3000/api/users/${uid}/lists/${params.listId}/list_ingredients/${ingredientId}`, {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify({ checked: !(list.ingredients[ingredientIndex].checked) })
        }).then(res => res.json().then(data => {
            setList({
                ...list, ingredients: list.ingredients.map((elem, index) => {
                    if (index !== ingredientIndex) {
                        return elem
                    }
                    if (elem.checked) {
                        setCheckedIds(checkedIds.filter((id) => id !== elem.id))
                    } else {
                        setCheckedIds([...checkedIds, elem.id])
                    }
                    return { ...elem, checked: !elem.checked }
                })
            })
        }))
    }
    const handleAddItem = () => {
        setList({ ...list, ingredients: [{ checked: false, id: "-1", measurement_qty: "", name: "", name_id: "-1", unit: "", unit_id: "", list_item_tags: [], global_tags: [] }, ...list.ingredients] })
    }
    const handleRemoveChecked = () => {
        const promises = checkedIds.map((id) => {
            return fetch(`http://localhost:3000/api/users/${uid}/lists/${params.listId}/list_ingredients/${id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                }
            })
        })
        Promise.all(promises).then(res => {
            updateList();
        })
    }
    const handleToggleAll = () => {
        if (checkedIds.length > 0) {
            //Deselect all
            const promises = checkedIds.map((id) => {
                fetch(`http://localhost:3000/api/users/${uid}/lists/${params.listId}/list_ingredients/${id}`, {
                    method: 'PATCH',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ checked: false })
                })
            })
            Promise.all(promises).then(() => {
                setList({
                    ...list, ingredients: list.ingredients.map((ing) => {
                        return { ...ing, checked: false }
                    })
                });
                setCheckedIds([])
            }
            )
        } else {
            //Select all
            const promises = list.ingredients.map((ing) => {
                fetch(`http://localhost:3000/api/users/${uid}/lists/${params.listId}/list_ingredients/${ing.id}`, {
                    method: 'PATCH',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ checked: true })
                })
            })
            Promise.all(promises).then(() => {
                setList({
                    ...list, ingredients: list.ingredients.map((ing) => {
                        return { ...ing, checked: true }
                    })
                });
                setCheckedIds(list.ingredients.map((ing) => ing.id))
            })
        }
    }
    const handleSortBlur = (event) => {
        if (!(event.relatedTarget && event.relatedTarget.id.startsWith("sort"))) {
            setSortMenu(false)
        }
    }
    const getSortText = (num) => {
        let text;
        switch (num) {
            case 0: case 1:
                text = "Alphabetical"
                break;
            case 2: case 3:
                text = "Date Added"
                break;
            case 4: case 5:
                text = "Tags"
                break;

        }
        return (
            <div className="flex items-center">
                <p>{text}</p>
                {
                    num % 2 == 0 ?
                        (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-up-short" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5" />
                        </svg>) :
                        (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-down-short" viewBox="0 -1 16 16">
                            <path fillRule="evenodd" d="M8 4a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5A.5.5 0 0 1 8 4" />
                        </svg>)
                }

            </div>
        )
    }
    const selectAll = (
        list.ingredients.length > 0 && (
            <div className="flex ml-2.5 gap-1 items-center">
                <input id="toggleAll" className="accent-primary cursor-pointer" type="checkbox" checked={checkedIds.length > 0} onChange={() => { if (enableEdits) { handleToggleAll() } }} />
                <label htmlFor="toggleAll">{checkedIds.length > 0 ? "Deselect All" : "Select All"}</label>
            </div>
        )
    )
    const addButton = (
        enableEdits ? (<button
            className="cursor-pointer border border-border rounded-2xl bg-primary hover:bg-primary-hv px-2 mb-2"
            onClick={() => handleAddItem()}>
            New+
        </button>) : (<button
            className="cursor-pointer border border-border rounded-2xl bg-red-600 hover:bg-red-700 px-2 mb-2"
            onClick={() => { setEnableEdits(true); updateList() }}>
            Cancel
        </button>)
    )
    const selectFromRecipe = (
        list.ingredients.length > 0 && (<button
            className={"border border-border rounded-2xl px-2 mb-2 " + (enableEdits ? "bg-primary hover:bg-primary-hv cursor-pointer" : "bg-button cursor-not-allowed")}
            disabled={!enableEdits}
            onClick={() => { setRecipeSelectionModal(true) }}>
            From Recipe+
        </button>)
    )
    const sortDropDown = (
        list.ingredients.length > 0 && (
            <div className="mb-2 relative min-w-30">
                <div className={"cursor-pointer flex gap-2 border-border pr-1 pl-2 items-center justify-between border-2 " + (enableEdits ? " bg-surface" : "bg-button") + (sortMenu ? " rounded-t-xl" : " rounded-full")}
                    onClick={() => { if (enableEdits) { setSortMenu(!sortMenu) } }}
                    onBlur={handleSortBlur}
                    tabIndex="0"
                >
                    {getSortText(sortValue)}
                    {
                        sortMenu ? (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-up" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z" />
                        </svg>) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-down" viewBox="0 -2 16 16">
                                <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                            </svg>)
                    }

                </div>
                {sortMenu && (
                    <div
                        className="z-10 absolute w-full"
                    >
                        {
                            [...Array(6).keys()].map((ind) => {
                                if (ind !== sortValue) {
                                    return (
                                        <div
                                            id={`sort-${ind}`}
                                            key={`sort-${ind}`}
                                            onKeyDownCapture={(e) => { if (e.key === "Enter") { setSortMenu(false); setSortValue(ind) } }}
                                            onClick={(e) => { setSortMenu(false); setSortValue(ind); setSortedList(list, ind) }}
                                            tabIndex="0"
                                            className={"w-full cursor-pointer border-r-2 border-l-2 border-border bg-surface text-content h-6.5 px-1 hover:bg-fields" + ((ind === 5 || (sortValue === 5 && ind === 4)) ? " border-b-2 rounded-b-xl" : "")}
                                        >
                                            {getSortText(ind)}
                                        </div>
                                    )
                                }

                            })
                        }

                    </div>


                )}
            </div>
        )
    )
    return (
        <div className="flex flex-col justify-start items-center w-full max-w-[1000px]">
            <RecipeSelectionModal
                openModal={recipeSelectionModal}
                closeModal={() => { setRecipeSelectionModal(false); }}
                recipes={recipes}
                createListIngredient={(newVals) => createListIngredient(newVals, list, params.listId, uid, accessToken)}
            />
            <h2 className="text-content p-4 text-4xl font-semibold">{list.title}</h2>
            {
                (width < 768 ? (
                    <div className={"flex flex-col w-full items-center justify-center content-center"}>
                        <div className={"flex w-full max-w-3/4 items-center justify-center gap-4"}>
                            {addButton}
                            {selectFromRecipe}
                        </div>
                        <div className={"flex w-full max-w-3/4 items-center justify-between"}>
                            {selectAll}
                            {sortDropDown}
                        </div>
                    </div>
                ) : (
                    <div className={"flex w-full max-w-3/4 items-center " + (list.ingredients.length > 0 ? "justify-between" : "justify-center")}>
                        {selectAll}
                        {addButton}
                        {selectFromRecipe}
                        {sortDropDown}
                    </div>))
            }



            {
                list.ingredients.map((ingredient, index) => (
                    <ListItemDisplay
                        key={index}
                        ingredient={ingredient}
                        index={index}
                        lastInd={list.ingredients.length - 1}
                        handleCheckChange={handleCheckChange}
                        listId={params.listId}
                        updateList={() => updateList()}
                        enableEdits={enableEdits}
                        setEnableEdits={setEnableEdits}
                        editListIngredient={(newVals) => editListIngredient(newVals, list, params.listId, uid, accessToken)}
                        createListIngredient={(newVals) => createListIngredient(newVals, list, params.listId, uid, accessToken)}
                    />
                ))
            }
            {
                list.ingredients.length > 0 && (
                    <button
                        className={(enableEdits ? "bg-primary hover:bg-primary-hv cursor-pointer" : "bg-button cursor-not-allowed") + " text-content border border-border rounded-2xl px-2 mb-2 mt-3"}
                        disabled={!enableEdits}
                        onClick={() => handleRemoveChecked()}>
                        Remove Selected Items
                    </button>
                )
            }

        </div >

    )
}

export default ListDisplay;