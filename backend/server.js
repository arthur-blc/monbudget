const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares — dis-moi ce que tu penses que ces deux lignes font
app.use(cors())
app.use(express.json())

// Routes
const authRoutes = require('./routes/auth')
const expenseRoutes = require('./routes/expenses')
const incomeRoutes = require('./routes/incomes')
app.use('/api/incomes', incomeRoutes)

app.use('/api/auth', authRoutes)
app.use('/api/expenses', expenseRoutes)

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API MonBudget fonctionne !' })
})

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`)
})