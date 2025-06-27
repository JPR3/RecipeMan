import { Router } from 'express';
const router = Router();
import pool from '../db.js';

router.get('/users/:uid/units', async (req, res) => {
    try {
        const result = await pool.query('SELECT unit, id FROM measurement_units WHERE (user_id IS NULL OR user_id = $1) AND unit LIKE $2', [req.params.uid, `${req.query.unit || ''}%`]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching units:', err);
        res.status(500).json({ error: 'Failed to fetch units' });
    }
});

export default router;