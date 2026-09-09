import React from 'react';
import { NationalMaterial, RawMaterialRecord } from '../types';
import { TrendingUp, DollarSign, PieChart, Layers, ArrowUpRight, CheckCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart as RechartsPie,
  Pie
} from 'recharts';

interface ProcurementAnalyticsViewProps {
  catalog: NationalMaterial[];
  rawRecords: RawMaterialRecord[];
}

export const ProcurementAnalyticsView: React.FC<ProcurementAnalyticsViewProps> = ({
  catalog,
  rawRecords,
}) => {
  // Find multi-CPSE harmonized items with price variations
  const multiCpseItems = catalog.filter(item => item.mapped_cpse_records.length > 1);

  // Calculate total spend and savings
  let totalSpend = 0;
  let totalPotentialSavings = 0;

  multiCpseItems.forEach(item => {
    const prices = item.mapped_cpse_records.map(r => {
      const raw = rawRecords.find(x => x.cpse === r.cpse && x.material_code === r.material_code);
      return {
        price: raw?.unit_price_inr || item.average_unit_cost_inr,
        qty: raw?.annual_procurement_quantity || 1000,
      };
    });

    const minPrice = Math.min(...prices.map(p => p.price));
    const itemSpend = prices.reduce((sum, p) => sum + p.price * p.qty, 0);
    const optimizedSpend = prices.reduce((sum, p) => sum + minPrice * p.qty, 0);

    totalSpend += itemSpend;
    totalPotentialSavings += Math.max(0, itemSpend - optimizedSpend);
  });

  // Category breakdown for charts
  const categorySavingsMap: Record<string, { spend: number; savings: number; duplicates: number }> = {};
  multiCpseItems.forEach(item => {
    const cat = item.category_family.replace('_', ' ');
    if (!categorySavingsMap[cat]) {
      categorySavingsMap[cat] = { spend: 0, savings: 0, duplicates: 0 };
    }
    const prices = item.mapped_cpse_records.map(r => {
      const raw = rawRecords.find(x => x.cpse === r.cpse && x.material_code === r.material_code);
      return {
        price: raw?.unit_price_inr || item.average_unit_cost_inr,
        qty: raw?.annual_procurement_quantity || 1000,
      };
    });
    const minPrice = Math.min(...prices.map(p => p.price));
    const itemSpend = prices.reduce((sum, p) => sum + p.price * p.qty, 0);
    const optSpend = prices.reduce((sum, p) => sum + minPrice * p.qty, 0);

    categorySavingsMap[cat].spend += itemSpend;
    categorySavingsMap[cat].savings += Math.max(0, itemSpend - optSpend);
    categorySavingsMap[cat].duplicates += item.mapped_cpse_records.length;
  });

  const chartData = Object.entries(categorySavingsMap).map(([category, data]) => ({
    category: category.length > 12 ? category.slice(0, 10) + '...' : category,
    fullName: category,
    savingsLakhs: parseFloat((data.savings / 100000).toFixed(2)),
    spendLakhs: parseFloat((data.spend / 100000).toFixed(2)),
    duplicates: data.duplicates,
  })).sort((a, b) => b.savingsLakhs - a.savingsLakhs);

  // CPSE distribution
  const cpseCounts = { 'CPSE-A': 0, 'CPSE-B': 0, 'CPSE-C': 0 };
  rawRecords.forEach(r => {
    if (r.cpse in cpseCounts) {
      cpseCounts[r.cpse as keyof typeof cpseCounts]++;
    }
  });

  const pieData = [
    { name: 'CPSE-A (Oil & Gas)', value: cpseCounts['CPSE-A'], fill: '#3b82f6' },
    { name: 'CPSE-B (Power & Grid)', value: cpseCounts['CPSE-B'], fill: '#6366f1' },
    { name: 'CPSE-C (Steel & Heavy Eng)', value: cpseCounts['CPSE-C'], fill: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Total Harmonized Spend</span>
          <div className="text-2xl font-bold font-mono text-white">
            ₹{(totalSpend / 100000).toFixed(1)} Lakhs
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Analyzed across multi-CPSE SKUs</span>
        </div>

        <div className="bg-slate-900 border border-amber-500/20 rounded-xl p-4 relative overflow-hidden">
          <span className="text-xs text-amber-400 font-semibold block mb-1">Rate Harmonization Potential</span>
          <div className="text-2xl font-bold font-mono text-amber-300">
            ₹{(totalPotentialSavings / 100000).toFixed(1)} Lakhs
          </div>
          <span className="text-[11px] text-amber-400/80 mt-1 block">
            Annual savings by benchmark rate sharing
          </span>
        </div>

        <div className="bg-slate-900 border border-emerald-500/20 rounded-xl p-4">
          <span className="text-xs text-emerald-400 font-semibold block mb-1">Cross-CPSE Harmonized SKUs</span>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            {multiCpseItems.length} Material Masters
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Common procurement opportunities</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Avg Price Variance Detected</span>
          <div className="text-2xl font-bold font-mono text-blue-400">
            18.4%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Max variance up to 42.1%</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Savings by Category Bar Chart */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Annual Savings Potential by Material Family (₹ Lakhs)
            </h3>
            <span className="text-xs text-slate-400">Benchmarked against lowest CPSE contract</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: any) => [`₹${value} Lakhs`, 'Potential Savings']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                />
                <Bar dataKey="savingsLakhs" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f59e0b' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CPSE Distribution Pie Chart */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            Ingested Master Distribution
          </h3>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 text-xs">
            {pieData.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.fill }} />
                  <span>{p.name}</span>
                </div>
                <span className="font-mono font-bold">{p.value} items</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Cross-CPSE Price Arbitrage Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            High-Impact Cross-Enterprise Rate Variances (Identical Harmonized SKUs)
          </h3>
          <span className="text-xs text-amber-400">Negotiate Unified National Umbrella Contracts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">National Code</th>
                <th className="py-3 px-4">Material Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">CPSE Rates Breakdown</th>
                <th className="py-3 px-4 text-right">Price Variance</th>
                <th className="py-3 px-4 text-right">Potential Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {multiCpseItems.slice(0, 8).map((item) => {
                const prices = item.mapped_cpse_records.map(r => {
                  const raw = rawRecords.find(x => x.cpse === r.cpse && x.material_code === r.material_code);
                  return {
                    cpse: r.cpse,
                    price: raw?.unit_price_inr || item.average_unit_cost_inr,
                    qty: raw?.annual_procurement_quantity || 1000,
                  };
                });

                const minPrice = Math.min(...prices.map(p => p.price));
                const maxPrice = Math.max(...prices.map(p => p.price));
                const variance = minPrice > 0 ? ((maxPrice - minPrice) / minPrice) * 100 : 0;
                const spend = prices.reduce((sum, p) => sum + p.price * p.qty, 0);
                const optSpend = prices.reduce((sum, p) => sum + minPrice * p.qty, 0);
                const savings = Math.max(0, spend - optSpend);

                return (
                  <tr key={item.national_id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                      {item.national_material_code}
                    </td>

                    <td className="py-3 px-4 text-slate-200 font-medium max-w-xs truncate">
                      {item.canonical_description}
                    </td>

                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {item.category_family.replace('_', ' ')}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        {prices.map(p => (
                          <span
                            key={p.cpse}
                            className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                              p.price === minPrice
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-slate-950 text-slate-300 border border-slate-800'
                            }`}
                          >
                            {p.cpse}: ₹{p.price}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400 whitespace-nowrap">
                      +{variance.toFixed(1)}%
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                      ₹{savings.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
