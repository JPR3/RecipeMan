import { Router } from 'express';
const router = Router();
import pool from '../db.js';
// GET /api/users/:uid/tags
router.get('/users/:uid/tags', async (req, res) => {
    try {
        const result = await pool.query('SELECT description, id FROM tags WHERE (user_id IS NULL OR user_id = $1) AND description LIKE $2', [req.params.uid, `${req.query.description || ''}%`]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching tags:', err);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});
// POST /api/users/:uid/tags
router.post('/users/:uid/tags', async (req, res) => {
    try {
        const description = req.body.description;
        if (!description) {
            return res.status(400).json({ error: 'Description is required' });
        }
        const existingTag = await pool.query('SELECT id FROM tags WHERE (user_id = $1 OR user_id IS NULL) AND description = $2', [req.params.uid, description]);
        if (existingTag.rows.length > 0) {
            return res.status(400).json({ error: 'Tag already exists' });
        }
        const result = await pool.query('INSERT INTO tags (user_id, description) VALUES ($1, $2) RETURNING *', [req.params.uid, description]);
        res.status(201).json({ message: 'Tag created successfully', tag: result.rows[0] });
    } catch (err) {
        console.error('Error inserting tag:', err);
        res.status(500).json({ error: 'Failed to create tag' });
    }
});

export default router;