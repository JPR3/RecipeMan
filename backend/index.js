import express from 'express';
import pkg from 'body-parser';
const { json, urlencoded } = pkg;
import cors from 'cors';
import { verifySupabaseToken } from './auth.js';
import usersRoutes from './routes/users.js';
import recipesRoutes from './routes/recipes.js';
import listsRoutes from './routes/lists.js';
import ingredientsRoutes from './routes/ingredients.js';
import unitsRoutes from './routes/units.js';
import tagsRoutes from './routes/tags.js';
import path from 'path';

const app = express()
const __dirname = path.resolve();
const port = process.env.PORT || 3000

// Middleware setup
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}))
app.use(json())
app.use(
    urlencoded({
        extended: true,
    })
)
app.use(verifySupabaseToken)


app.use('/api', usersRoutes)
app.use('/api', recipesRoutes)
app.use('/api', listsRoutes)
app.use('/api', ingredientsRoutes)
app.use('/api', unitsRoutes)
app.use('/api', tagsRoutes)

app.use(express.static(path.join(__dirname, 'frontend/dist')));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})