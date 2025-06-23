const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware to check authentication (assume req.user is set)
const requireAuth = (req, res, next) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Get all events for the logged-in user
router.get('/', requireAuth, (req, res) => {
    const userId = req.user.id;
    db.query('SELECT * FROM events WHERE user_id = ?', [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

function toMySQLDateTime(date) {
    // Accepts a Date object or ISO string
    const d = new Date(date);
    return d.toISOString().slice(0, 19).replace('T', ' ');
}

// Add a new event
router.post('/', requireAuth, (req, res) => {
    console.log('POST /api/events', req.body, req.user);
    const userId = req.user.id;
    const { id, title, description, location, category, status, color } = req.body;
    // Accept both camelCase and snake_case from frontend
    const start = req.body.startTime || req.body.start_time;
    const end = req.body.endTime || req.body.end_time;
    db.query(
        'INSERT INTO events (id, user_id, title, description, start_time, end_time, location, category, status, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
            id,
            userId,
            title,
            description,
            toMySQLDateTime(start),
            toMySQLDateTime(end),
            location,
            category,
            status,
            color
        ],
        (err) => {
            if (err) {
                console.error('DB error:', err);
                return res.status(500).json({ error: err });
            }
            res.json({ success: true });
        }
    );
});

// Update an event
router.put('/:id', requireAuth, (req, res) => {
    const userId = req.user.id;
    const { title, description, location, category, status, color } = req.body;
    // Accept both camelCase and snake_case from frontend
    const start = req.body.startTime || req.body.start_time;
    const end = req.body.endTime || req.body.end_time;
    db.query(
        'UPDATE events SET title=?, description=?, start_time=?, end_time=?, location=?, category=?, status=?, color=? WHERE id=? AND user_id=?',
        [title, description, toMySQLDateTime(start), toMySQLDateTime(end), location, category, status, color, req.params.id, userId],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ success: true });
        }
    );
});

// Delete an event
router.delete('/:id', requireAuth, (req, res) => {
    const userId = req.user.id;
    db.query('DELETE FROM events WHERE id=? AND user_id=?', [req.params.id, userId], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ success: true });
    });
});

module.exports = router; 