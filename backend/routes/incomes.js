const express = require('express')
const router = express.Router()
const db = require('../database')
const authMiddleware = require('../middleware/auth')

// Toutes les routes incomes nécessitent d'être connecté
router.use(authMiddleware)

// GET /api/incomes
router.get('/', (req, res) => {
  const userId = req.user.id
  db.all('SELECT * FROM incomes WHERE user_id = ? ORDER BY date DESC', 
    [userId], 
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur' })
      res.json(rows)
  })
})

// POST /api/incomes
router.post('/', (req, res) => {
  const userId = req.user.id
  db.run(
    'INSERT INTO incomes (user_id, amount, date, description) VALUES (?, ?, ?, ?)',
    [userId, req.body.amount, req.body.date, req.body.description],
    function (err) {
      if (err) return res.status(500).json({ message: 'Erreur serveur' })
      res.status(201).json({ id: this.lastID, ...req.body })
    }
  )
})

// DELETE /api/incomes/:id
router.delete('/:id', (req, res) => {
  const userId = req.user.id
  db.run(
    'DELETE FROM incomes WHERE id = ? AND user_id = ?',
    [req.params.id, userId],
    function (err) {
      if (err) return res.status(500).json({ message: 'Erreur serveur' })
      if (this.changes === 0) return res.status(404).json({ message: 'Revenu non trouvé' })
      res.json({ message: 'Revenu supprimé' })
    }
  )
})

module.exports = router