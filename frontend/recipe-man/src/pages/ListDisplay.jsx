import { useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import { useAuth } from '../AuthProvider';
import ListItemDisplay from "../components/ListItemDisplay";

const ListDisplay = () => {
    const { session, user, loading } = useAuth();
    const [dataLoaded, setDataLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [list, setList] = useState(null);
    const [enableEdits, setEnableEdits] = useState(true)
    if (loading) {
        return <div className="text-content p-4">Loading...</div>;
    }
    const accessToken = session?.access_token;
    const uid = user?.id;
    let params = useParams();

    useEffect(() => {
        updateList()
    }, [params.listId]);

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
            setList(data);
            console.log(data)
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
                    return { ...elem, checked: !elem.checked }
                })
            })
        }))
    }
    const handleAddItem = () => {
        setList({ ...list, ingredients: [{ checked: false, id: "-1", measurement_qty: 0, name: "", name_id: "-1", unit: "", unit_id: "" }, ...list.ingredients] })
    }
    return (
        <div className="flex flex-col justify-start items-center w-full px-16">
            <h2 className="text-content p-4 text-4xl font-semibold">{list.title}</h2>
            {enableEdits ? (<button
                className="cursor-pointer border border-border rounded-2xl bg-primary hover:bg-primary-hv px-2 mb-2"
                onClick={() => handleAddItem()}>
                Add+
            </button>) : (<button
                className="cursor-pointer border border-border rounded-2xl bg-red-600 hover:bg-red-700 px-2 mb-2"
                onClick={() => { setEnableEdits(true); updateList() }}>
                Cancel
            </button>)}

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
                    />
                ))
            }
        </div>

    )
}

export default ListDisplay;