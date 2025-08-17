import { Router } from 'express';
const router = Router();
import pool, { owns_ingredient, owns_unit, owns_tag, owns_list, list_owns_ingredient } from '../db.js';

// GET /api/users/:uid/lists
router.get('/users/:uid/lists', async (req, res) => {
    try {
        const result = await pool.query('SELECT title, created_at, id FROM shopping_lists WHERE user_id = $1', [req.params.uid]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching shopping lists:', err);
        res.status(500).json({ error: 'Failed to fetch shopping lists' });
    }
});
// GET /api/users/:uid/lists/:id
router.get('/users/:uid/lists/:id', async (req, res) => {
    try {
        const list_result = await pool.query('SELECT title, created_at FROM shopping_lists WHERE id = $1 AND user_id = $2', [req.params.id, req.params.uid]);
        if (list_result.rows.length === 0) {
            return res.status(404).json({ error: 'Shopping list not found' });
        }
        const ing_sql = `WITH ing_table AS (SELECT li.created_at, li.checked AS checked, li.id AS ingredient_id, i.id AS base_ingredient_id, i.name, li.measurement_qty, mu.name AS unit, mu.id AS unit_id FROM list_ingredients li INNER JOIN ingredients i ON i.id = li.ingredient_id INNER JOIN measurement_units mu ON li.measurement_unit_id = mu.id WHERE li.list_id = $1),
                    list_item_tags AS (SELECT lt.list_id AS ingredient_id, t.description FROM list_tags lt JOIN tags t ON t.id = lt.tag_id),
                    ingredient_level_tags AS (SELECT it.ingredient_id AS base_ingredient_id, t.description FROM ingredient_tags it JOIN tags t ON t.id = it.tag_id WHERE it.user_id = $2)
                    SELECT created_at, unit_id, ing_table.base_ingredient_id AS name_id, ing_table.ingredient_id AS id, checked, ing_table.name, ing_table.measurement_qty, ing_table.unit, array_agg(DISTINCT COALESCE(lit.description, ilt.description)) AS tags
                    FROM ing_table LEFT JOIN list_item_tags lit ON lit.ingredient_id = ing_table.ingredient_id LEFT JOIN ingredient_level_tags ilt ON ilt.base_ingredient_id = ing_table.base_ingredient_id
                    GROUP BY created_at, unit_id, name_id, id, checked, ing_table.name, ing_table.measurement_qty, ing_table.unit;`
        const ingredients_result = await pool.query(ing_sql, [req.params.id, req.params.uid]);
        list_result.rows[0].ingredients = ingredients_result.rows;
        res.json(list_result.rows[0]);
    } catch (err) {
        console.error('Error fetching shopping list:', err);
        res.status(500).json({ error: 'Failed to fetch shopping list' });
    }
});
//POST /api/users/:uid/lists
router.post('/users/:uid/lists', async (req, res) => {
    try {
        const title = req.body.title;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        const result = await pool.query('INSERT INTO shopping_lists (user_id, title) VALUES ($1, $2) RETURNING *', [req.params.uid, title]);
        res.status(201).json({ message: 'Shopping list created successfully', list: result.rows[0] });
    } catch (err) {
        console.error('Error inserting shopping list:', err);
        res.status(500).json({ error: 'Failed to create shopping list' });
    }
});
//POST /api/users/:uid/lists/:id/list_ingredients
router.post('/users/:uid/lists/:id/list_ingredients', async (req, res) => {
    try {
        const ingredient_id = req.body.ingredient_id;
        const qty = req.body.qty;
        const unit_id = req.body.unit_id;
        if (!ingredient_id || !qty || !unit_id) {
            return res.status(400).json({ error: 'Ingredient ID, quantity, and unit ID are required' });
        }
        if (!await owns_list(req.params.uid, req.params.id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the shopping list' });
        }
        if (!await owns_ingredient(req.params.uid, ingredient_id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the ingredient' });
        }
        if (!await owns_unit(req.params.uid, unit_id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the measurement unit' });
        }
        const result = await pool.query('INSERT INTO list_ingredients (list_id, ingredient_id, measurement_qty, measurement_unit_id) VALUES ($1, $2, $3, $4) RETURNING *', [req.params.id, ingredient_id, qty, unit_id]);
        res.status(201).json({ message: 'List ingredient added successfully', item: result.rows[0] });
    } catch (err) {
        console.error('Error inserting list ingredient:', err);
        res.status(500).json({ error: 'Failed to add list ingredient' });
    }
});
// POST /api/users/:uid/lists/:list_id/list_ingredients/:li_id/tags
router.post('/users/:uid/lists/:list_id/list_ingredients/:li_id/tags', async (req, res) => {
    try {
        if (!await owns_list(req.params.uid, req.params.list_id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the shopping list' });
        }
        const list_ingredient_id = req.params.li_id;
        const tag_id = req.body.tag_id;
        if (!tag_id) {
            return res.status(400).json({ error: 'Tag ID is required' });
        }
        if (!await owns_tag(req.params.uid, tag_id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the tag' });
        }
        if (!await list_owns_ingredient(req.params.list_id, list_ingredient_id)) {
            return res.status(403).json({ error: 'Forbidden - tag must be associated with an ingredient in the list' });
        }
        const result = await pool.query('INSERT INTO list_tags (list_id, tag_id) VALUES ($1, $2)', [list_ingredient_id, tag_id]);
        res.status(201).json({ message: 'Tag added successfully', list_tag: result.rows[0] });
    } catch (err) {
        console.error('Error inserting list tag:', err);
        res.status(500).json({ error: 'Failed to add list tag' });
    }
});
// PATCH /api/users/:uid/lists/:id
router.patch('/users/:uid/lists/:id', async (req, res) => {
    try {
        const title = req.body.title;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        if (!await owns_list(req.params.uid, req.params.id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the shopping list' });
        }
        const result = await pool.query('UPDATE shopping_lists SET title = $1 WHERE id = $2 RETURNING *', [title, req.params.id]);
        res.json({ message: 'Shopping list updated successfully', list: result.rows[0] });
    } catch (err) {
        console.error('Error updating shopping list:', err);
        res.status(500).json({ error: 'Failed to update shopping list' });
    }
});
//PATCH /api/users/:uid/lists/:list_id/list_ingredients/:li_id
router.patch('/users/:uid/lists/:list_id/list_ingredients/:li_id', async (req, res) => {
    try {
        const qty = req.body.qty;
        const unit_id = req.body.unit_id;
        const ingredient_id = req.body.ingredient_id;
        const checked = req.body.checked;
        if (!qty && !unit_id && !ingredient_id && (checked === undefined)) {
            return res.status(400).json({ error: 'At least one field must be provided' });
        }
        if (!await owns_list(req.params.uid, req.params.list_id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the shopping list' });
        }
        if (ingredient_id && !await owns_ingredient(req.params.uid, ingredient_id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the ingredient' });
        }
        if (unit_id && !await owns_unit(req.params.uid, unit_id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the measurement unit' });
        }
        if (!await list_owns_ingredient(req.params.list_id, req.params.li_id)) {
            return res.status(403).json({ error: 'Forbidden - ingredient must be part of the shopping list' });
        }
        const result = await pool.query('UPDATE list_ingredients SET measurement_qty = COALESCE($1, measurement_qty), measurement_unit_id = COALESCE($2, measurement_unit_id), ingredient_id = COALESCE($3, ingredient_id), checked = COALESCE($4, checked) WHERE id = $5 RETURNING *', [qty, unit_id, ingredient_id, checked, req.params.li_id]);
        res.json({ message: 'List ingredient updated successfully', item: result.rows[0] });
    } catch (err) {
        console.error('Error updating list ingredient:', err);
        res.status(500).json({ error: 'Failed to update list ingredient' });
    }
});
//DELETE /api/users/:uid/lists/:id
router.delete('/users/:uid/lists/:id', async (req, res) => {
    try {
        if (!await owns_list(req.params.uid, req.params.id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the shopping list' });
        }
        await pool.query('DELETE FROM shopping_lists WHERE id = $1', [req.params.id]);
        res.json({ message: 'Shopping list deleted successfully' });
    } catch (err) {
        console.error('Error deleting shopping list:', err);
        res.status(500).json({ error: 'Failed to delete shopping list' });
    }
});
//DELETE /api/users/:uid/lists/:list_id/list_ingredients/:li_id
router.delete('/users/:uid/lists/:list_id/list_ingredients/:li_id', async (req, res) => {
    try {
        if (!await owns_list(req.params.uid, req.params.list_id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the shopping list' });
        }
        if (!await list_owns_ingredient(req.params.list_id, req.params.li_id)) {
            return res.status(403).json({ error: 'Forbidden - ingredient must be part of the shopping list' });
        }
        await pool.query('DELETE FROM list_ingredients WHERE id = $1', [req.params.li_id]);
        res.json({ message: 'List ingredient deleted successfully' });
    } catch (err) {
        console.error('Error deleting list ingredient:', err);
        res.status(500).json({ error: 'Failed to delete list ingredient' });
    }
});
//DELETE /api/users/:uid/lists/:list_id/list_ingredients/:li_id/tags
router.delete('/users/:uid/lists/:list_id/list_ingredients/:li_id/tags', async (req, res) => {
    try {
        if (!await owns_list(req.params.uid, req.params.list_id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the shopping list' });
        }
        const list_ingredient_id = req.params.li_id;
        const tag_id = req.body.tag_id;
        if (!tag_id) {
            return res.status(400).json({ error: 'Tag ID is required' });
        }
        if (!await owns_tag(req.params.uid, tag_id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the tag' });
        }
        if (!await list_owns_ingredient(req.params.list_id, list_ingredient_id)) {
            return res.status(403).json({ error: 'Forbidden - tag must be associated with an ingredient in the list' });
        }
        await pool.query('DELETE FROM list_tags WHERE list_id = $1 AND tag_id = $2', [list_ingredient_id, tag_id]);
        res.json({ message: 'Tag removed successfully' });
    } catch (err) {
        console.error('Error deleting list tag:', err);
        res.status(500).json({ error: 'Failed to delete list tag' });
    }
});
export default router;