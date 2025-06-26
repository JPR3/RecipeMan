import express from 'express';
import pkg from 'body-parser';
const { json, urlencoded } = pkg;
import cors from 'cors';
import usersRoutes from './routes/users.js';
import recipesRoutes from './routes/recipes.js';
const app = express()
const port = process.env.PORT || 3000

// Middleware setup
app.use(cors())
app.use(json())
app.use(
    urlencoded({
        extended: true,
    })
)

app.use('/api/users', usersRoutes)
app.use('/api/recipes', recipesRoutes)


app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})