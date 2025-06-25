const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
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

app.get('/', (request, response) => {
    console.log('Received a GET request on /')
    response.json({ message: 'Hello World!' })
})

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})