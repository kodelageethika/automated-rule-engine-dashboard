import React, { useState } from 'react';
import { TechnicalRule, RuleSeverity } from '../types';
import { Settings2, ShieldCheck, Plus, Check, Trash2, Power, AlertTriangle, RefreshCw } from 'lucide-react';

interface TechnicalRulesViewProps {
  rules: TechnicalRule[];
  onToggleRule: (ruleId: string) => void;
  onChangeSeverity: (ruleId: string, severity: RuleSeverity) => void;
  onAddRule: (rule: TechnicalRule) => void;
  onReevaluate: () => void;
}

export const TechnicalRulesView: React.FC<TechnicalRulesViewProps> = ({
  rules,
  onToggleRule,
  onChangeSeverity,
  onAddRule,
  onReevaluate,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Form state for new rule
  const [newRuleId, setNewRuleId] = useState('');
  const [newCategory, setNewCategory] = useState('PIPING');
  const [newAttribute, setNewAttribute] = useState('');
  const [newSeverity, setNewSeverity] = useState<RuleSeverity>('CRITICAL');
  const [newDescription, setNewDescription] = useState('');

  const categories = ['ALL', 'FASTENERS', 'PIPING', 'VALVES', 'ELECTRICAL_CABLES', 'SWITCHGEAR', 'MOTORS', 'SEALS', 'HOSES', 'BEARINGS', 'WELDING', 'PUMPS'];

  const filteredRules = rules.filter(r => selectedCategory === 'ALL' || r.category_family === selectedCategory);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleId || !newAttribute || !newDescription) return;

    const newRule: TechnicalRule = {
      rule_id: newRuleId.trim().toUpperCase(),
      category_family: newCategory,
      attribute_name: newAttribute.trim(),
      severity: newSeverity,
      action: newSeverity === 'CRITICAL' ? 'REJECT' : 'EXPERT_REVIEW',
      description: newDescription.trim(),
      is_active: true,
    };

    onAddRule(newRule);
    setShowAddModal(false);
    setNewRuleId('');
    setNewAttribute('');
    setNewDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-blue-400" />
            Deterministic Technical Rule Engine Configuration
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Rules execute deterministically with veto authority over semantic similarity. Configurable per CPSE industrial guidelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Engineering Rule</span>
          </button>

          <button
            onClick={onReevaluate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Apply & Recalculate</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedCategory === c
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {c === 'ALL' ? 'All Rules' : c.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Rules Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4 w-16 text-center">Status</th>
              <th className="py-3 px-4">Rule ID</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Attribute Target</th>
              <th className="py-3 px-4">Description & Technical Intent</th>
              <th className="py-3 px-4">Severity Enforcement</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredRules.map((rule) => {
              const isCritical = rule.severity === 'CRITICAL';

              return (
                <tr
                  key={rule.rule_id}
                  className={`hover:bg-slate-800/30 transition ${!rule.is_active ? 'opacity-50' : ''}`}
                >
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onToggleRule(rule.rule_id)}
                      className={`p-1 rounded-md transition ${
                        rule.is_active
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                      title={rule.is_active ? 'Rule is ACTIVE' : 'Rule is DISABLED'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                    {rule.rule_id}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-950 text-slate-300 border border-slate-800 font-medium">
                      {rule.category_family.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-300">
                    <span className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-200 border border-slate-800">
                      {rule.attribute_name}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-300 font-medium">
                    {rule.description}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <select
                      value={rule.severity}
                      onChange={(e) => onChangeSeverity(rule.rule_id, e.target.value as RuleSeverity)}
                      className={`text-[11px] font-bold px-2 py-1 rounded border cursor-pointer ${
                        isCritical
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      <option value="CRITICAL" className="bg-slate-900 text-rose-400">CRITICAL (Veto)</option>
                      <option value="HIGH" className="bg-slate-900 text-amber-400">HIGH (Review)</option>
                      <option value="MEDIUM" className="bg-slate-900 text-slate-300">MEDIUM (Flag)</option>
                    </select>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onToggleRule(rule.rule_id)}
                      className="text-xs text-slate-400 hover:text-slate-200 transition"
                    >
                      {rule.is_active ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Custom Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              Add Technical Rule
            </h3>

            <form onSubmit={handleCreateRule} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Rule ID (e.g. R-PUMP-02):</label>
                <input
                  type="text"
                  required
                  value={newRuleId}
                  onChange={(e) => setNewRuleId(e.target.value)}
                  placeholder="R-VALV-02"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Category Family:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {categories.filter(c => c !== 'ALL').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Technical Attribute:</label>
                <input
                  type="text"
                  required
                  value={newAttribute}
                  onChange={(e) => setNewAttribute(e.target.value)}
                  placeholder="e.g. pressure_rating, grade, diameter_mm"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Enforcement Severity:</label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as RuleSeverity)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="CRITICAL">CRITICAL (Immediate Veto / Reject)</option>
                  <option value="HIGH">HIGH (Route to Expert Review)</option>
                  <option value="MEDIUM">MEDIUM (Informational Warning)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Engineering Description & Justification:</label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="State the engineering compatibility requirement and why divergence causes failure..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
