'use strict';

const path = require('path');
const express = require('express');

const app = express();

const PORT = Number.parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const publicDirectory = path.join(__dirname, 'public');

app.disable('x-powered-by');

app.use(
  express.static(publicDirectory, {
    index: 'index.html',
    extensions: ['html']
  })
);

app.get('/health', (request, response) => {
  response.status(200).json({
    ok: true,
    service: 'encoded-radiance-studio-website',
    version: '0.1.0'
  });
});

app.use((request, response) => {
  response.status(404).send('Encoded Radiance Studio page not found.');
});

app.listen(PORT, HOST, () => {
  console.log(
    `Encoded Radiance Studio website is running at http://localhost:${PORT}`
  );
});
