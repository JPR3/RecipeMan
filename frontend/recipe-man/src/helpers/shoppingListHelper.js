const familiesDict = {
    //Kilograms, Grams, Milligrams
    "0bd42772-0f5a-4fc6-b8df-9d1e92ed59d3": ["5cb494f8-1c63-4456-91cb-1764099b8a3d", "f8fdf552-c9db-4391-8064-f5a2fb6dc4df"],
    "5cb494f8-1c63-4456-91cb-1764099b8a3d": ["0bd42772-0f5a-4fc6-b8df-9d1e92ed59d3", "f8fdf552-c9db-4391-8064-f5a2fb6dc4df"],
    "f8fdf552-c9db-4391-8064-f5a2fb6dc4df": ["0bd42772-0f5a-4fc6-b8df-9d1e92ed59d3", "5cb494f8-1c63-4456-91cb-1764099b8a3d"],
    // Tablespoons, Teaspoons
    "ff18100e-b3d7-4232-a292-2e3bfbfd8884": ["3e4e6a8a-6c3e-41a0-8a2c-9a3fda345c88"],
    "3e4e6a8a-6c3e-41a0-8a2c-9a3fda345c88": ["ff18100e-b3d7-4232-a292-2e3bfbfd8884"],
    // Liters, Deciliters, Milliliters
    "f0ae06bb-e3c1-4c8d-9ef1-3f72808d59e3": ["4b97746b-3248-4889-aed4-846b0db3eaed", "b0e4f644-b0cc-4e98-8bca-5354ff8236d1"],
    "b0e4f644-b0cc-4e98-8bca-5354ff8236d1": ["4b97746b-3248-4889-aed4-846b0db3eaed", "f0ae06bb-e3c1-4c8d-9ef1-3f72808d59e3"],
    "4b97746b-3248-4889-aed4-846b0db3eaed": ["b0e4f644-b0cc-4e98-8bca-5354ff8236d1", "f0ae06bb-e3c1-4c8d-9ef1-3f72808d59e3"],
    // Gallons, Quarts, Pints, Cups
    "646e64fd-83c8-4a97-ac66-f0bfba327c38": ["afb8da81-dcf3-4993-8a50-6901d5fd24d1", "8cbc8029-9ad5-407f-bd0d-81383d2538e9", "e2e987bb-52e2-46d4-a9f5-463221dbe825"],
    "afb8da81-dcf3-4993-8a50-6901d5fd24d1": ["646e64fd-83c8-4a97-ac66-f0bfba327c38", "8cbc8029-9ad5-407f-bd0d-81383d2538e9", "e2e987bb-52e2-46d4-a9f5-463221dbe825"],
    "8cbc8029-9ad5-407f-bd0d-81383d2538e9": ["646e64fd-83c8-4a97-ac66-f0bfba327c38", "afb8da81-dcf3-4993-8a50-6901d5fd24d1", "e2e987bb-52e2-46d4-a9f5-463221dbe825"],
    "e2e987bb-52e2-46d4-a9f5-463221dbe825": ["646e64fd-83c8-4a97-ac66-f0bfba327c38", "afb8da81-dcf3-4993-8a50-6901d5fd24d1", "8cbc8029-9ad5-407f-bd0d-81383d2538e9"],
    // Pounds, Ounces
    "8aebf6e3-69cb-447c-b9c8-c099b24ecbd8": ["ca5f5293-90ef-46e2-930c-5406d7ae49f5"],
    "ca5f5293-90ef-46e2-930c-5406d7ae49f5": ["8aebf6e3-69cb-447c-b9c8-c099b24ecbd8"]
}

const reductionFactorDict = {
    //Kilograms, Grams, Milligrams
    "0bd42772-0f5a-4fc6-b8df-9d1e92ed59d3": 1000000,
    "5cb494f8-1c63-4456-91cb-1764099b8a3d": 1000,
    "f8fdf552-c9db-4391-8064-f5a2fb6dc4df": 1,
    //Tablespoons, Teaspoons
    "ff18100e-b3d7-4232-a292-2e3bfbfd8884": 3,
    "3e4e6a8a-6c3e-41a0-8a2c-9a3fda345c88": 1,
    // Liters, Deciliters, Milliliters
    "f0ae06bb-e3c1-4c8d-9ef1-3f72808d59e3": 1000,
    "b0e4f644-b0cc-4e98-8bca-5354ff8236d1": 100,
    "4b97746b-3248-4889-aed4-846b0db3eaed": 1,
    // Gallons, Quarts, Pints, Cups
    "646e64fd-83c8-4a97-ac66-f0bfba327c38": 16,
    "afb8da81-dcf3-4993-8a50-6901d5fd24d1": 4,
    "8cbc8029-9ad5-407f-bd0d-81383d2538e9": 2,
    "e2e987bb-52e2-46d4-a9f5-463221dbe825": 1,
    // Pounds, Ounces
    "8aebf6e3-69cb-447c-b9c8-c099b24ecbd8": 16,
    "ca5f5293-90ef-46e2-930c-5406d7ae49f5": 1
}

