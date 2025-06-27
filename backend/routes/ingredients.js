import { Router } from 'express';
const router = Router();
import pool from '../db.js';
// GET /api/users/:uid/ingredients
router.get('/users/:uid/ingredients', async (req, res) => {
    try {
        const result = await pool.query('SELECT name, id FROM ingredients WHERE (user_id IS NULL OR user_id = $1) AND name LIKE $2', [req.params.uid, `${req.query.name || ''}%`]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching ingredients:', err);
        res.status(500).json({ error: 'Failed to fetch ingredients' });
    }
});
// POST /api/users/:uid/ingredients
router.post('/users/:uid/ingredients', async (req, res) => {
    try {
        const name = req.body.name;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const existingIngredient = await pool.query('SELECT id FROM ingredients WHERE (user_id = $1 OR user_id IS NULL) AND name = $2', [req.params.uid, name]);
        if (existingIngredient.rows.length > 0) {
            return res.status(400).json({ error: 'Ingredient already exists' });
        }
        const result = await pool.query('INSERT INTO ingredients (user_id, name) VALUES ($1, $2) RETURNING *', [req.params.uid, name]);
        res.status(201).json({ message: 'Ingredient created successfully', ingredient: result.rows[0] });
    } catch (err) {
        console.error('Error inserting ingredient:', err);
        res.status(500).json({ error: 'Failed to create ingredient' });
    }
});

export default router;