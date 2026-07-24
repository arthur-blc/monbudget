const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../database')

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Tous les champs sont requis' })
  }
  const hashedPassword = await bcrypt.hash(password, 10)
  db.run(
    'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
    [email, hashedPassword, name],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ message: 'Cet email est déjà utilisé' })
        }
        return res.status(500).json({ message: 'Erreur lors de l\'inscription' })
        }
        res.status(201).json({ message: 'Utilisateur inscrit avec succès' })
    }
  )
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Tous les champs sont requis' })
  }
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' })
    if (!user) return res.status(401).json({ message: 'Email ou mot de passe incorrect' })

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return res.status(401).json({ message: 'Email ou mot de passe incorrect' })

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  })
})
module.exports = router