const checkFamily = (unitId1, unitId2) => {
    const famArray = familiesDict[unitId1]
    if (famArray) {
        return famArray.includes(unitId2)
    }
    return false
}
const checkMerge = (newIngredient, list) => {
    for (var i = 0; i < list.ingredients.length; i++) {
        const ing = list.ingredients[i]
        if (ing.id !== newIngredient.id && ing.name_id === newIngredient.name_id) {
            if (ing.unit_id === newIngredient.unit_id) {
                return { ...ing, measurement_qty: (Number(ing.measurement_qty) + Number(newIngredient.measurement_qty)), list_item_tags: [...new Set([...ing.list_item_tags, ...newIngredient.list_item_tags])] }
            } else if (checkFamily(ing.unit_id, newIngredient.unit_id)) {
                //Handle merging different units
                const ingFactor = reductionFactorDict[ing.unit_id]
                const newIngredientFactor = reductionFactorDict[newIngredient.unit_id]
                if (ingFactor > newIngredientFactor) {
                    //Ing has the larger unit type, so keep that one
                    return {
                        ...ing,
                        measurement_qty: ((Number(ing.measurement_qty) * ingFactor) + (Number(newIngredient.measurement_qty) * newIngredientFactor)) / ingFactor,
                        list_item_tags: [...new Set([...ing.list_item_tags, ...newIngredient.list_item_tags])]
                    }
                } else {
                    //newIngredient has the larger unit type, so keep that one
                    return {
                        ...ing,
                        unit_id: newIngredient.unit_id,
                        unit_name: newIngredient.unit_name,
                        measurement_qty: ((Number(ing.measurement_qty) * ingFactor) + (Number(newIngredient.measurement_qty) * newIngredientFactor)) / newIngredientFactor,
                        list_item_tags: [...new Set([...ing.list_item_tags, ...newIngredient.list_item_tags])]
                    }
                }
            }
        }
    }
    return null;
}




export const editListIngredient = async (newVals, list, listId, uid, accessToken) => {
    const mergedVals = checkMerge(newVals, list);
    if (mergedVals) {
        await fetch(`http://localhost:3000/api/users/${uid}/lists/${listId}/list_ingredients/${mergedVals.id}/tags`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        })
        const tagPromiseArr = mergedVals.list_item_tags.map((tag, index) => {
            return fetch(`http://localhost:3000/api/users/${uid}/lists/${listId}/list_ingredients/${mergedVals.id}/tags`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },

                body: JSON.stringify({
                    tag_id: tag.id
                })
            })
        })
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
            }),

            ...tagPromiseArr
        ])
    }
    await fetch(`http://localhost:3000/api/users/${uid}/lists/${listId}/list_ingredients/${newVals.id}/tags`, {
        method: 'DELETE',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
        }
    })
    const tagPromiseArr = newVals.list_item_tags.map((tag, index) => {
        return fetch(`http://localhost:3000/api/users/${uid}/lists/${listId}/list_ingredients/${newVals.id}/tags`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            },

            body: JSON.stringify({
                tag_id: tag.id
            })
        })
    })
    return Promise.all([
        fetch(`http://localhost:3000/api/users/${uid}/lists/${listId}/list_ingredients/${newVals.id}`, {
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
        }),

        ...tagPromiseArr
    ])
}




export const createListIngredient = async (newVals, list, listId, uid, accessToken) => {
    const mergedVals = checkMerge(newVals, list);
    if (mergedVals) {
        await fetch(`http://localhost:3000/api/users/${uid}/lists/${listId}/list_ingredients/${mergedVals.id}/tags`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        })
        const tagPromiseArr = mergedVals.list_item_tags.map((tag, index) => {
            return fetch(`http://localhost:3000/api/users/${uid}/lists/${listId}/list_ingredients/${mergedVals.id}/tags`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },

                body: JSON.stringify({
                    tag_id: tag.id
                })
            })
        })
        return Promise.all([fetch(`http://localhost:3000/api/users/${uid}/lists/${listId}/list_ingredients/${mergedVals.id}`, {
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
        ...tagPromiseArr])
    }
    const res = await fetch(`http://localhost:3000/api/users/${uid}/lists/${listId}/list_ingredients`, {
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
    const data = await res.json()
    const tagPromiseArr = newVals.list_item_tags.map((tag, index) => {
        return fetch(`http://localhost:3000/api/users/${uid}/lists/${listId}/list_ingredients/${data.item.id}/tags`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            },

            body: JSON.stringify({
                tag_id: tag.id
            })
        })
    })
    return Promise.all(tagPromiseArr)
}