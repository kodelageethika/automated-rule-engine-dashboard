import React, { useState, useMemo } from 'react';
import { NationalMaterial, RawMaterialRecord } from '../types';
import { Search, Filter, Layers, Copy, Check, ChevronRight, ArrowUpDown, Tag, Info, ExternalLink, X } from 'lucide-react';

interface NationalCatalogViewProps {
  catalog: NationalMaterial[];
  rawRecords: RawMaterialRecord[];
}

export const NationalCatalogView: React.FC<NationalCatalogViewProps> = ({ catalog, rawRecords }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [filterMultiCpseOnly, setFilterMultiCpseOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NationalMaterial | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(catalog.map(item => item.category_family));
    return ['ALL', ...Array.from(set).sort()];
  }, [catalog]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return catalog.filter(item => {
      if (selectedCategory !== 'ALL' && item.category_family !== selectedCategory) {
        return false;
      }
      if (filterMultiCpseOnly && item.mapped_cpse_records.length <= 1) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesCode = item.national_material_code.toLowerCase().includes(query);
        const matchesDesc = item.canonical_description.toLowerCase().includes(query);
        const matchesGrade = item.grade?.toLowerCase().includes(query);
        const matchesStandard = item.standard?.toLowerCase().includes(query);
        const matchesCpse = item.mapped_cpse_records.some(r =>
          r.cpse.toLowerCase().includes(query) ||
          r.material_code.toLowerCase().includes(query) ||
          r.source_description.toLowerCase().includes(query)
        );
        return matchesCode || matchesDesc || matchesGrade || matchesStandard || matchesCpse;
      }
      return true;
    });
  }, [catalog, selectedCategory, filterMultiCpseOnly, searchTerm]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Control & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-catalog"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by National Code, CPSE Code, Description, Grade, or Standard..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="select-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-slate-200">
                  {c === 'ALL' ? 'All Categories' : c.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Multi-CPSE Toggle */}
          <button
            id="toggle-multi-cpse"
            onClick={() => setFilterMultiCpseOnly(!filterMultiCpseOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
              filterMultiCpseOnly
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Multi-CPSE Harmonized Only
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-slate-200">{filteredItems.length}</strong> standardized National Material items
        </span>
        <span>
          Harmonized across <strong className="text-blue-400">CPSE-A, CPSE-B, CPSE-C</strong>
        </span>
      </div>

      {/* Catalog Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">National Material Code</th>
                <th className="py-3.5 px-4">Standardized Description</th>
                <th className="py-3.5 px-4">Category / Family</th>
                <th className="py-3.5 px-4">Standard / Grade</th>
                <th className="py-3.5 px-4">UOM</th>
                <th className="py-3.5 px-4 text-center">CPSE Mappings</th>
                <th className="py-3.5 px-4 text-right">Avg Price</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map((item) => {
                const cpseCount = item.mapped_cpse_records.length;
                const isMultiCpse = cpseCount > 1;

                return (
                  <tr
                    key={item.national_id}
                    className="hover:bg-slate-800/40 transition group cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-blue-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{item.national_material_code}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(item.national_material_code);
                          }}
                          className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition"
                          title="Copy National Code"
                        >
                          {copiedCode === item.national_material_code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-200 font-medium max-w-xs md:max-w-md">
                      <div className="truncate" title={item.canonical_description}>
                        {item.canonical_description}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                        {item.category_family.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">{item.grade}</span>
                        <span className="text-[10px] text-slate-400">{item.standard}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <span className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 text-[10px]">
                        {item.canonical_uom}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          isMultiCpse
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                            : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                        }`}
                      >
                        <Layers className="w-3 h-3" />
                        {cpseCount} {cpseCount === 1 ? 'CPSE' : 'CPSEs'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-200 whitespace-nowrap">
                      ₹{item.average_unit_cost_inr.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Material Detail Drawer / Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/60 sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                    {selectedItem.national_material_code}
                  </span>
                  <span className="text-xs text-slate-400">
                    {selectedItem.category_family.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedItem.canonical_description}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-6">
              {/* Technical Specifications Grid */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                  Standardized Technical Specifications
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block">Base Material:</span>
                    <span className="font-semibold text-slate-200">{selectedItem.base_material}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Grade / Alloy:</span>
                    <span className="font-semibold text-slate-200">{selectedItem.grade}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Governing Standard:</span>
                    <span className="font-semibold text-slate-200">{selectedItem.standard}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Canonical UOM:</span>
                    <span className="font-semibold text-slate-200">{selectedItem.canonical_uom}</span>
                  </div>
                  {selectedItem.fingerprint.dimensions.diameter_mm && (
                    <div>
                      <span className="text-slate-400 block">Diameter:</span>
                      <span className="font-semibold text-slate-200">M{selectedItem.fingerprint.dimensions.diameter_mm}</span>
                    </div>
                  )}
                  {selectedItem.fingerprint.dimensions.length_mm && (
                    <div>
                      <span className="text-slate-400 block">Length:</span>
                      <span className="font-semibold text-slate-200">{selectedItem.fingerprint.dimensions.length_mm} mm</span>
                    </div>
                  )}
                  {selectedItem.fingerprint.dimensions.nominal_bore_nb && (
                    <div>
                      <span className="text-slate-400 block">Nominal Bore:</span>
                      <span className="font-semibold text-slate-200">{selectedItem.fingerprint.dimensions.nominal_bore_nb} NB</span>
                    </div>
                  )}
                  {selectedItem.fingerprint.technical_parameters.schedule && (
                    <div>
                      <span className="text-slate-400 block">Schedule:</span>
                      <span className="font-semibold text-slate-200">{selectedItem.fingerprint.technical_parameters.schedule}</span>
                    </div>
                  )}
                  {selectedItem.fingerprint.technical_parameters.pressure_rating && (
                    <div>
                      <span className="text-slate-400 block">Pressure Class:</span>
                      <span className="font-semibold text-slate-200">{selectedItem.fingerprint.technical_parameters.pressure_rating}</span>
                    </div>
                  )}
                  {selectedItem.fingerprint.technical_parameters.voltage_v && (
                    <div>
                      <span className="text-slate-400 block">Voltage:</span>
                      <span className="font-semibold text-slate-200">{selectedItem.fingerprint.technical_parameters.voltage_v} V</span>
                    </div>
                  )}
                  {selectedItem.fingerprint.technical_parameters.breaking_capacity_ka && (
                    <div>
                      <span className="text-slate-400 block">Breaking Capacity:</span>
                      <span className="font-semibold text-slate-200">{selectedItem.fingerprint.technical_parameters.breaking_capacity_ka} kA</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mapped CPSE Records */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Mapped CPSE Source Records ({selectedItem.mapped_cpse_records.length})
                  </h4>
                  <span className="text-[11px] text-emerald-400">
                    {selectedItem.mapped_cpse_records.length > 1
                      ? 'Cross-Enterprise Duplicate Harmonized'
                      : 'Single CPSE Sourced'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {selectedItem.mapped_cpse_records.map((rec, idx) => {
                    const raw = rawRecords.find(
                      r => r.cpse === rec.cpse && r.material_code === rec.material_code
                    );

                    return (
                      <div
                        key={idx}
                        className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/60">
                              {rec.cpse}
                            </span>
                            <span className="font-mono text-xs text-slate-300">
                              Code: {rec.material_code}
                            </span>
                          </div>
                          {raw?.unit_price_inr && (
                            <span className="font-mono text-xs font-semibold text-amber-300">
                              ₹{raw.unit_price_inr.toLocaleString()} / {raw.uom}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-300">
                          <span className="text-slate-400">Raw Description: </span>
                          <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-slate-200">
                            {rec.source_description}
                          </span>
                        </div>

                        {raw && (
                          <div className="flex flex-wrap gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                            <span>Original UOM: <strong className="text-slate-300">{raw.uom}</strong></span>
                            <span>Annual Volume: <strong className="text-slate-300">{raw.annual_procurement_quantity?.toLocaleString() || 'N/A'}</strong></span>
                            <span>Source System: <strong className="text-slate-300">{raw.source_system}</strong></span>
                            <span>Legacy Standard: <strong className="text-slate-300">{raw.standard || 'None'}</strong></span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SHA-256 Fingerprint */}
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px]">
                <span className="text-slate-400 block mb-1">Deterministic SHA-256 Fingerprint Hash:</span>
                <span className="font-mono text-slate-300 break-all bg-slate-900 px-2 py-1 rounded block">
                  {selectedItem.fingerprint ? 'Canonical Object Evaluated' : 'N/A'}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
