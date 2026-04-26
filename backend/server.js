require('./config/env');

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/database');
const apiRoutes = require('./routes/apiRoutes');
const authRoutes = require('./routes/authRoutes');
const requestLogger = require('./middlewares/requestLogger');
const { ensureCollectionFiles } = require('./models/collectionModel');

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;
ensureCollectionFiles();
connectDB();
app.listen(PORT, () => console.log(`API server listening on http://localhost:${PORT}`));
