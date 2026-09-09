import React, { useState } from 'react';
import { ShieldAlert, AlertOctagon, CheckCircle2, XCircle, ArrowRight, ShieldCheck, Flame, Zap, Activity } from 'lucide-react';

interface CriticalCase {
  id: string;
  title: string;
  industry: string;
  hazard_type: string;
  material_a: {
    label: string;
    cpse: string;
    code: string;
    description: string;
  };
  material_b: {
    label: string;
    cpse: string;
    code: string;
    description: string;
  };
  naive_ai_result: {
    similarity_score: number;
    naive_verdict: string;
    why_naive_fails: string;
  };
  safety_veto_result: {
    rule_id: string;
    action: string;
    severity: string;
    intercepted_attribute: string;
    engineering_reason: string;
    disaster_consequence: string;
  };
}

export const CRITICAL_CASES: CriticalCase[] = [
  {
    id: 'case-fast-ss',
    title: 'Fastener Metallurgy: SS304 vs SS316',
    industry: 'Chemical & Fertilizer Plants / Marine',
    hazard_type: 'Severe Chemical Pitting & Acid Stress Corrosion',
    material_a: {
      label: 'CPSE-A Hex Bolt',
      cpse: 'CPSE-A',
      code: 'MAT-A-0001',
      description: 'Hex Bolt M10 x 50 SS304 IS 1367',
    },
    material_b: {
      label: 'CPSE-B Hex Bolt (SS316)',
      cpse: 'CPSE-B',
      code: 'MAT-B-0003',
      description: 'HEXAGONAL BOLT 10MM X 50MM SS 316 IS 1367',
    },
    naive_ai_result: {
      similarity_score: 97.4,
      naive_verdict: 'SAME_MATERIAL / MERGE',
      why_naive_fails: 'Naive cosine token similarity sees identical category, diameter (10mm), length (50mm), and standard (IS 1367). Only one digit differs (304 vs 316).',
    },
    safety_veto_result: {
      rule_id: 'R-FAST-01',
      action: 'HARD_REJECT',
      severity: 'CRITICAL',
      intercepted_attribute: 'grade',
      engineering_reason: 'SS316 contains 2.0% to 3.0% Molybdenum (Mo) which provides critical resistance to pitting and crevice corrosion in chloride and acidic environments. SS304 lacks Molybdenum and rapidly pits and fractures under chemical exposure.',
      disaster_consequence: 'Catastrophic pipe flange joint failure and toxic chemical gas leakage in sulfuric or coastal processing plants.',
    },
  },
  {
    id: 'case-pipe-sch',
    title: 'Piping Pressure Rating: Sch 40 vs Sch 80',
    industry: 'Refineries & Thermal Power Stations',
    hazard_type: 'High-Pressure Steam Pipe Burst / Explosion',
    material_a: {
      label: 'CPSE-A Carbon Steel Pipe',
      cpse: 'CPSE-A',
      code: 'MAT-A-0009',
      description: 'Seamless Pipe 50 NB Carbon Steel Sch 40 ASTM A106 Gr B',
    },
    material_b: {
      label: 'CPSE-B Seamless Pipe (Sch 80)',
      cpse: 'CPSE-B',
      code: 'MAT-B-0010',
      description: 'PIPE SEAMLESS CS 50NB SCHEDULE 80 ASTM A106',
    },
    naive_ai_result: {
      similarity_score: 96.8,
      naive_verdict: 'SAME_MATERIAL / MERGE',
      why_naive_fails: 'Both are 50 NB seamless carbon steel pipes conforming to ASTM A106 Grade B. NLP vectors treat "Sch 40" and "Sch 80" as minor textual variants.',
    },
    safety_veto_result: {
      rule_id: 'R-PIPE-01',
      action: 'HARD_REJECT',
      severity: 'CRITICAL',
      intercepted_attribute: 'schedule',
      engineering_reason: 'Schedule 80 has a wall thickness of 5.54 mm compared to 3.91 mm for Schedule 40 (a 41% thickness increase). Schedule 80 rated working pressure is ~2,400 PSI vs only ~1,400 PSI for Schedule 40.',
      disaster_consequence: 'Installing Sch 40 in place of Sch 80 causes instantaneous explosive rupture under high-pressure steam at 350°C.',
    },
  },
  {
    id: 'case-elec-mccb',
    title: 'Switchgear Fault Capacity: 25 kA vs 36 kA',
    industry: 'Heavy Electrical Substations / Steel Mills',
    hazard_type: 'Catastrophic Arc Flash Blast & Substation Fire',
    material_a: {
      label: 'CPSE-A Main MCCB',
      cpse: 'CPSE-A',
      code: 'MAT-A-0033',
      description: 'MCCB 100A 4P 25kA 415V IEC 60947-2',
    },
    material_b: {
      label: 'CPSE-C Substation MCCB',
      cpse: 'CPSE-C',
      code: 'MAT-C-0033',
      description: 'Moulded Case Circuit Breaker 100 Amp 4 Pole 36kA IEC60947-2',
    },
    naive_ai_result: {
      similarity_score: 95.1,
      naive_verdict: 'NEAR_DUPLICATE / MERGE',
      why_naive_fails: 'Both are 100A 4-Pole 415V circuit breakers under standard IEC 60947-2. The textual distance between "25kA" and "36kA" is minuscule in vector embedding space.',
    },
    safety_veto_result: {
      rule_id: 'R-ELEC-02',
      action: 'HARD_REJECT',
      severity: 'CRITICAL',
      intercepted_attribute: 'breaking_capacity_ka',
      engineering_reason: 'Breaking capacity denotes the maximum short-circuit prospective current the breaker can safely extinguish without exploding. 36 kA substations will instantly vaporize a 25 kA rated contact assembly.',
      disaster_consequence: 'Explosion of the switchboard enclosure, molten copper shrapnel ejection, fatal arc flash blast to electrical technicians.',
    },
  },
  {
    id: 'case-motor-pole',
    title: 'Motor Synchronous Speed: 4-Pole vs 2-Pole',
    industry: 'Cooling Water Pumps / Industrial Blowers',
    hazard_type: 'Centrifugal Impeller Overspeed Fragmentation',
    material_a: {
      label: 'CPSE-A Pump Motor',
      cpse: 'CPSE-A',
      code: 'MAT-A-0050',
      description: 'Electric Motor 15 kW 415V 4-Pole 1500 RPM TEFC IE3 IEC 60034',
    },
    material_b: {
      label: 'CPSE-B Blower Motor',
      cpse: 'CPSE-B',
      code: 'MAT-B-0050',
      description: '3-Phase Induction Motor 15kW 415V 2-Pole 3000 RPM IE3',
    },
    naive_ai_result: {
      similarity_score: 94.3,
      naive_verdict: 'FUNCTIONALLY_EQUIVALENT',
      why_naive_fails: 'Identical power (15 kW), voltage (415V), efficiency (IE3), and mechanical frame series.',
    },
    safety_veto_result: {
      rule_id: 'R-MOTOR-01',
      action: 'HARD_REJECT',
      severity: 'CRITICAL',
      intercepted_attribute: 'pole_count',
      engineering_reason: 'Synchronous speed in 50 Hz AC motors is directly determined by poles: 4-Pole = 1500 RPM; 2-Pole = 3000 RPM. A 2-Pole motor spins at double the speed, increasing impeller centrifugal stresses by 400% (speed squared).',
      disaster_consequence: 'Centrifugal pump impeller disintegrates violently at 3000 RPM, shattering pump casings.',
    },
  },
  {
    id: 'case-cable-metal',
    title: 'Conductor Metallurgy: Copper vs Aluminium',
    industry: 'Power Distribution / Smelting Plants',
    hazard_type: 'Overheating Cable Fire & Voltage Collapse',
    material_a: {
      label: 'CPSE-A Heavy Power Cable',
      cpse: 'CPSE-A',
      code: 'MAT-A-0027',
      description: 'Power Cable 1.1kV 3C x 35 sq mm Copper Armoured XLPE IS 7098',
    },
    material_b: {
      label: 'CPSE-B Feeder Cable',
      cpse: 'CPSE-B',
      code: 'MAT-B-0027',
      description: 'HT Power Cable 1.1kV 3 Core 35 sq mm Aluminium XLPE IS 7098',
    },
    naive_ai_result: {
      similarity_score: 93.6,
      naive_verdict: 'NEAR_DUPLICATE',
      why_naive_fails: 'Same voltage (1.1kV), same cores (3C), same cross-section (35 sq mm), same insulation (XLPE), same IS standard.',
    },
    safety_veto_result: {
      rule_id: 'R-ELEC-03',
      action: 'HARD_REJECT',
      severity: 'CRITICAL',
      intercepted_attribute: 'base_material',
      engineering_reason: 'Copper has 61% higher electrical conductivity than Aluminium. A 35 sq mm copper cable carries ~145 Amps; an equivalent 35 sq mm aluminium cable carries only ~95 Amps.',
      disaster_consequence: 'Severe thermal run-away, cable tray fires inside cable trenches, and total plant blackout.',
    },
  },
  {
    id: 'case-hose-psi',
    title: 'Hydraulic Hose Rating: 3000 PSI vs 5000 PSI',
    industry: 'Heavy Mining Excavators & Hydraulic Presses',
    hazard_type: 'High-Pressure Hydraulic Injection Injury',
    material_a: {
      label: 'CPSE-A Excavator Hose',
      cpse: 'CPSE-A',
      code: 'MAT-A-0043',
      description: 'Hydraulic Hose 1/2 in 2-Wire 3000 PSI SAE 100R2',
    },
    material_b: {
      label: 'CPSE-C Hydraulic Hose (5000 PSI)',
      cpse: 'CPSE-C',
      code: 'MAT-C-0043',
      description: 'High Pressure Hyd Hose 1/2 Inch 4-Spiral 5000 PSI SAE 100R12',
    },
    naive_ai_result: {
      similarity_score: 92.5,
      naive_verdict: 'NEAR_DUPLICATE',
      why_naive_fails: 'Both are 1/2 inch hydraulic hoses for fluid transfer.',
    },
    safety_veto_result: {
      rule_id: 'R-HOSE-01',
      action: 'HARD_REJECT',
      severity: 'CRITICAL',
      intercepted_attribute: 'pressure_rating',
      engineering_reason: 'Working pressure differential of 2,000 PSI (66% higher). Installing a 3000 PSI hose in a 5000 PSI hydraulic circuit violates safety factors and guarantees burst.',
      disaster_consequence: 'Micro-pinhole oil jet pierces skin and tissue of machine operators (fluid injection injury), requiring emergency amputation.',
    },
  },
];

