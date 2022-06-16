import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import cookie from 'cookie-parser';

import usersRouter from './routes/users.js';
import videosRouter from './routes/videos.js';

const HOST = 'http://127.0.0.1';
const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(fileUpload());
app.use(cors());
app.use(express.static('uploads'));
app.use(express.static('public'));
app.use(cookie());

app.use(usersRouter);
app.use(videosRouter);

app.get('/test', (_, res) => {
  res.status(200).json({
    status: 200,
    message: 'ok'
  });
})

app.get('/login', (_, res) => {
  res.status(200).clearCookie('token').sendFile(path.join(process.cwd(), 'public', 'login.html'));
});

app.get('/register', (_, res) => {
  res.status(200).clearCookie('token').sendFile(path.join(process.cwd(), 'public', 'register.html'));
});

app.get('/admin', (req, res) => {
  if (!req.cookies.token) {
    return res.status(403).sendFile(path.join(process.cwd(), 'public', 'login.html'));
  }
  res.status(200).sendFile(path.join(process.cwd(), 'public', 'admin.html'));
});

app.use((error, req, res, _) => {
  console.log(error);

  if (error.status != 500) {
    res.status(error.status).json({
      status: error.status,
      message: error.message
    });
  }

  fs.appendFileSync(path.join(process.cwd(), 'src', 'log.txt'),
  `${new Date()} ||| ${error.status} ||| ${req.url} ||| ${error.name} ||| ${error.message}\n`);

  res.status(error.status).json({
    status: error.status,
    message: 'InternalServerError'
  });

  process.exit();
})

app.listen(PORT, () => console.log(`Listening at ${HOST}:${PORT}`));
