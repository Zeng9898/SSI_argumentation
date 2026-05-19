require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const authRoutes      = require('./routes/auth');
const scenarioRoutes  = require('./routes/scenarios');
const notesRoutes     = require('./routes/notes');
const reasoningRoutes = require('./routes/reasoning');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth',      authRoutes);
app.use('/scenarios', scenarioRoutes);
app.use('/notes',     notesRoutes);
app.use('/reasoning', reasoningRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
