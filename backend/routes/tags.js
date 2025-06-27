import { Router } from 'express';
const router = Router();
import pool from '../db.js';

router.get('/users/:uid/tags', async (req, res) => {
    try {
        const result = await pool.query('SELECT description, id FROM tags WHERE (user_id IS NULL OR user_id = $1) AND description LIKE $2', [req.params.uid, `${req.query.description || ''}%`]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching tags:', err);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

export default router;