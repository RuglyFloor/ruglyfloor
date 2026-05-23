import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingDown, Users, MousePointerClick, ShoppingCart, RefreshCw } from 'lucide-react';
import AdminProtected from '@/components/AdminProtected';

const FUNNEL_STEPS = [
  { key: 'view_item',                     label: 'Tier Selected',       color: '#f04624' },
  { key: 'builder_size_selected',         label: 'Size Selected',       color: '#e85c38' },
  { key: 'builder_base_color_selected',   label: 'Base Color',          color: '#d4724c' },
  { key: 'builder_paint_color_selected',  label: 'Paint Color',         color: '#c08860' },
  { key: 'builder_design_uploaded',       label: 'Design Uploaded',     color: '#a09e74' },
  { key: 'builder_preview_generated',     label: 'Preview Generated',   color: '#80b488' },
  { key: 'add_to_cart',                   label: 'Add to Cart',         color: '#60ca9c' },
  { key: 'begin_checkout',                label: 'Began Checkout',      color: '#40e0b0' },
  { key: 'purchase',                      label: 'Purchased',           color: '#24f0a0' },
];

const DATE_RANGES = [
  { label: '7 days',  value: '7daysAgo' },
  { label: '30 days', value: '30daysAgo' },
  { label: '90 days', value: '90daysAgo' },
];

export default function AdminBuilderAnalytics() {
  const [dateRange, setDateRange] = useState('30daysAgo');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['builder-analytics', dateRange],
    queryFn: async () => {
      const res = await base44.functions.invoke('getBuilderAnalytics', { dateRange });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Build funnel data from GA4 event counts
  const funnelData = FUNNEL_STEPS.map(step => {
    const row = data?.funnel?.find(r => r.dimensions[0] === step.key);
    return { label: step.label, count: row ? row.metrics[0] : 0, color: step.color };
  });

  const topStep = funnelData[0]?.count || 1;
  const funnelWithPct = funnelData.map(s => ({ ...s, pct: Math.round((s.count / topStep) * 100) }));

  // Tier popularity
  const tierData = (data?.tiers || []).map(r => ({ name: r.dimensions[1] || r.dimensions[0], count: r.metrics[0] }))
    .filter(r => r.name && r.name !== '(not set)')
    .sort((a, b) => b.count - a.count);

  // Size breakdown
  const sizeData = (data?.sizes || []).map(r => ({ name: r.dimensions[0], count: r.metrics[0] }))
    .filter(r => r.name && r.name !== '(not set)')
    .sort((a, b) => b.count - a.count);

  // Color breakdown
  const colorData = (data?.colors || []).map(r => ({ name: r.dimensions[0], count: r.metrics[0] }))
    .filter(r => r.name && r.name !== '(not set)')
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Daily trend
  const trendData = (data?.trend || [])
    .map(r => ({ date: r.dimensions[0], sessions: r.metrics[0], engaged: r.metrics[1] }))
    .reduce((acc, r) => {
      const existing = acc.find(a => a.date === r.date);
      if (existing) { existing.sessions += r.sessions; existing.engaged += r.engaged; }
      else acc.push({ ...r });
      return acc;
    }, [])
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(r => ({ ...r, date: `${r.date.slice(4, 6)}/${r.date.slice(6, 8)}` }));

  const conversionRate = funnelData[0]?.count > 0
    ? ((funnelData[funnelData.length - 1].count / funnelData[0].count) * 100).toFixed(1)
    : 0;

  return (
    <AdminProtected>
      <div className="min-h-screen bg-gray-50 py-10 px-6">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-black" style={{ fontFamily: 'Barlow Condensed, sans-serif', color: '#343634' }}>
                Builder Analytics
              </h1>
              <p className="text-gray-500 text-sm mt-1">User behavior in the Custom Design Builder — powered by GA4</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1 bg-white rounded-xl border p-1">
                {DATE_RANGES.map(r => (
                  <button key={r.value} onClick={() => setDateRange(r.value)}
                    className="px-3 py-1 rounded-lg text-sm font-bold transition-all"
                    style={{ backgroundColor: dateRange === r.value ? '#343634' : 'transparent', color: dateRange === r.value ? '#fff' : '#6b7280' }}>
                    {r.label}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              Failed to load analytics: {error.message}. Make sure your GA4 Property ID is correct in the backend function.
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, label: 'Tier Views', value: funnelData[0]?.count || 0, color: '#f04624' },
              { icon: MousePointerClick, label: 'Designs Uploaded', value: funnelData[4]?.count || 0, color: '#4075ff' },
              { icon: ShoppingCart, label: 'Add to Cart', value: funnelData[6]?.count || 0, color: '#24f0a0' },
              { icon: TrendingDown, label: 'Conversion Rate', value: `${conversionRate}%`, color: '#c9a84c' },
            ].map(({ icon: Icon, label, value, color }) => (
              <Card key={label}>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div>
                    <div className="text-2xl font-black" style={{ color: '#343634' }}>{isLoading ? '—' : value}</div>
                    <div className="text-xs text-gray-500">{label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-500" />
                Builder Funnel — Step Drop-off
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-40 flex items-center justify-center text-gray-400">Loading…</div>
              ) : (
                <div className="space-y-3">
                  {funnelWithPct.map((step, i) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <div className="w-36 text-sm font-semibold text-gray-600 flex-shrink-0">{step.label}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden relative">
                        <div className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                          style={{ width: `${Math.max(step.pct, 2)}%`, backgroundColor: step.color }}>
                          <span className="text-xs font-bold text-white">{step.count.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="w-12 text-xs text-right font-bold text-gray-500">{step.pct}%</div>
                      {i > 0 && funnelWithPct[i - 1].count > 0 && (
                        <div className="w-14 text-xs text-right font-bold" style={{ color: '#f04624' }}>
                          -{(100 - Math.round((step.count / funnelWithPct[i - 1].count) * 100))}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tier + Size side by side */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Tier Popularity</CardTitle></CardHeader>
              <CardContent>
                {isLoading ? <div className="h-40 flex items-center justify-center text-gray-400">Loading…</div> : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={tierData} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={70} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#f04624" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Size Selections</CardTitle></CardHeader>
              <CardContent>
                {isLoading ? <div className="h-40 flex items-center justify-center text-gray-400">Loading…</div> : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={sizeData} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={50} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#4075ff" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Color popularity + daily trend */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Top Paint Colors</CardTitle></CardHeader>
              <CardContent>
                {isLoading ? <div className="h-40 flex items-center justify-center text-gray-400">Loading…</div> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={colorData} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={90} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#24f0a0" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Builder Sessions (14 days)</CardTitle></CardHeader>
              <CardContent>
                {isLoading ? <div className="h-40 flex items-center justify-center text-gray-400">Loading…</div> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="sessions" stroke="#4075ff" strokeWidth={2} dot={false} name="Sessions" />
                      <Line type="monotone" dataKey="engaged" stroke="#24f0a0" strokeWidth={2} dot={false} name="Engaged" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </AdminProtected>
  );
}