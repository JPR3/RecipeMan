const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/users
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(`SELECT username, created_at FROM users WHERE id = \'${req.params.id}\'`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});


module.exports = router;