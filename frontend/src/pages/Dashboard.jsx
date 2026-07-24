import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [expenses, setExpenses] = useState([])
  const [incomes, setIncomes] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    amount: '',
    description: '',
    category: 'Alimentation',
    date: new Date().toISOString().split('T')[0]
  })
  const [incomeForm, setIncomeForm] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resExpenses, resIncomes] = await Promise.all([
          fetch('http://localhost:3000/api/expenses', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:3000/api/incomes', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])
        const dataExpenses = await resExpenses.json()
        const dataIncomes = await resIncomes.json()
        setExpenses(Array.isArray(dataExpenses) ? dataExpenses : [])
        setIncomes(Array.isArray(dataIncomes) ? dataIncomes : [])
      } catch (error) {
        setExpenses([])
        setIncomes([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

  const handleAddExpense = async () => {
    if (!form.amount || !form.description || !form.date) return
    const res = await fetch('http://localhost:3000/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(form)
    })
    const newExpense = await res.json()
    setExpenses(prev => [newExpense, ...prev])
    setForm({ amount: '', description: '', category: 'Alimentation', date: new Date().toISOString().split('T')[0] })
  }

  const handleDelete = async (id) => {
    await fetch(`http://localhost:3000/api/expenses/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  const handleAddIncome = async () => {
    if (!incomeForm.amount || !incomeForm.description || !incomeForm.date) return
    const res = await fetch('http://localhost:3000/api/incomes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(incomeForm)
    })
    const newIncome = await res.json()
    setIncomes(prev => [newIncome, ...prev])
    setIncomeForm({ amount: '', description: '', date: new Date().toISOString().split('T')[0] })
  }

  const handleDeleteIncome = async (id) => {
    await fetch(`http://localhost:3000/api/incomes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    setIncomes(prev => prev.filter(e => e.id !== id))
  }

  const thisMonth = new Date().toISOString().slice(0, 7)
  const totalExpensesMonth = expenses.filter(e => e.date?.startsWith(thisMonth)).reduce((sum, e) => sum + parseFloat(e.amount), 0)
  const totalIncomesMonth = incomes.filter(e => e.date?.startsWith(thisMonth)).reduce((sum, e) => sum + parseFloat(e.amount), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)
  const totalIncomes = incomes.reduce((sum, e) => sum + parseFloat(e.amount), 0)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Bonjour {user?.name} 👋</h1>
        <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/login') }}>
          Déconnexion
        </button>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`} onClick={() => setActiveTab('overview')}>
          📊 Vue d'ensemble
        </button>
        <button className={`${styles.tab} ${activeTab === 'expenses' ? styles.tabActive : ''}`} onClick={() => setActiveTab('expenses')}>
          💸 Dépenses
        </button>
        <button className={`${styles.tab} ${activeTab === 'incomes' ? styles.tabActive : ''}`} onClick={() => setActiveTab('incomes')}>
          💰 Revenus
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <p>Dépenses ce mois</p>
              <h2 className={styles.statRed}>-{totalExpensesMonth.toFixed(2)}€</h2>
            </div>
            <div className={styles.statCard}>
              <p>Revenus ce mois</p>
              <h2 className={styles.statGreen}>+{totalIncomesMonth.toFixed(2)}€</h2>
            </div>
            <div className={styles.statCard}>
              <p>Solde ce mois</p>
              <h2 className={(totalIncomesMonth - totalExpensesMonth) >= 0 ? styles.statGreen : styles.statRed}>
                {(totalIncomesMonth - totalExpensesMonth).toFixed(2)}€
              </h2>
            </div>
            <div className={styles.statCard}>
              <p>Solde total</p>
              <h2 className={(totalIncomes - totalExpenses) >= 0 ? styles.statGreen : styles.statRed}>
                {(totalIncomes - totalExpenses).toFixed(2)}€
              </h2>
            </div>
          </div>

          <div className={styles.section}>
            <h3>📅 Récap mensuel</h3>
            <div className={styles.monthlyTable}>
              {Object.entries(
                [...expenses, ...incomes].reduce((acc, item) => {
                  const month = item.date?.slice(0, 7)
                  if (!month) return acc
                  if (!acc[month]) acc[month] = { expenses: 0, incomes: 0 }
                  if (item.category !== undefined) acc[month].expenses += parseFloat(item.amount)
                  else acc[month].incomes += parseFloat(item.amount)
                  return acc
                }, {})
              ).sort((a, b) => b[0].localeCompare(a[0])).map(([month, data]) => (
                <div key={month} className={styles.monthRow}>
                  <span className={styles.monthLabel}>{month}</span>
                  <span className={styles.statGreen}>+{data.incomes.toFixed(2)}€</span>
                  <span className={styles.statRed}>-{data.expenses.toFixed(2)}€</span>
                  <span className={(data.incomes - data.expenses) >= 0 ? styles.statGreen : styles.statRed}>
                    {(data.incomes - data.expenses).toFixed(2)}€
                  </span>
                </div>
              ))}
              {expenses.length === 0 && incomes.length === 0 && <p>Aucune donnée</p>}
            </div>
          </div>
        </>
      )}

      {activeTab === 'expenses' && (
        <>
          <div className={styles.formSection}>
            <h3>➕ Ajouter une dépense</h3>
            <div className={styles.addForm}>
              <input type="number" placeholder="Montant (€)" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
              <input type="text" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option>Alimentation</option>
                <option>Transport</option>
                <option>Loisirs</option>
                <option>Santé</option>
                <option>Logement</option>
                <option>Autre</option>
              </select>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              <button className={styles.addBtn} onClick={handleAddExpense}>+ Ajouter</button>
            </div>
          </div>

          <div className={styles.expensesList}>
            {loading ? <p>Chargement...</p> : expenses.length === 0 ? <p>Aucune dépense</p> : expenses.map(e => (
              <div key={e.id} className={styles.expenseItem}>
                <div className={styles.expenseInfo}>
                  <span className={styles.expenseDesc}>{e.description}</span>
                  <span className={styles.expenseCat}>{e.category}</span>
                  <span className={styles.expenseDate}>{e.date}</span>
                </div>
                <div className={styles.expenseRight}>
                  <span className={styles.expenseAmount}>-{e.amount}€</span>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(e.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'incomes' && (
        <>
          <div className={styles.formSection}>
            <h3>💰 Ajouter un revenu</h3>
            <div className={styles.addForm}>
              <input type="number" placeholder="Montant (€)" value={incomeForm.amount} onChange={e => setIncomeForm({...incomeForm, amount: e.target.value})} />
              <input type="text" placeholder="Description (ex: Salaire)" value={incomeForm.description} onChange={e => setIncomeForm({...incomeForm, description: e.target.value})} />
              <input type="date" value={incomeForm.date} onChange={e => setIncomeForm({...incomeForm, date: e.target.value})} />
              <button className={styles.addBtnGreen} onClick={handleAddIncome}>+ Ajouter</button>
            </div>
          </div>

          <div className={styles.expensesList}>
            {loading ? <p>Chargement...</p> : incomes.length === 0 ? <p>Aucun revenu</p> : incomes.map(e => (
              <div key={e.id} className={styles.expenseItem}>
                <div className={styles.expenseInfo}>
                  <span className={styles.expenseDesc}>{e.description}</span>
                  <span className={styles.expenseDate}>{e.date}</span>
                </div>
                <div className={styles.expenseRight}>
                  <span className={styles.incomeAmount}>+{e.amount}€</span>
                  <button className={styles.deleteBtn} onClick={() => handleDeleteIncome(e.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}