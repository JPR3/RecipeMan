const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/recipes
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(`SELECT title, cook_time, instructions, notes, created_at FROM recipes WHERE id = \'${req.params.id}\'`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching recipe:', err);
        res.status(500).json({ error: 'Failed to fetch recipe' });
    }
});


module.exports = router;