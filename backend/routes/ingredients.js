import { Router } from 'express';
const router = Router();
import pool from '../db.js';

router.get('/users/:uid/ingredients', async (req, res) => {
    try {
        const result = await pool.query('SELECT name, id FROM ingredients WHERE (user_id IS NULL OR user_id = $1) AND name LIKE $2', [req.params.uid, `${req.query.name || ''}%`]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching ingredients:', err);
        res.status(500).json({ error: 'Failed to fetch ingredients' });
    }
});

export default router;