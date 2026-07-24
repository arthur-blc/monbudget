const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  // 1. Récupérer le token dans les headers
  const token = req.headers.authorization?.split(' ')[1]
  // Le front envoie : "Authorization: Bearer eyJhbGci..."
  
  // 2. Si pas de token → refuser
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' })
  }

  // 3. Vérifier le token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded  // on attache l'user à la requête
    next()  // continuer vers la route
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' })
  }
}

module.exports = authMiddleware