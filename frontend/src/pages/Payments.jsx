import { useEffect, useState, useCallback } from 'react'
import {
  Plus, ChevronLeft, ChevronRight, CreditCard, Loader2, X, Search
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/api/axios'
import { formatDate, formatCurrency, cn, PAYMENT_METHODS, PLAN_TYPES, PLAN_AMOUNTS } from '@/lib/utils'
import { TableRowSkeleton } from '@/components/ui/Skeleton'

// ── Payment Form Modal ───────────────────────────────────────────────────────
const emptyForm = {
  memberId: '', amount: '', method: 'Cash', planType: 'Monthly',
  date: new Date().toISOString().split('T')[0], notes: '',
}

function PaymentModal({ open, onClose, onSave, members }) {
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) setForm(emptyForm)
  }, [open])

  if (!open) return null

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value }
    // Auto-fill amount when plan changes
    if (e.target.name === 'planType') {
      updated.amount = PLAN_AMOUNTS[e.target.value] || ''
    }
    setForm(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.memberId || !form.amount) {
      toast.error('Member and amount are required')
      return
    }
    setLoading(true)
    try {
      await onSave(form)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Log Payment</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Record a new payment transaction</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Member *</label>
            <select name="memberId" value={form.memberId} onChange={handleChange}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all">
              <option value="">Select a member...</option>
              {members.map(m => <option key={m._id} value={m._id}>{m.name} ({m.email})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Plan Type</label>
              <select name="planType" value={form.planType} onChange={handleChange}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all">
                {PLAN_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Amount (₹) *</label>
              <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="1500"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Method</label>
              <select name="method" value={form.method} onChange={handleChange}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all">
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Date</label>
              <input name="date" type="date" value={form.date} onChange={handleChange}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Notes</label>
            <input name="notes" value={form.notes} onChange={handleChange} placeholder="Optional notes..."
              className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Log Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const METHOD_BADGE = {
  Cash: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Card: 'bg-primary/10 text-primary border-primary/20',
  Online: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  UPI: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
}

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [allMembers, setAllMembers] = useState([])
  const [methodFilter, setMethodFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [page, setPage] = useState(1)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 12, sort: 'date', order: 'desc' }
      if (methodFilter) params.method = methodFilter
      const { data } = await api.get('/payments', { params })
      setPayments(data.data)
      setPagination(data.pagination)
    } catch {
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }, [page, methodFilter])

  const fetchAllMembers = useCallback(async () => {
    try {
      const { data } = await api.get('/members', { params: { limit: 200, status: 'Active' } })
      setAllMembers(data.data)
    } catch {}
  }, [])

  useEffect(() => { fetchPayments() }, [fetchPayments])
  useEffect(() => { fetchAllMembers() }, [fetchAllMembers])

  const handleSave = async (form) => {
    try {
      await api.post('/payments', form)
      toast.success('Payment logged & subscription extended 🎉')
      setModalOpen(false)
      fetchPayments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log payment')
      throw err
    }
  }

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" /> Payments
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pagination.total} transactions · {formatCurrency(totalAmount)} shown
          </p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all glow">
          <Plus className="w-4 h-4" /> Log Payment
        </button>
      </div>

      {/* Filter */}
      <div className="glass rounded-2xl p-4 flex gap-3">
        <select value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); setPage(1) }}
          className="bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all min-w-[160px]">
          <option value="">All Methods</option>
          {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                {['Member', 'Plan', 'Amount', 'Method', 'Date', 'Notes'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                [...Array(8)].map((_, i) => <TableRowSkeleton key={i} cols={6} />)
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No payments recorded yet</p>
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="table-row-hover">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                          {p.member?.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || '??'}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{p.member?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{p.member?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="badge-plan">{p.planType}</span></td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-foreground">{formatCurrency(p.amount)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border', METHOD_BADGE[p.method] || 'bg-secondary text-muted-foreground border-border')}>
                        {p.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(p.date)}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">{p.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Showing {((page - 1) * 12) + 1}–{Math.min(page * 12, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-foreground font-medium px-2">{page} / {pagination.pages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <PaymentModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} members={allMembers} />
    </div>
  )
}
