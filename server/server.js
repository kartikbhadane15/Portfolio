require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const { authenticateToken } = require('./middleware/auth');

app.use('/api/auth', authRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api', apiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running normally.' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
