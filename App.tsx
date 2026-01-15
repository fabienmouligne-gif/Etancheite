
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Square, 
  Construction, 
  Info,
  Factory,
  CheckCircle2,
  Scissors,
  Layers,
  ArrowRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

const App: React.FC = () => {
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [skylightQty, setSkylightQty] = useState<string>('0');
  const [skylightL, setSkylightL] = useState<string>('1');
  const [skylightW, setSkylightW] = useState<string>('1');
  const [isIsolated, setIsIsolated] = useState<boolean>(false);
  
  const [results, setResults] = useState<{
    area: number;
    terracePerimeter: number;
    skylightPerimeterTotal: number;
    totalLinear: number;
    upstandArea: number;
    surfaceRolls: number;
    upstandAluRolls: number;
    equerreRolls: number; // For non-isolated or general count
  } | null>(null);

  // Constants
  const ROLL_SURFACE_5M2 = 5;
  const ROLL_ALU_6M2 = 6;
  const ROLL_EQUERRE_10ML = 10;
  const COVERAGE_FACTOR = 0.9; // 10% loss on membranes
  const EQUERRE_LOSS_FACTOR = 1.1; // 10% extra for overlaps/corners
  const UPSTAND_STRIP_WIDTH = 0.3; 

  const calculateSealant = useCallback(() => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const sQty = parseInt(skylightQty) || 0;
    const sL = parseFloat(skylightL) || 0;
    const sW = parseFloat(skylightW) || 0;

    if (isNaN(l) || isNaN(w) || l <= 0 || w <= 0) {
      setResults(null);
      return;
    }

    // 1. Surface Courante
    const area = l * w;
    const surfaceRolls = Math.ceil(area / (ROLL_SURFACE_5M2 * COVERAGE_FACTOR));

    // 2. Linéaire Terrasse
    const terracePerimeter = 2 * (l + w);
    
    // 3. Linéaire Lanterneaux
    const singleSkylightPerim = 2 * (sL + sW);
    const skylightPerimeterTotal = sQty * singleSkylightPerim;
    
    // 4. Linéaire Total pour Relevés
    const totalLinear = terracePerimeter + skylightPerimeterTotal;
    
    // 5. Relevés ALU (Surface développée)
    const upstandArea = totalLinear * UPSTAND_STRIP_WIDTH;
    const upstandAluRolls = Math.ceil(upstandArea / (ROLL_ALU_6M2 * COVERAGE_FACTOR));

    // 6. Bandes d'équerre
    const equerreRolls = Math.ceil((totalLinear * EQUERRE_LOSS_FACTOR) / ROLL_EQUERRE_10ML);

    setResults({
      area,
      terracePerimeter,
      skylightPerimeterTotal,
      totalLinear,
      upstandArea,
      surfaceRolls,
      upstandAluRolls,
      equerreRolls
    });
  }, [length, width, skylightQty, skylightL, skylightW]);

  useEffect(() => {
    calculateSealant();
  }, [calculateSealant]);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="px-6 pt-8 pb-6 bg-gradient-to-b from-orange-600/20 to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-500 rounded-lg shadow-lg shadow-orange-500/20">
            <Construction className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-orange-100 leading-tight">
            Calculateur de rouleaux d'étanchéité
          </h1>
        </div>
        <p className="text-slate-400 text-[10px] tracking-widest uppercase font-black">Expert Solution V3.1</p>
      </header>

      <main className="flex-1 px-6 pb-12 space-y-6">
        {/* Configuration Isolation */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h2 className="text-xs font-bold uppercase text-slate-400">Type de support</h2>
          </div>
          <button 
            onClick={() => setIsIsolated(!isIsolated)}
            className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 ${isIsolated ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-100' : 'bg-slate-900/50 border-slate-800 text-slate-400'}`}
          >
            <div className="flex items-center gap-3">
              {isIsolated ? <ShieldCheck className="w-6 h-6 text-emerald-500" /> : <ShieldAlert className="w-6 h-6 text-slate-500" />}
              <div className="text-left">
                <p className="text-sm font-bold">Terrasse Isolée</p>
                <p className="text-[10px] opacity-60">Impacte les bandes d'équerre (double couche)</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${isIsolated ? 'bg-emerald-500' : 'bg-slate-700'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isIsolated ? 'left-7' : 'left-1'}`} />
            </div>
          </button>
        </section>

        {/* Section Terrasse */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Square className="w-4 h-4 text-orange-500" />
            <h2 className="text-xs font-bold uppercase text-slate-400">Dimensions Terrasse</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Long. (m)</label>
              <input type="number" value={length} onChange={(e) => setLength(e.target.value)} placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none text-lg font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Larg. (m)</label>
              <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none text-lg font-bold" />
            </div>
          </div>
        </section>

        {/* Section Lanterneaux */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Factory className="w-4 h-4 text-blue-500" />
            <h2 className="text-xs font-bold uppercase text-slate-400">Détails Lanterneaux</h2>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nombre d'unités</label>
              <input type="number" value={skylightQty} onChange={(e) => setSkylightQty(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">L. Lanterneau (m)</label>
                <input type="number" value={skylightL} onChange={(e) => setSkylightL(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">l. Lanterneau (m)</label>
                <input type="number" value={skylightW} onChange={(e) => setSkylightW(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold" />
              </div>
            </div>
          </div>
        </section>

        {results ? (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Linéaire Total Info */}
            <div className="flex items-center justify-between px-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
               <span>Périphérie Totale (Développé)</span>
               <span className="text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full">{results.totalLinear.toFixed(2)} ml</span>
            </div>

            {/* Équerres (Dépendant de l'isolation) */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 border-l-4 border-l-blue-500 relative">
              <Scissors className="absolute right-4 top-4 w-5 h-5 text-blue-500 opacity-30" />
              <h3 className="text-xs font-bold uppercase text-slate-500 mb-4 tracking-wider flex items-center gap-2">
                Bandes d'équerre (10ml)
                {isIsolated && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded italic">Isolé</span>}
              </h3>
              
              <div className="space-y-4">
                {!isIsolated ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-100">{results.equerreRolls}</span>
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Rouleaux Standards</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Largeur 0.25m</p>
                        <p className="text-2xl font-black text-slate-100">{results.equerreRolls} <span className="text-xs text-slate-500 font-bold uppercase">Rlx</span></p>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-medium text-slate-600 uppercase">Couche 1</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Largeur 0.33m</p>
                        <p className="text-2xl font-black text-slate-100">{results.equerreRolls} <span className="text-xs text-slate-500 font-bold uppercase">Rlx</span></p>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-medium text-slate-600 uppercase">Couche 2</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 text-[10px] text-blue-400 font-bold bg-blue-500/10 p-2 rounded-lg">
                <ArrowRight className="w-3 h-3" />
                <span>Inclus 10% de perte (recouvrements)</span>
              </div>
            </div>

            {/* Relevés ALU */}
            <div className="bg-orange-500 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
              <Layers className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 rotate-12" />
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase opacity-80 text-orange-100">Rouleaux ALU (6m²)</span>
                <span className="bg-orange-600 px-2 py-1 rounded text-[10px] font-black tracking-tighter">FINITION ALU</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black">{results.upstandAluRolls}</span>
                  <span className="text-lg font-bold opacity-80 uppercase">Rlx</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold opacity-70 uppercase leading-none">Surf. Relevé</p>
                  <p className="text-xl font-black">{results.upstandArea.toFixed(2)} m²</p>
                </div>
              </div>
            </div>

            {/* Surface Courante */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 border-l-4 border-l-emerald-500">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase text-slate-500">Étanchéité Courante (5m²)</span>
                <Square className="w-5 h-5 text-emerald-500 opacity-30" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-100">{results.surfaceRolls}</span>
                  <span className="text-xs text-slate-500 uppercase font-bold">Rouleaux</span>
                </div>
                <div className="text-right">
                   <span className="text-[10px] text-slate-500 font-medium block">Terrasse seule</span>
                   <span className="text-xs font-bold text-emerald-500">{results.area.toFixed(2)} m²</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
               <div className="flex items-center gap-3 mb-3">
                 <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                 <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">Récapitulatif Chantier</p>
               </div>
               <div className="space-y-1 text-[11px] text-slate-500 font-medium">
                  <div className="flex justify-between"><span>Périmètre Terrasse:</span> <span className="text-slate-300">{results.terracePerimeter.toFixed(2)} ml</span></div>
                  <div className="flex justify-between"><span>Périmètre Lanterneaux:</span> <span className="text-slate-300">{results.skylightPerimeterTotal.toFixed(2)} ml</span></div>
                  <div className="h-px bg-slate-800 my-1" />
                  <div className="flex justify-between font-bold"><span>Total Linéaire:</span> <span className="text-orange-500">{results.totalLinear.toFixed(2)} ml</span></div>
               </div>
            </div>
          </section>
        ) : (
          <div className="h-32 border-2 border-dashed border-slate-800 rounded-3xl flex items-center justify-center text-slate-600 text-sm italic">
            Saisissez les dimensions pour calculer...
          </div>
        )}

        <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Info className="w-4 h-4 text-blue-400" />
          </div>
          <div className="space-y-1 text-[10px] text-blue-300/80 leading-relaxed">
            <p className="font-bold text-blue-400 uppercase tracking-wide">Note Technique :</p>
            {isIsolated ? (
              <p>• <strong>Isolation :</strong> Double équerre obligatoire (0,25m et 0,33m) selon NF DTU 43.1.</p>
            ) : (
              <p>• <strong>Équerre :</strong> Bande unique de renfort d'angle sur support non isolé.</p>
            )}
            <p>• <strong>Calculs :</strong> Pertes de 10% incluses sur toutes les membranes.</p>
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-slate-900 text-center opacity-40">
        <p className="text-[9px] uppercase tracking-[0.2em] font-black">Expert Étanchéité Solution v3.1</p>
      </footer>
    </div>
  );
};

export default App;
