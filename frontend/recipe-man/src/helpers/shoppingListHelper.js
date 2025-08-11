const checkMerge = (newIngredient, list) => {
    for (var i = 0; i < list.ingredients.length; i++) {
        const ing = list.ingredients[i]
        if (ing.id !== newIngredient.id && ing.name_id === newIngredient.name_id) {
            //Handle merging different units here
            if (ing.unit_id === newIngredient.unit_id) {
                return { ...ing, measurement_qty: (Number(ing.measurement_qty) + Number(newIngredient.measurement_qty)) }
            }
        }
    }
    return null;
}




export const editListIngredient = (newVals, list, listId, uid, accessToken) => {
    const mergedVals = checkMerge(newVals, list);
    if (mergedVals) {
        return Promise.all([
            fetch(`http://localhost:3000/api/users/${uid}/lists/${listId}/list_ingredients/${mergedVals.id}`, {
                method: 'PATCH',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },

                body: JSON.stringify({
                    qty: mergedVals.measurement_qty,
                    unit_id: mergedVals.unit_id,
                    ingredient_id: mergedVals.name_id
                })
            }),
            fetch(`http://localhost:3000/api/users/${uid}/lists/${listId}/list_ingredients/${newVals.id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                }
            })
        ])
    }
    return fetch(`http://localhost:3000/api/users/${uid}/lists/${listId}/list_ingredients/${newVals.id}`, {
        method: 'PATCH',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
        },

        body: JSON.stringify({
            qty: newVals.measurement_qty,
            unit_id: newVals.unit_id,
            ingredient_id: newVals.name_id
        })
    })
}




export const createListIngredient = (newVals, list, listId, uid, accessToken) => {
    const mergedVals = checkMerge(newVals, list);
    if (mergedVals) {
        return fetch(`http://localhost:3000/api/users/${uid}/lists/${listId}/list_ingredients/${mergedVals.id}`, {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            },

            body: JSON.stringify({
                qty: mergedVals.measurement_qty,
                unit_id: mergedVals.unit_id,
                ingredient_id: mergedVals.name_id
            })
        })
    }
    return fetch(`http://localhost:3000/api/users/${uid}/lists/${listId}/list_ingredients`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
        },

        body: JSON.stringify({
            qty: newVals.measurement_qty,
            unit_id: newVals.unit_id,
            ingredient_id: newVals.name_id
        })
    })
}