import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// SQLite DB setup
const dbPath = path.join(__dirname, 'data', 'emr.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT,
    lastName TEXT,
    dob TEXT,
    insuranceId TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patientId INTEGER,
    name TEXT,
    dosage TEXT,
    frequency TEXT,
    duration TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS labs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patientId INTEGER,
    type TEXT,
    result TEXT,
    takenAt TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patientId INTEGER,
    author TEXT,
    content TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Utilities
const wrap = fn => (req, res) => fn(req, res).catch(err => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Patients
app.get('/api/patients', (req, res) => {
  db.all('SELECT * FROM patients ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/patients', (req, res) => {
  const { firstName, lastName, dob, insuranceId } = req.body;
  if (!firstName || !lastName) return res.status(400).json({ error: 'firstName and lastName required' });
  db.run('INSERT INTO patients (firstName, lastName, dob, insuranceId) VALUES (?, ?, ?, ?)',
    [firstName, lastName, dob || '', insuranceId || ''], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT * FROM patients WHERE id = ?', [this.lastID], (e, row) => {
        if (e) return res.status(500).json({ error: e.message });
        res.status(201).json(row);
      });
    });
});

app.get('/api/patients/:id', (req, res) => {
  db.get('SELECT * FROM patients WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
});

// Medications
app.get('/api/patients/:id/medications', (req, res) => {
  db.all('SELECT * FROM medications WHERE patientId = ? ORDER BY id DESC', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/patients/:id/medications', (req, res) => {
  const { name, dosage, frequency, duration } = req.body;
  if (!name) return res.status(400).json({ error: 'Medication name required' });
  db.run('INSERT INTO medications (patientId, name, dosage, frequency, duration) VALUES (?, ?, ?, ?, ?)',
    [req.params.id, name, dosage || '', frequency || '', duration || ''],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT * FROM medications WHERE id = ?', [this.lastID], (e, row) => {
        if (e) return res.status(500).json({ error: e.message });
        res.status(201).json(row);
      });
    });
});

// Labs
app.get('/api/patients/:id/labs', (req, res) => {
  db.all('SELECT * FROM labs WHERE patientId = ? ORDER BY id DESC', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/patients/:id/labs', (req, res) => {
  const { type, result, takenAt } = req.body;
  if (!type) return res.status(400).json({ error: 'Lab type required' });
  db.run('INSERT INTO labs (patientId, type, result, takenAt) VALUES (?, ?, ?, ?)',
    [req.params.id, type, result || '', takenAt || ''],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT * FROM labs WHERE id = ?', [this.lastID], (e, row) => {
        if (e) return res.status(500).json({ error: e.message });
        res.status(201).json(row);
      });
    });
});

// Notes
app.get('/api/patients/:id/notes', (req, res) => {
  db.all('SELECT * FROM notes WHERE patientId = ? ORDER BY id DESC', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/patients/:id/notes', (req, res) => {
  const { author, content } = req.body;
  if (!content) return res.status(400).json({ error: 'Note content required' });
  db.run('INSERT INTO notes (patientId, author, content) VALUES (?, ?, ?)',
    [req.params.id, author || 'Physician', content],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT * FROM notes WHERE id = ?', [this.lastID], (e, row) => {
        if (e) return res.status(500).json({ error: e.message });
        res.status(201).json(row);
      });
    });
});

// Claims (mock integration)
app.post('/api/claims/submit', (req, res) => {
  const { patientId, amount, code } = req.body;
  if (!patientId || !amount) return res.status(400).json({ error: 'patientId and amount required' });
  // pretend to call billing system
  res.json({ status: 'submitted', claimId: `CLM-${Date.now()}`, code: code || '99213' });
});

// Serve SPA (single HTML file) fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`EMR backend listening on http://localhost:${PORT}`));
