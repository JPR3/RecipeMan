import { useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import { useAuth } from '../AuthProvider';

const ListDisplay = () => {
    const { session, user, loading } = useAuth();
    const [dataLoaded, setDataLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [list, setList] = useState(null);
    if (loading) {
        return <div className="text-content p-4">Loading...</div>;
    }
    const accessToken = session?.access_token;
    const uid = user?.id;
    let params = useParams();

    useEffect(() => {
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
            setDataLoaded(true);
            setError(null);
        }).catch(err => {
            setError(err);
        });
    }, [params.listId]);

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
    return (
        <div className="flex flex-col justify-start items-center w-full gap-2">
            <h2 className="text-content p-4 text-4xl font-semibold">{list.title}</h2>
            {
                list.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2 items-center w-full p-2 border-b border-border">
                        <input className="accent-primary cursor-pointer" type="checkbox" checked={ingredient.checked} onChange={() => handleCheckChange(ingredient.id, index)} />
                        <span className="text-content">{ingredient.name}</span>
                        <span className="text-content">{ingredient.measurement_qty} {ingredient.unit}</span>
                        <span className="text-content">{ingredient.tags.join(', ')}</span>
                    </div>
                ))
            }
        </div>

    )
}

export default ListDisplay;