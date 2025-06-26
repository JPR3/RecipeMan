import { Router } from 'express';
const router = Router();
import pool from '../db.js';

// GET /api/users/{id}
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(`SELECT username, created_at FROM users WHERE id = \'${req.params.id}\'`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});


export default router;