import express from 'express';
import pkg from 'body-parser';
const { json, urlencoded } = pkg;
import cors from 'cors';
import { verifySupabaseToken } from './auth.js';
import apiRouter from './routes/api.js';
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
app.use(verifySupabaseToken, apiRouter)

app.use(express.static(path.join(__dirname, 'frontend/dist')));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})