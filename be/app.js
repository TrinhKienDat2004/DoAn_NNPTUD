require('dotenv').config();
require('dotenv').config({ path: '.env.local' }); // Load local overrides

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { connectMongo } = require('./config/db/mongoose');
const { notFoundHandler, errorHandler } = require('./utils/errorHandlers');
const v1Routes = require('./routes/v1/index.routes');
const { seedDefaultsIfEnabled } = require('./config/seed');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => res.status(200).json({ ok: true }));

app.use('/api/v1', v1Routes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function start() {
  await connectMongo();
  await seedDefaultsIfEnabled();
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
