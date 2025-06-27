import { Router } from 'express';
const router = Router();
import pool from '../db.js';

// GET /api/users/recipes
router.get('/users/:uid/recipes', async (req, res) => {
    try {
        const result = await pool.query('SELECT title, created_at FROM recipes WHERE user_id = $1', [req.params.uid]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching recipes:', err);
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
});
// GET /api/users/{uid}/recipes/{id}
router.get('/users/:uid/recipes/:id', async (req, res) => {
    try {
        const recipe_result = await pool.query('SELECT title, cook_time, instructions, notes, created_at FROM recipes INNER JOIN recipe_tags ON recipes.id = recipe_tags.recipe_id WHERE recipes.id = $1 AND recipes.user_id = $2', [req.params.id, req.params.uid]);
        const ingredients_result = await pool.query('SELECT name, measurement_qty, unit FROM recipe_ingredients INNER JOIN ingredients ON ingredients.id = recipe_ingredients.ingredient_id INNER JOIN measurement_units ON recipe_ingredients.measurement_unit_id = measurement_units.id WHERE recipe_id = $1', [req.params.id]);
        const tag_result = await pool.query('SELECT description FROM tags INNER JOIN recipe_tags ON tags.id = recipe_tags.tag_id WHERE recipe_tags.recipe_id = $1', [req.params.id]);
        recipe_result.rows[0].ingredients = ingredients_result.rows;
        recipe_result.rows[0].tags = tag_result.rows;
        res.json(recipe_result.rows);
    } catch (err) {
        console.error('Error fetching recipe:', err);
        res.status(500).json({ error: 'Failed to fetch recipe' });
    }
});


export default router;