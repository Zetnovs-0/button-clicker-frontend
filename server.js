const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Record a click
app.post('/api/click', async (req, res) => {
  const { button } = req.body; // 'left' or 'right'
  try {
    await pool.query('INSERT INTO button_clicks (click_type) VALUES ($1)', [button]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch total counts
app.get('/api/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE click_type = 'left') AS left,
        COUNT(*) FILTER (WHERE click_type = 'right') AS right
      FROM button_clicks;
    `);
    res.json({
      left: parseInt(result.rows[0].left || 0),
      right: parseInt(result.rows[0].right || 0)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));