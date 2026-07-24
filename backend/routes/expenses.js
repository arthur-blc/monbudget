const express = require('express')
const router = express.Router()
const db = require('../database')
const authMiddleware = require('../middleware/auth')

// Toutes les routes expenses nécessitent d'être connecté
router.use(authMiddleware)

// GET /api/expenses
router.get('/', (req, res) => {
  const userId = req.user.id
  db.all('SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC', 
    [userId], 
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur' })
      res.json(rows)
  })
})

// POST /api/expenses
router.post('/', (req, res) => {
  const userId = req.user.id
  db.run(
    'INSERT INTO expenses (user_id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)',
    [userId, req.body.amount, req.body.category, req.body.date, req.body.description],
    function (err) {
      if (err) return res.status(500).json({ message: 'Erreur serveur' })
      res.status(201).json({ id: this.lastID, ...req.body })
    }
  )
})

// DELETE /api/expenses/:id
router.delete('/:id', (req, res) => {
  const userId = req.user.id
  db.run(
    'DELETE FROM expenses WHERE id = ? AND user_id = ?',
    [req.params.id, userId],
    function (err) {
      if (err) return res.status(500).json({ message: 'Erreur serveur' })
      if (this.changes === 0) return res.status(404).json({ message: 'Dépense non trouvée' })
      res.json({ message: 'Dépense supprimée' })
    }
  )
})

module.exports = router