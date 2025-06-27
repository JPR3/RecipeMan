import { Router } from 'express';
const router = Router();
import pool from '../db.js';

// GET /api/users/{id}
router.get('/users/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT username, created_at FROM users WHERE id = $1', [req.params.id]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// POST /api/users
router.post('/users', async (req, res) => {
    try {
        const username = req.body.username;
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }
        const result = await pool.query('INSERT INTO users (username) VALUES ($1) RETURNING *', [username]);
        res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
    } catch (err) {
        console.error('Error inserting user:', err);
        res.status(500).json({ error: 'Failed to create user' });
    }
});


export default router;