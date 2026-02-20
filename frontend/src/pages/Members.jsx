import { useEffect, useState, useCallback } from 'react'
import {
  Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight,
  ChevronUp, ChevronDown, Loader2, Users, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/api/axios'
import { formatDate, getDaysUntilExpiry, cn, PLAN_TYPES, PAYMENT_METHODS, PLAN_AMOUNTS } from '@/lib/utils'
import { TableRowSkeleton } from '@/components/ui/Skeleton'

// ── Member Form Modal ────────────────────────────────────────────────────────
const emptyForm = {
  name: '', email: '', phone: '', planType: 'Monthly',
  subscriptionStart: new Date().toISOString().split('T')[0],
  status: 'Active', notes: '', createAccount: false, password: '',
}

function MemberModal({ open, onClose, onSave, initialData }) {
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        planType: initialData.planType || 'Monthly',
        subscriptionStart: initialData.subscriptionStart
          ? new Date(initialData.subscriptionStart).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        status: initialData.status || 'Active',
        notes: initialData.notes || '',
      })
    } else {
      setForm(emptyForm)
      setShowPassword(false)
    }
  }, [initialData, open])

  if (!open) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone) {
      toast.error('Name, email and phone are required')
      return
    }
    if (form.createAccount && form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await onSave(form)
    } finally {
      setLoading(false)
    }
  }

  const isEdit = !!initialData

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isEdit ? 'Edit Member' : 'Add New Member'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEdit ? 'Update member information' : 'Register a new gym member'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-foreground">Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Rahul Sharma"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Phone *</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Plan Type</label>
              <select name="planType" value={form.planType} onChange={handleChange}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all">
                {PLAN_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Start Date</label>
              <input name="subscriptionStart" type="date" value={form.subscriptionStart} onChange={handleChange}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
            </div>
            {isEdit && (
              <div className="col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-foreground">Status</label>
                <select name="status" value={form.status} onChange={handleChange}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            )}
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-foreground">Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Optional notes..."
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none" />
            </div>
            {!isEdit && (
              <div className="col-span-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                  <div className={cn(
                    'relative w-10 h-5 rounded-full transition-colors duration-200',
                    form.createAccount ? 'bg-primary' : 'bg-secondary border border-border'
                  )}>
                    <span className={cn(
                      'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
                      form.createAccount ? 'translate-x-5' : 'translate-x-0'
                    )} />
                    <input type="checkbox" name="createAccount" checked={form.createAccount} onChange={handleChange} className="sr-only" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Create login account for this member</span>
                </label>
                <p className="text-xs text-muted-foreground mt-1.5 ml-12">Member can sign in with their email and set password</p>
              </div>
            )}
            {!isEdit && form.createAccount && (
              <div className="col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-foreground">Password *</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="w-full bg-secondary border border-border rounded-xl px-4 pr-12 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-xs">
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : (isEdit ? 'Update Member' : 'Add Member')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({ open, onClose, onConfirm, memberName, loading }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-red-400" />
        </div>
        <h2 className="text-base font-semibold text-foreground text-center">Delete Member</h2>
        <p className="text-sm text-muted-foreground text-center mt-2">
          Are you sure you want to delete <span className="text-foreground font-medium">{memberName}</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-60 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Sort button ──────────────────────────────────────────────────────────────
function SortBtn({ field, currentSort, currentOrder, onSort }) {
  const active = currentSort === field
  return (
    <button onClick={() => onSort(field)} className="flex items-center gap-1 hover:text-foreground transition-colors">
      {active ? (
        currentOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
      ) : (
        <ChevronDown className="w-3 h-3 opacity-30" />
      )}
    </button>
  )
}

// ── Main Members Page ────────────────────────────────────────────────────────
export default function Members() {
  const [members, setMembers] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('createdAt')
  const [order, setOrder] = useState('desc')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editMember, setEditMember] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [page, setPage] = useState(1)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10, search, sort, order }
      if (statusFilter) params.status = statusFilter
      const { data } = await api.get('/members', { params })
      setMembers(data.data)
      setPagination(data.pagination)
    } catch (err) {
      toast.error('Failed to load members')
    } finally {
      setLoading(false)
    }
  }, [page, search, sort, order, statusFilter])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  // Debounce search
  const [searchInput, setSearchInput] = useState('')
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const handleSort = (field) => {
    if (sort === field) setOrder(o => o === 'asc' ? 'desc' : 'asc')
    else { setSort(field); setOrder('asc') }
    setPage(1)
  }

  const handleSave = async (form) => {
    try {
      if (editMember) {
        await api.put(`/members/${editMember._id}`, form)
        toast.success('Member updated successfully ✌️')
      } else {
        await api.post('/members', form)
        toast.success('Member added successfully 🎉')
      }
      setModalOpen(false)
      setEditMember(null)
      fetchMembers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
      throw err
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await api.delete(`/members/${deleteTarget._id}`)
      toast.success('Member deleted successfully')
      setDeleteTarget(null)
      fetchMembers()
    } catch (err) {
      toast.error('Failed to delete member')
    } finally {
      setDeleteLoading(false)
    }
  }

  const openEdit = (m) => { setEditMember(m); setModalOpen(true) }
  const openAdd = () => { setEditMember(null); setModalOpen(true) }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Members
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pagination.total} total members
          </p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all glow">
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all min-w-[140px]">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                {[
                  { label: 'Member', field: 'name' },
                  { label: 'Phone', field: null },
                  { label: 'Plan', field: 'planType' },
                  { label: 'Status', field: 'status' },
                  { label: 'Expires', field: 'subscriptionEnd' },
                  { label: 'Actions', field: null },
                ].map(({ label, field }) => (
                  <th key={label} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      {label}
                      {field && <SortBtn field={field} currentSort={sort} currentOrder={order} onSort={handleSort} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                [...Array(8)].map((_, i) => <TableRowSkeleton key={i} cols={6} />)
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No members found</p>
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const days = getDaysUntilExpiry(m.subscriptionEnd)
                  return (
                    <tr key={m._id} className="table-row-hover">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                            {m.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{m.name}</p>
                            <p className="text-xs text-muted-foreground">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{m.phone}</td>
                      <td className="px-4 py-3"><span className="badge-plan">{m.planType}</span></td>
                      <td className="px-4 py-3">
                        <span className={m.status === 'Active' ? 'badge-active' : 'badge-inactive'}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', m.status === 'Active' ? 'bg-emerald-400' : 'bg-red-400')} />
                          {m.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-foreground">{formatDate(m.subscriptionEnd)}</p>
                        {days !== null && days <= 7 && days >= 0 && (
                          <p className="text-xs text-amber-400">⚠ {days}d left</p>
                        )}
                        {days !== null && days < 0 && (
                          <p className="text-xs text-red-400">Expired</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(m)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(m)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, pagination.total)} of {pagination.total}
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

      <MemberModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditMember(null) }}
        onSave={handleSave}
        initialData={editMember}
      />
      <DeleteConfirm
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        memberName={deleteTarget?.name}
        loading={deleteLoading}
      />
    </div>
  )
}