export const SafetyVetoShowcase: React.FC = () => {
  const [activeCaseId, setActiveCaseId] = useState<string>(CRITICAL_CASES[0].id);

  const currentCase = CRITICAL_CASES.find(c => c.id === activeCaseId) || CRITICAL_CASES[0];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-900/40 rounded-lg text-rose-400 shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Why Deterministic Engineering Rules Must Overrule Semantic AI
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-900 text-rose-300">
                LIFE & ASSET SAFETY TEST SUITE
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              In industrial procurement across Oil & Gas, Power, Steel, and Heavy Mining, relying purely on text embeddings or Large Language Models is hazardous. A single character difference (e.g., <strong>SS304 vs SS316</strong>, or <strong>Sch 40 vs Sch 80</strong>) creates 96%+ semantic similarity, but constitutes a fatal physical mismatch. The framework embeds a hard deterministic veto layer with zero exceptions.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Case Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {CRITICAL_CASES.map((c) => {
          const isSelected = c.id === activeCaseId;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCaseId(c.id)}
              className={`p-3 rounded-lg text-left transition border ${
                isSelected
                  ? 'bg-rose-950/80 border-rose-600 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span className="text-[10px] font-mono text-rose-400 block truncate">
                {c.safety_veto_result.rule_id}
              </span>
              <span className="text-xs font-bold block truncate mt-0.5 text-slate-200">
                {c.title.split(':')[0]}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {c.title.split(':')[1] || c.industry}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Case Deep Analysis Arena */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        {/* Case Title and Sector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                Rule: {currentCase.safety_veto_result.rule_id}
              </span>
              <span className="text-xs text-slate-400">Industry: {currentCase.industry}</span>
            </div>
            <h3 className="text-lg font-bold text-white">{currentCase.title}</h3>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-950/60 rounded-lg border border-rose-900/80 text-xs text-rose-300">
            <Flame className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Hazard: <strong>{currentCase.hazard_type}</strong></span>
          </div>
        </div>

        {/* The Two Conflicting CPSE Records */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded">
                {currentCase.material_a.cpse}
              </span>
              <span className="font-mono text-slate-400">{currentCase.material_a.code}</span>
            </div>
            <h4 className="text-xs font-semibold text-slate-300">{currentCase.material_a.label}</h4>
            <p className="text-xs font-mono text-slate-200 bg-slate-900 p-2 rounded">
              {currentCase.material_a.description}
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded">
                {currentCase.material_b.cpse}
              </span>
              <span className="font-mono text-slate-400">{currentCase.material_b.code}</span>
            </div>
            <h4 className="text-xs font-semibold text-slate-300">{currentCase.material_b.label}</h4>
            <p className="text-xs font-mono text-slate-200 bg-slate-900 p-2 rounded">
              {currentCase.material_b.description}
            </p>
          </div>
        </div>

        {/* Head-to-Head Comparison: Naive Vector vs Deterministic Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Naive Vector Model Failure Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-amber-500/80" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Naive Vector Search / Generic LLM
              </span>
              <span className="text-xs font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                FATAL FALSE MERGE
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-amber-300">
                {currentCase.naive_ai_result.similarity_score}%
              </span>
              <span className="text-xs text-slate-400">Semantic Cosine Score</span>
            </div>

            <div className="text-xs space-y-1.5">
              <div className="text-slate-300">
                Naive Model Verdict:{' '}
                <strong className="text-amber-400">{currentCase.naive_ai_result.naive_verdict}</strong>
              </div>
              <p className="text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800">
                {currentCase.naive_ai_result.why_naive_fails}
              </p>
            </div>
          </div>

          {/* Deterministic Safety Veto Card */}
          <div className="bg-slate-950 border border-rose-900/60 rounded-xl p-5 space-y-3 relative overflow-hidden shadow-lg shadow-rose-950/20">
            <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Deterministic Safety Rule Engine
              </span>
              <span className="text-xs font-bold text-rose-300 bg-rose-950 px-2.5 py-0.5 rounded border border-rose-700">
                HARD SAFETY VETO
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-rose-400">
                {currentCase.safety_veto_result.rule_id}
              </span>
              <span className="text-xs text-rose-300">Rule Triggered</span>
            </div>

            <div className="text-xs space-y-1.5">
              <div className="text-slate-300">
                Enforced Action:{' '}
                <strong className="text-rose-400">
                  {currentCase.safety_veto_result.action} ({currentCase.safety_veto_result.severity})
                </strong>
              </div>
              <p className="text-rose-200/90 leading-relaxed bg-rose-950/30 p-2.5 rounded border border-rose-900/50">
                {currentCase.safety_veto_result.engineering_reason}
              </p>
            </div>
          </div>
        </div>

        {/* Physical Industrial Consequence Banner */}
        <div className="bg-gradient-to-r from-rose-950/60 to-slate-950 p-4 rounded-xl border border-rose-900/60 flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="text-rose-300 uppercase block tracking-wider mb-0.5">
              Potential Physical Disaster Prevented by Deterministic Rules:
            </strong>
            <span className="text-slate-300">
              {currentCase.safety_veto_result.disaster_consequence}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
