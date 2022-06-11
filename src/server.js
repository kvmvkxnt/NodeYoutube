import express from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import path from 'path';

const HOST = 'http://127.0.0.1';
const PORT = process.env.PORT || 3001;
const app = express();

const corsOpts = {
  origin: "*",
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'token'],
}

app.use(express.json(), cors(), fileUpload(), express.static('public'));

app.get('/test', (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'ok'
  });
})

app.get('/', (req, res) => {
  res.status(200).sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Listening at ${HOST}:${PORT}`));
