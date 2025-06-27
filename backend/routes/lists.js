import { Router } from 'express';
const router = Router();
import pool, { owns_ingredient, owns_unit, owns_tag, owns_list, list_owns_ingredient } from '../db.js';

// GET /api/users/:uid/lists
router.get('/users/:uid/lists', async (req, res) => {
    try {
        const result = await pool.query('SELECT title, created_at FROM shopping_lists WHERE user_id = $1', [req.params.uid]);
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
        const ingredients_result = await pool.query(`WITH ing_table AS (SELECT list_ingredients.id AS ingredient_id, ingredients.name, list_ingredients.measurement_qty, measurement_units.unit
            FROM list_ingredients INNER JOIN ingredients ON ingredients.id = list_ingredients.ingredient_id INNER JOIN measurement_units ON list_ingredients.measurement_unit_id = measurement_units.id WHERE list_ingredients.list_id =  $1)
            SELECT ing_table.name, ing_table.measurement_qty, ing_table.unit, array_agg(tags.description) AS tags FROM ing_table LEFT JOIN list_tags ON list_tags.list_id = ing_table.ingredient_id LEFT JOIN tags ON list_tags.tag_id = tags.id
            GROUP BY ing_table.name, ing_table.measurement_qty, ing_table.unit;`, [req.params.id]);
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

export default router;