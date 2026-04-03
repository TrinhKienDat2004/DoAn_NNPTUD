const { connectDB } = require('../db');

async function connectMongo() {
  await connectDB();
}

module.exports = { connectMongo };

