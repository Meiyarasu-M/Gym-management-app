import { useEffect, useState, useCallback } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import {
  Users, UserCheck, UserX, DollarSign, TrendingUp, Clock, CreditCard
} from 'lucide-react'
import api from '@/api/axios'
import { StatCardSkeleton, ChartSkeleton, Skeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

const METHOD_COLORS = { Cash: '#10b981', Card: '#6366f1', Online: '#f59e0b', UPI: '#ec4899' }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 border border-border/50 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-bold text-primary">{formatCurrency(payload[0]?.value || 0)}</p>
      {payload[0]?.payload?.count !== undefined && (
        <p className="text-xs text-muted-foreground">{payload[0].payload.count} payment(s)</p>
      )}
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color, subtitle, loading }) {
  if (loading) return <StatCardSkeleton />
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/dashboard/stats')
      setStats(data.data)
    } catch (err) {
      console.error('Failed to load dashboard stats', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  const statCards = [
    {
      title: 'Total Members',
      value: stats?.totalMembers ?? '—',
      icon: Users,
      color: 'bg-primary/10 text-primary',
      subtitle: 'All registered members',
    },
    {
      title: 'Active Members',
      value: stats?.activeMembers ?? '—',
      icon: UserCheck,
      color: 'bg-emerald-500/10 text-emerald-400',
      subtitle: 'Currently subscribed',
    },
    {
      title: 'Inactive Members',
      value: stats?.inactiveMembers ?? '—',
      icon: UserX,
      color: 'bg-red-500/10 text-red-400',
      subtitle: 'Expired subscriptions',
    },
    {
      title: 'Total Revenue',
      value: stats ? formatCurrency(stats.totalRevenue) : '—',
      icon: DollarSign,
      color: 'bg-amber-500/10 text-amber-400',
      subtitle: 'All time earnings',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} loading={loading} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Monthly income chart */}
        {loading ? (
          <div className="xl:col-span-2"><ChartSkeleton /></div>
        ) : (
          <div className="xl:col-span-2 glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Monthly Income
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Last 12 months revenue</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">This month</p>
                <p className="text-sm font-bold text-primary">
                  {stats?.monthlyIncome?.length
                    ? formatCurrency(stats.monthlyIncome[stats.monthlyIncome.length - 1]?.income || 0)
                    : '₹0'}
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={stats?.monthlyIncome || []} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(252,87%,67%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(252,87%,67%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,47%,16%)" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `₹${v / 1000}k`} tick={{ fill: 'hsl(215,20%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="hsl(252,87%,67%)"
                  strokeWidth={2.5}
                  fill="url(#incomeGradient)"
                  dot={{ fill: 'hsl(252,87%,67%)', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: 'hsl(252,87%,67%)', stroke: 'hsl(222,47%,10%)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Plan distribution */}
        {loading ? (
          <ChartSkeleton />
        ) : (
          <div className="glass rounded-2xl p-6">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-6">
              <Users className="w-4 h-4 text-primary" />
              Plan Distribution
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stats?.planDistribution?.map(p => ({ name: p._id, count: p.count })) || []} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,47%,16%)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(215,20%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(222,47%,10%)', border: '1px solid hsl(222,47%,16%)', borderRadius: '12px' }}
                  labelStyle={{ color: 'hsl(215,20%,55%)' }}
                  itemStyle={{ color: 'hsl(252,87%,67%)' }}
                />
                <Bar dataKey="count" fill="hsl(252,87%,67%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {/* Expiring soon alert */}
            {(stats?.expiringMembers || 0) > 0 && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-xs text-amber-400">
                  <span className="font-semibold">{stats.expiringMembers}</span> subscription(s) expiring in 7 days
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent payments */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
          <CreditCard className="w-4 h-4 text-primary" />
          Recent Payments
        </h3>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {(stats?.recentPayments || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No payments recorded yet</p>
            ) : (
              (stats?.recentPayments || []).map((payment) => (
                <div
                  key={payment._id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl table-row-hover"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                      {payment.member?.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{payment.member?.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(payment.date)} · {payment.method}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{formatCurrency(payment.amount)}</p>
                    <span className="badge-plan">{payment.planType}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
