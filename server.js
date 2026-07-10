const express = require('express');
const cors = require('cors');
const clipRoute = require('./routes/clip');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'https://mariyamk2500-sys.github.io',
    'https://dashboard-production-53aa.up.railway.app',
    'https://extract-clip-backend-production.up.railway.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false
}));

app.options('*', cors());
app.use(express.json());
app.use('/api/clip', clipRoute);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
