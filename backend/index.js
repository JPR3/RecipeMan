const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

// Importing the Supabase client
const { createClient } = require('@supabase/supabase-js')
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)


app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.get('/', (request, response) => {
    console.log(process.env.TEST)
    response.json({ message: 'Hello World!' })
})

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})