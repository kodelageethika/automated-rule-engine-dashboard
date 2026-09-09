import React from 'react';
import { Database, ShieldAlert, Sparkles, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';

interface MetricCardsProps {
  stats: {
    totalRawRecords: number;
    totalUnifiedCodes: number;
    identicalDuplicatesFound: number;
    nearDuplicatesFound: number;
    functionallyEquivalentFound: number;
    criticalMismatchesPrevented: number;
    pendingExpertReviews: number;
    potentialSavingsInrLakhs: number;
  };
}

export const MetricCards: React.FC<MetricCardsProps> = ({ stats }) => {
  const cards = [
    {
      id: 'metric-ingested',
      label: 'CPSE Records Ingested',
      value: stats.totalRawRecords,
      subtext: 'Across CPSE-A, CPSE-B & CPSE-C',
      icon: Database,
      iconColor: 'text-blue-400',
      bgGlow: 'from-blue-500/10 to-transparent',
      borderColor: 'border-blue-500/20',
    },
    {
      id: 'metric-unified',
      label: 'National Material Codes',
      value: stats.totalUnifiedCodes,
      subtext: 'Canonical National Masters',
      icon: Sparkles,
      iconColor: 'text-indigo-400',
      bgGlow: 'from-indigo-500/10 to-transparent',
      borderColor: 'border-indigo-500/20',
    },
    {
      id: 'metric-duplicates',
      label: 'Cross-CPSE Duplicates',
      value: stats.identicalDuplicatesFound + stats.nearDuplicatesFound,
      subtext: `${stats.identicalDuplicatesFound} Identical + ${stats.nearDuplicatesFound} Near-dup`,
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      bgGlow: 'from-emerald-500/10 to-transparent',
      borderColor: 'border-emerald-500/20',
    },
    {
      id: 'metric-safety',
      label: 'Safety Vetoes Enforced',
      value: stats.criticalMismatchesPrevented,
      subtext: 'Fatal AI merges blocked by rules',
      icon: ShieldAlert,
      iconColor: 'text-rose-400',
      bgGlow: 'from-rose-500/10 to-transparent',
      borderColor: 'border-rose-500/20',
    },
    {
      id: 'metric-savings',
      label: 'Rationalization Savings',
      value: `₹${stats.potentialSavingsInrLakhs} L`,
      subtext: 'Estimated annual benchmark delta',
      icon: TrendingUp,
      iconColor: 'text-amber-400',
      bgGlow: 'from-amber-500/10 to-transparent',
      borderColor: 'border-amber-500/20',
    },
    {
      id: 'metric-reviews',
      label: 'Expert Review Queue',
      value: stats.pendingExpertReviews,
      subtext: 'Items flagged for Committee signoff',
      icon: AlertCircle,
      iconColor: 'text-sky-400',
      bgGlow: 'from-sky-500/10 to-transparent',
      borderColor: 'border-sky-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 my-6">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className={`relative overflow-hidden rounded-xl border ${card.borderColor} bg-slate-900/80 p-4 transition-all hover:bg-slate-900`}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.bgGlow} rounded-bl-full pointer-events-none`} />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 truncate">{card.label}</span>
              <IconComponent className={`w-4 h-4 ${card.iconColor} shrink-0`} />
            </div>
            <div className="text-xl font-bold text-white tracking-tight">{card.value}</div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">{card.subtext}</p>
          </div>
        );
      })}
    </div>
  );
};
