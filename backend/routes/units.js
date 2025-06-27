import { Router } from 'express';
const router = Router();
import pool from '../db.js';
// GET /api/users/:uid/units
router.get('/users/:uid/units', async (req, res) => {
    try {
        const result = await pool.query('SELECT unit, id FROM measurement_units WHERE (user_id IS NULL OR user_id = $1) AND unit LIKE $2', [req.params.uid, `${req.query.unit || ''}%`]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching units:', err);
        res.status(500).json({ error: 'Failed to fetch units' });
    }
});
// POST /api/users/:uid/units
router.post('/users/:uid/units', async (req, res) => {
    try {
        const unit = req.body.unit;
        if (!unit) {
            return res.status(400).json({ error: 'Unit is required' });
        }
        const existingUnit = await pool.query('SELECT id FROM measurement_units WHERE (user_id = $1 OR user_id IS NULL) AND unit = $2', [req.params.uid, unit]);
        if (existingUnit.rows.length > 0) {
            return res.status(400).json({ error: 'Unit already exists' });
        }
        const result = await pool.query('INSERT INTO measurement_units (user_id, unit) VALUES ($1, $2) RETURNING *', [req.params.uid, unit]);
        res.status(201).json({ message: 'Unit created successfully', unit: result.rows[0] });
    } catch (err) {
        console.error('Error inserting unit:', err);
        res.status(500).json({ error: 'Failed to create unit' });
    }
});

export default router;