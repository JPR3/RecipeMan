import { Router } from 'express';
const router = Router();
import pool from '../db.js';
// GET /api/users/:uid/tags
router.get('/users/:uid/tags', async (req, res) => {
    try {
        const result = await pool.query('SELECT description AS name, id FROM tags WHERE (user_id IS NULL OR user_id = $1) AND description LIKE $2', [req.params.uid, `${req.query.name || ''}%`]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching tags:', err);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});
// GET /api/users/:uid/tags/custom
router.get('/users/:uid/tags/custom', async (req, res) => {
    try {
        const result = await pool.query('SELECT description AS name, id FROM tags WHERE user_id = $1 AND description LIKE $2', [req.params.uid, `${req.query.name || ''}%`]);
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
// PATCH /api/users/:uid/tags/:id
router.patch('/users/:uid/tags/:id', async (req, res) => {
    try {
        const description = req.body.description;
        if (!description) {
            return res.status(400).json({ error: 'Description is required' });
        }
        const ownership_result = await pool.query('SELECT id FROM tags WHERE id = $1 AND user_id = $2', [req.params.id, req.params.uid]);
        if (ownership_result.rows.length === 0) {
            return res.status(403).json({ error: 'Forbidden - user must own the tag' });
        }
        const result = await pool.query('UPDATE tags SET description = $1 WHERE id = $2 RETURNING *', [description, req.params.id]);
        res.json({ message: 'Tag updated successfully', tag: result.rows[0] });
    } catch (err) {
        console.error('Error updating tag:', err);
        res.status(500).json({ error: 'Failed to update tag' });
    }
});
// DELETE /api/users/:uid/tags/:id
router.delete('/users/:uid/tags/:id', async (req, res) => {
    try {
        const ownership_result = await pool.query('SELECT id FROM tags WHERE id = $1 AND user_id = $2', [req.params.id, req.params.uid]);
        if (ownership_result.rows.length === 0) {
            return res.status(403).json({ error: 'Forbidden - user must own the tag' });
        }
        await pool.query('DELETE FROM tags WHERE id = $1', [req.params.id]);
        res.json({ message: 'Tag deleted successfully' });
    } catch (err) {
        console.error('Error deleting tag:', err);
        res.status(500).json({ error: 'Failed to delete tag' });
    }
});
export default router;