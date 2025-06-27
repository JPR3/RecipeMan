import { Router } from 'express';
const router = Router();
import pool from '../db.js';

// GET /api/users/:uid/lists
router.get('/users/:uid/lists', async (req, res) => {
    try {
        const result = await pool.query('SELECT title, created_at FROM shopping_lists WHERE user_id = $1', [req.params.uid]);
        res.json(result.rows[0]);
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

export default router;