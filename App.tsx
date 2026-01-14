
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { 
  Square, 
  Construction, 
  Terminal, 
  Info,
  Factory,
  CheckCircle2,
  Scissors,
  Layers
} from 'lucide-react';

const App: React.FC = () => {
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [skylights, setSkylights] = useState<string>('0');
  
  const [results, setResults] = useState<{
    area: number;
    totalUpstands: number;
    upstandArea: number;
    surfaceRolls: number;
    upstandAluRolls: number;
    equerreRolls: number;
  } | null>(null);

  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isLoadingCode, setIsLoadingCode] = useState<boolean>(false);

  // Constants
  const ROLL_SURFACE_5M2 = 5;
  const ROLL_ALU_6M2 = 6;
  const ROLL_EQUERRE_10ML = 10;
  const COVERAGE_FACTOR = 0.9; // 10% loss on membranes
  const EQUERRE_LOSS_FACTOR = 1.1; // 10% extra for overlaps/corners on strips
  const UPSTAND_STRIP_WIDTH = 0.3; 
  const SKYLIGHT_PERIMETER = 4; 

  const calculateSealant = useCallback(() => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const s = parseInt(skylights) || 0;

    if (isNaN(l) || isNaN(w) || l <= 0 || w <= 0) {
      setResults(null);
      return;
    }

    // 1. Surface Courante (Rouleaux 5m2)
    const area = l * w;
    const surfaceRolls = Math.ceil(area / (ROLL_SURFACE_5M2 * COVERAGE_FACTOR));

    // 2. Linéaire Total (Périphérie + Lanterneaux)
    const terracePerimeter = 2 * (l + w);
    const skylightPerim = s * SKYLIGHT_PERIMETER;
    const totalUpstands = terracePerimeter + skylightPerim;
    
    // 3. Relevés ALU (Rouleaux 6m2)
    // Calcul : Linéaire x 0.3m = Surface de relevé
    const upstandArea = totalUpstands * UPSTAND_STRIP_WIDTH;
    const upstandAluRolls = Math.ceil(upstandArea / (ROLL_ALU_6M2 * COVERAGE_FACTOR));

    // 4. Bandes d'équerre (Rouleaux 10ml) + 10% perte
    const equerreRolls = Math.ceil((totalUpstands * EQUERRE_LOSS_FACTOR) / ROLL_EQUERRE_10ML);

    setResults({
      area,
      totalUpstands,
      upstandArea,
      surfaceRolls,
      upstandAluRolls,
      equerreRolls
    });
  }, [length, width, skylights]);

  useEffect(() => {
    calculateSealant();
  }, [calculateSealant]);

  const fetchCCode = async () => {
    setIsLoadingCode(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `Génère un programme en langage C pro pour un étancheur.
      Le programme doit calculer :
      1. Dimensions terrasse et lanterneaux.
      2. Surface courante -> Rouleaux de 5m2 (coef 0.9 pour perte).
      3. Linéaire total de relevés.
      4. Relevés ALU -> Surface (Linéaire * 0.3m) -> Rouleaux de 6m2 (coef 0.9 pour perte).
      5. Bandes d'équerre (25cm) -> Rouleaux de 10ml (Linéaire * 1.1 / 10 pour inclure 10% de perte au recouvrement).
      6. Récapitulatif complet de commande.
      Commentaires en français.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });

      setGeneratedCode(response.text || "Erreur de génération.");
    } catch (error) {
      console.error("Gemini Error:", error);
      setGeneratedCode("// Erreur de génération. Vérifiez votre clé API.");
    } finally {
      setIsLoadingCode(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="px-6 pt-8 pb-6 bg-gradient-to-b from-orange-600/20 to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-500 rounded-lg shadow-lg shadow-orange-500/20">
            <Construction className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-orange-100">
            Expert Étanchéité
          </h1>
        </div>
        <p className="text-slate-400 text-xs tracking-wide uppercase font-semibold">Calcul avec 10% de perte inclus</p>
      </header>

      <main className="flex-1 px-6 pb-12 space-y-6">
        <section className="grid grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Long. (m)</label>
            <input type="number" value={length} onChange={(e) => setLength(e.target.value)} placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none text-lg font-bold" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Larg. (m)</label>
            <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none text-lg font-bold" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nombre de Lanterneaux</label>
            <div className="relative">
              <input type="number" value={skylights} onChange={(e) => setSkylights(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none text-lg font-bold" />
              <Factory className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700" />
            </div>
          </div>
        </section>

        {results ? (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Relevés ALU */}
            <div className="bg-orange-500 rounded-2xl p-5 text-white shadow-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase opacity-80 text-orange-100">Relevés ALU (6m²)</span>
                <Layers className="w-5 h-5 opacity-50" />
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-black">{results.totalUpstands.toFixed(1)}</span>
                <span className="text-xl font-medium">ml</span>
              </div>
              <p className="text-[10px] opacity-90 mb-4 italic">Soit {results.upstandArea.toFixed(2)} m² (Dévelopé 0.30m)</p>
              
              <div className="bg-white/10 rounded-lg p-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase">Besoin Rouleaux ALU</span>
                <span className="text-2xl font-black">{results.upstandAluRolls}</span>
              </div>
            </div>

            {/* Équerres */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 border-l-4 border-l-blue-500">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase text-slate-500">Bandes d'équerre (10ml)</span>
                <Scissors className="w-5 h-5 text-blue-500 opacity-50" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-200">{results.equerreRolls}</span>
                  <span className="text-xs text-slate-500 uppercase font-bold">Rouleaux</span>
                </div>
                <div className="text-[10px] text-blue-400 font-bold italic">+10% Recouvrement inclus</div>
              </div>
            </div>

            {/* Surface Courante */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 border-l-4 border-l-orange-500">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase text-slate-500">Surface Courante (5m²)</span>
                <Square className="w-5 h-5 text-orange-500 opacity-30" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-200">{results.surfaceRolls}</span>
                  <span className="text-xs text-slate-500 uppercase font-bold">Rouleaux</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">{results.area.toFixed(2)} m² total</div>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
               <div className="flex items-center gap-3 mb-2">
                 <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                 <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Récapitulatif Commande</p>
               </div>
               <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-300">
                  <div className="p-2 bg-slate-900/50 rounded-lg">Surface: <span className="text-emerald-400">{results.surfaceRolls} rlx</span></div>
                  <div className="p-2 bg-slate-900/50 rounded-lg">ALU 6m²: <span className="text-emerald-400">{results.upstandAluRolls} rlx</span></div>
                  <div className="p-2 bg-slate-900/50 rounded-lg col-span-2 text-center">Équerres: <span className="text-emerald-400">{results.equerreRolls} rlx</span></div>
               </div>
            </div>
          </section>
        ) : (
          <div className="h-32 border-2 border-dashed border-slate-800 rounded-3xl flex items-center justify-center text-slate-600 text-sm italic">
            Saisissez les dimensions pour calculer...
          </div>
        )}

        <section className="space-y-3">
          <button
            onClick={fetchCCode}
            disabled={isLoadingCode}
            className="w-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 border border-slate-700 transition-all shadow-lg"
          >
            {isLoadingCode ? <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> : <Terminal className="w-5 h-5 text-orange-500" />}
            Générer le programme C expert
          </button>

          {generatedCode && (
            <div className="bg-black/80 border border-slate-800 rounded-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Source C Code</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <div className="w-2 h-2 rounded-full bg-orange-500/50" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                </div>
              </div>
              <div className="p-4 overflow-x-auto max-h-72 font-mono text-[10px] text-orange-200/80 leading-relaxed whitespace-pre scrollbar-hide">
                {generatedCode}
              </div>
            </div>
          )}
        </section>

        <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Info className="w-4 h-4 text-blue-400" />
          </div>
          <div className="space-y-1 text-[10px] text-blue-300/80 leading-relaxed">
            <p className="font-bold text-blue-400 uppercase tracking-wide">Méthodologie Pro :</p>
            <p>• <strong>Bandes d'équerre :</strong> Linéaire × 1.10 (pour les 10cm de recouvrement par raccord). Divisé par 10ml.</p>
            <p>• <strong>Membranes :</strong> Coefficient 0.9 appliqué sur la surface utile (10% de perte inclus).</p>
            <p>• <strong>Dévelopé Relevé :</strong> 0.30m (standard pour 15cm de hauteur finie).</p>
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-slate-900 text-center opacity-40">
        <p className="text-[9px] uppercase tracking-[0.2em] font-black">Expert Étanchéité Solution v2.6</p>
      </footer>
    </div>
  );
};

export default App;
