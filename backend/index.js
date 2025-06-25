const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const usersRoutes = require('./routes/users');
const recipesRoutes = require('./routes/recipes');
const app = express()
const port = process.env.PORT || 3000

// Middleware setup
app.use(cors())
app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.use('/api/users', usersRoutes)
app.use('/api/recipes', recipesRoutes)


app.listen(port, () => {
    console.log(`App running on port ${port}.`)
    console.log(process.env.SUPABASE_URL);
})