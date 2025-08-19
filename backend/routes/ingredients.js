import { Router } from 'express';
const router = Router();
import pool, { owns_ingredient, owns_tag } from '../db.js';
// GET /api/users/:uid/ingredients
router.get('/users/:uid/ingredients', async (req, res) => {
    try {
        const result = await pool.query('SELECT name, id FROM ingredients WHERE (user_id IS NULL OR user_id = $1) AND name LIKE $2', [req.params.uid, `${req.query.name || ''}%`]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching ingredients:', err);
        res.status(500).json({ error: 'Failed to fetch ingredients' });
    }
});
// GET /api/users/:uid/ingredients/custom
router.get('/users/:uid/ingredients/custom', async (req, res) => {
    try {
        const result = await pool.query('SELECT name, id FROM ingredients WHERE user_id = $1 AND name LIKE $2', [req.params.uid, `${req.query.name || ''}%`]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching ingredients:', err);
        res.status(500).json({ error: 'Failed to fetch ingredients' });
    }
});
// GET /api/users/:uid/ingredients/:id/tags
router.get('/users/:uid/ingredients/:id/tags', async (req, res) => {
    try {
        const result = await pool.query('SELECT t.id, t.description FROM tags t JOIN ingredient_tags it ON t.id = it.tag_id WHERE it.ingredient_id = $1 AND it.user_id = $2', [req.params.id, req.params.uid]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching ingredient tags:', err);
        res.status(500).json({ error: 'Failed to fetch ingredient tags' });
    }
});

// POST /api/users/:uid/ingredients
router.post('/users/:uid/ingredients', async (req, res) => {
    try {
        const name = req.body.name;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const existingIngredient = await pool.query('SELECT id FROM ingredients WHERE (user_id = $1 OR user_id IS NULL) AND name = $2', [req.params.uid, name]);
        if (existingIngredient.rows.length > 0) {
            return res.status(400).json({ error: 'Ingredient already exists' });
        }
        const result = await pool.query('INSERT INTO ingredients (user_id, name) VALUES ($1, $2) RETURNING *', [req.params.uid, name]);
        res.status(201).json({ message: 'Ingredient created successfully', ingredient: result.rows[0] });
    } catch (err) {
        console.error('Error inserting ingredient:', err);
        res.status(500).json({ error: 'Failed to create ingredient' });
    }
});
// POST /api/users/:uid/ingredients/:id/tags
router.post('/users/:uid/ingredients/:id/tags', async (req, res) => {
    try {
        const tag_id = req.body.tag_id;
        if (!tag_id) {
            return res.status(400).json({ error: 'Tag ID is required' });
        }
        if (!await owns_tag(req.params.uid, tag_id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the tag' });
        }
        if (!await owns_ingredient(req.params.uid, req.params.id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the ingredient' });
        }
        const result = await pool.query('INSERT INTO ingredient_tags (ingredient_id, tag_id, user_id) VALUES ($1, $2, $3) RETURNING *', [req.params.id, tag_id, req.params.uid]);
        res.status(201).json({ message: 'Tag added successfully', ingredient_tag: result.rows[0] });
    } catch (err) {
        console.error('Error inserting ingredient tag:', err);
        res.status(500).json({ error: 'Failed to add ingredient tag' });
    }
});
// PATCH /api/users/:uid/ingredients/:id
router.patch('/users/:uid/ingredients/:id', async (req, res) => {
    try {
        const name = req.body.name;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const ownership_result = await pool.query('SELECT id FROM ingredients WHERE id = $1 AND user_id = $2', [req.params.id, req.params.uid]);
        if (ownership_result.rows.length === 0) {
            return res.status(403).json({ error: 'Forbidden - user must own the ingredient' });
        }
        const result = await pool.query('UPDATE ingredients SET name = $1 WHERE id = $2 RETURNING *', [name, req.params.id]);
        res.json({ message: 'Ingredient updated successfully', ingredient: result.rows[0] });
    } catch (err) {
        console.error('Error updating ingredient:', err);
        res.status(500).json({ error: 'Failed to update ingredient' });
    }
});
// DELETE /api/users/:uid/ingredients/:id
router.delete('/users/:uid/ingredients/:id', async (req, res) => {
    try {
        const ownership_result = await pool.query('SELECT id FROM ingredients WHERE id = $1 AND user_id = $2', [req.params.id, req.params.uid]);
        if (ownership_result.rows.length === 0) {
            return res.status(403).json({ error: 'Forbidden - user must own the ingredient' });
        }
        await pool.query('DELETE FROM ingredients WHERE id = $1', [req.params.id]);
        res.json({ message: 'Ingredient deleted successfully' });
    } catch (err) {
        console.error('Error deleting ingredient:', err);
        res.status(500).json({ error: 'Failed to delete ingredient' });
    }
});
// DELETE /api/users/:uid/ingredients/:id/tags
router.delete('/users/:uid/ingredients/:id/tags', async (req, res) => {
    try {
        if (!await owns_tag(req.params.uid, tag_id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the tag' });
        }
        if (!await owns_ingredient(req.params.uid, req.params.id)) {
            return res.status(403).json({ error: 'Forbidden - user must own the ingredient' });
        }
        await pool.query('DELETE FROM ingredient_tags WHERE ingredient_id = $1 AND user_id = $3', [req.params.id, req.params.uid]);
        res.json({ message: 'Tag removed successfully from ingredient' });
    } catch (err) {
        console.error('Error deleting ingredient tag:', err);
        res.status(500).json({ error: 'Failed to remove ingredient tag' });
    }
});
export default router;