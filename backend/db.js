import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.SUPABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export async function owns_ingredient(user_id, ingredient_id) {
    const result = await pool.query('SELECT id FROM ingredients WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)', [ingredient_id, user_id]);
    return result.rows.length > 0;
}

export async function owns_unit(user_id, unit_id) {
    const result = await pool.query('SELECT id FROM measurement_units WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)', [unit_id, user_id]);
    return result.rows.length > 0;
}

export async function owns_tag(user_id, tag_id) {
    const result = await pool.query('SELECT id FROM tags WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)', [tag_id, user_id]);
    return result.rows.length > 0;
}

export async function owns_list(user_id, list_id) {
    const result = await pool.query('SELECT id FROM shopping_lists WHERE id = $1 AND user_id = $2', [list_id, user_id]);
    return result.rows.length > 0;
}

export async function owns_recipe(user_id, recipe_id) {
    const result = await pool.query('SELECT id FROM recipes WHERE id = $1 AND user_id = $2', [recipe_id, user_id]);
    return result.rows.length > 0;
}

export default pool;