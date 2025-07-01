import { Router } from 'express';
const router = Router();
import pool, { owns_ingredient, owns_recipe, owns_tag, owns_unit } from '../db.js';

// GET /api/users/recipes
router.get('/users/:uid/recipes', async (req, res) => {
    try {
        const result = await pool.query('SELECT title, created_at, id FROM recipes WHERE user_id = $1', [req.params.uid]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching recipes:', err);
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
});
// GET /api/users/{uid}/recipes/{id}
router.get('/users/:uid/recipes/:id', async (req, res) => {
    try {
        const recipe_result = await pool.query('SELECT title, cook_time, instructions, notes, created_at, recipes.id FROM recipes LEFT JOIN recipe_tags ON recipes.id = recipe_tags.recipe_id WHERE recipes.id = $1 AND recipes.user_id = $2', [req.params.id, req.params.uid]);
        const ing_sql = `SELECT name, measurement_qty, unit, ingredients.id AS ingredient_id, array_agg(DISTINCT tags.description) AS tags
                        FROM recipe_ingredients 
                        LEFT JOIN ingredients ON ingredients.id = recipe_ingredients.ingredient_id 
                        LEFT JOIN measurement_units ON recipe_ingredients.measurement_unit_id = measurement_units.id
                        LEFT JOIN ingredient_tags ON recipe_ingredients.ingredient_id = ingredient_tags.ingredient_id AND ingredient_tags.user_id = $2
                        LEFT JOIN tags ON ingredient_tags.tag_id = tags.id
                        WHERE recipe_id = $1 AND ingredient_tags.user_id = $2
                        GROUP BY ingredients.name, measurement_qty, ingredients.id, unit;`
        const ingredients_result = await pool.query(ing_sql, [req.params.id, req.params.uid]);
        const tag_result = await pool.query('SELECT description FROM tags LEFT JOIN recipe_tags ON tags.id = recipe_tags.tag_id WHERE recipe_tags.recipe_id = $1', [req.params.id]);
        recipe_result.rows[0].ingredients = ingredients_result.rows;
        recipe_result.rows[0].tags = tag_result.rows;
        res.json(recipe_result.rows[0]);
    } catch (err) {
        console.error('Error fetching recipe:', err);
        res.status(500).json({ error: 'Failed to fetch recipe' });
    }
});
// POST /api/user/:uid/recipes
router.post('/users/:uid/recipes', async (req, res) => {
    try {
        const title = req.body.title;
        const cook_time = req.body.cook_time;
        const instructions = req.body.instructions;
        const notes = req.body.notes || '';
        if (!title || !cook_time || !instructions) {
            return res.status(400).json({ error: 'Title, cook time, and instructions are required' });
        }
        const result = await pool.query('INSERT INTO recipes (user_id, title, cook_time, instructions, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *', [req.params.uid, title, cook_time, instructions, notes]);
        res.status(201).json({ message: 'Recipe created successfully', recipe: result.rows[0] });
    } catch (err) {
        console.error('Error inserting recipe:', err);
        res.status(500).json({ error: 'Failed to create recipe' });
    }
});
// POST /api/user/:uid/recipes/{id}/recipe_ingredients
router.post('/users/:uid/recipes/:id/recipe_ingredients', async (req, res) => {
    try {
        if (!await owns_recipe(req.params.uid, req.params.id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the recipe' });
        }
        if (!await owns_unit(req.params.uid, req.body.unit_id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the measurement unit' });
        }
        if (!await owns_ingredient(req.params.uid, req.body.ingredient_id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the ingredient' });
        }
        const ingredient_id = req.body.ingredient_id;
        const qty = req.body.qty;
        const unit_id = req.body.unit_id;
        if (!ingredient_id || !qty || !unit_id) {
            return res.status(400).json({ error: 'Ingredient ID, measurement quantity, and measurement unit ID are required' });
        }
        const result = await pool.query('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, measurement_qty, measurement_unit_id) VALUES ($1, $2, $3, $4) RETURNING *', [req.params.id, ingredient_id, qty, unit_id]);
        res.status(201).json({ message: 'Recipe ingredient added successfully', recipe_ingredient: result.rows[0] });
    } catch (err) {
        console.error('Error inserting recipe ingredient:', err);
        res.status(500).json({ error: 'Failed to add recipe ingredient' });
    }
});
// POST /api/user/:uid/recipes/{id}/tags
router.post('/users/:uid/recipes/:id/tags', async (req, res) => {
    try {
        if (!await owns_recipe(req.params.uid, req.params.id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the recipe' });
        }
        const tag_id = req.body.tag_id;
        if (!tag_id) {
            return res.status(400).json({ error: 'Tag ID is required' });
        }
        if (!await owns_tag(req.params.uid, tag_id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the tag' });
        }
        const result = await pool.query('INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ($1, $2)', [req.params.id, tag_id]);
        res.status(201).json({ message: 'Tag added successfully', recipe_tag: result.rows[0] });
    } catch (err) {
        console.error('Error inserting recipe tag:', err);
        res.status(500).json({ error: 'Failed to add recipe tag' });
    }
});
// PATCH /api/users/:uid/recipes/:id
router.patch('/users/:uid/recipes/:id', async (req, res) => {
    try {
        const { title, cook_time, instructions, notes } = req.body;
        if (!title && !cook_time && !instructions && !notes) {
            return res.status(400).json({ error: 'At least one field is required' });
        }
        if (!await owns_recipe(req.params.uid, req.params.id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the recipe' });
        }
        const result = await pool.query('UPDATE recipes SET title = COALESCE($1, title), cook_time = COALESCE($2, cook_time), instructions = COALESCE($3, instructions), notes = COALESCE($4, notes) WHERE id = $5 RETURNING *', [title, cook_time, instructions, notes, req.params.id]);
        res.json({ message: 'Recipe updated successfully', recipe: result.rows[0] });
    } catch (err) {
        console.error('Error updating recipe:', err);
        res.status(500).json({ error: 'Failed to update recipe' });
    }
});
// PATCH /api/users/:uid/recipes/:id/recipe_ingredients/:ri_id
router.patch('/users/:uid/recipes/:id/recipe_ingredients/:ri_id', async (req, res) => {
    try {
        const qty = req.body.qty;
        const unit_id = req.body.unit_id;
        const ingredient_id = req.body.ingredient_id;
        if (!qty || !unit_id || !ingredient_id) {
            return res.status(400).json({ error: 'Quantity, unit ID, and ingredient ID are required' });
        }
        if (!await owns_recipe(req.params.uid, req.params.id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the recipe' });
        }
        if (!await owns_unit(req.params.uid, unit_id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the measurement unit' });
        }
        if (!await owns_ingredient(req.params.uid, ingredient_id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the ingredient' });
        }
        const result = await pool.query('UPDATE recipe_ingredients SET measurement_qty = $1, measurement_unit_id = $2, ingredient_id = $3 WHERE id = $4 RETURNING *', [qty, unit_id, ingredient_id, req.params.ri_id]);
        res.json({ message: 'Recipe ingredient updated successfully', recipe_ingredient: result.rows[0] });
    } catch (err) {
        console.error('Error updating recipe ingredient:', err);
        res.status(500).json({ error: 'Failed to update recipe ingredient' });
    }
});
// DELETE /api/users/:uid/recipes/:id
router.delete('/users/:uid/recipes/:id', async (req, res) => {
    try {
        if (!await owns_recipe(req.params.uid, req.params.id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the recipe' });
        }
        await pool.query('DELETE FROM recipes WHERE id = $1', [req.params.id]);
        res.json({ message: 'Recipe deleted successfully' });
    } catch (err) {
        console.error('Error deleting recipe:', err);
        res.status(500).json({ error: 'Failed to delete recipe' });
    }
});
// DELETE /api/users/:uid/recipes/:id/recipe_ingredients/:ri_id
router.delete('/users/:uid/recipes/:id/recipe_ingredients/:ri_id', async (req, res) => {
    try {
        if (!await owns_recipe(req.params.uid, req.params.id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the recipe' });
        }
        await pool.query('DELETE FROM recipe_ingredients WHERE id = $1', [req.params.ri_id]);
        res.json({ message: 'Recipe ingredient deleted successfully' });
    } catch (err) {
        console.error('Error deleting recipe ingredient:', err);
        res.status(500).json({ error: 'Failed to delete recipe ingredient' });
    }
});
// DELETE /api/users/:uid/recipes/:id/tags
router.delete('/users/:uid/recipes/:id/tags', async (req, res) => {
    try {
        const tag_id = req.body.tag_id;
        if (!tag_id) {
            return res.status(400).json({ error: 'Tag ID is required' });
        }
        if (!await owns_recipe(req.params.uid, req.params.id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the recipe' });
        }
        await pool.query('DELETE FROM recipe_tags WHERE recipe_id = $1 AND tag_id = $2', [req.params.id, tag_id]);
        res.json({ message: 'Recipe tags deleted successfully' });
    } catch (err) {
        console.error('Error deleting recipe tags:', err);
        res.status(500).json({ error: 'Failed to delete recipe tags' });
    }
});
export default router;