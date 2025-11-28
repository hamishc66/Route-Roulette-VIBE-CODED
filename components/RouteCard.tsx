import React, { useState } from 'react';
import { RouteData, UserPreferences } from '../types';
import { Mountain, AlertTriangle, BrainCircuit, ShieldAlert } from 'lucide-react';
import { deepDiveRoute } from '../services/geminiService';

interface Props {
  route: RouteData;
  prefs: UserPreferences;
  onDeepDiveUpdate: (analysis: string) => void;
}

const RouteCard: React.FC<Props> = ({ route, prefs, onDeepDiveUpdate }) => {
  const [isThinking, setIsThinking] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleDeepDive = async () => {
    setIsThinking(true);
    setAnalysis(null);
    const result = await deepDiveRoute(route, prefs);
    setAnalysis(result);
    onDeepDiveUpdate(result);
    setIsThinking(false);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-stone-100 p-6 max-w-2xl mx-auto w-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wide mb-2">
            {route.terrain}
          </span>
          <h2 className="text-2xl font-bold text-stone-900 leading-tight">{route.name}</h2>
          <p className="text-stone-500 text-sm flex items-center gap-1 mt-1">
            <Mountain className="w-4 h-4" /> {route.location} • {route.distance}
          </p>
        </div>
        <div className="text-right">
           <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
             route.difficulty === 'Hard' ? 'bg-red-100 text-red-800' :
             route.difficulty === 'Moderate' ? 'bg-orange-100 text-orange-800' :
             'bg-blue-100 text-blue-800'
           }`}>
             {route.difficulty}
           </span>
        </div>
      </div>

      <p className="text-stone-700 italic mb-6 border-l-4 border-emerald-500 pl-4 py-1">
        "{route.description}"
      </p>

      {/* Safety Section - Enhanced */}
      <div className="mb-6 bg-orange-50 rounded-xl border border-orange-200 overflow-hidden shadow-sm">
        <div className="bg-orange-100 px-5 py-3 border-b border-orange-200 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-orange-600" />
          <h3 className="font-bold text-orange-900 text-sm uppercase tracking-wider">Safety First</h3>
        </div>
        <div className="p-5">
          <ul className="space-y-3">
            {route.safetyNotes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-stone-800">
                <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Deep Dive Action */}
      {!analysis ? (
        <button 
          onClick={handleDeepDive}
          disabled={isThinking}
          className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 border border-indigo-200"
        >
          {isThinking ? (
            <>
              <BrainCircuit className="w-5 h-5 animate-pulse" />
              Deep Thinking Analysis...
            </>
          ) : (
            <>
              <BrainCircuit className="w-5 h-5" />
              Deep Dive Suitability Check
            </>
          )}
        </button>
      ) : (
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg animate-fade-in">
          <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-2">
            <BrainCircuit className="w-4 h-4" /> Gemini Analysis
          </h4>
          <div className="prose prose-sm prose-indigo text-stone-700 max-h-40 overflow-y-auto custom-scrollbar">
            {analysis}
          </div>
        </div>
      )}

      {/* Map Link */}
      {route.mapsLink && (
        <a 
          href={route.mapsLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block mt-4 text-center text-sm text-stone-500 hover:text-emerald-600 underline"
        >
          Open in Google Maps
        </a>
      )}
    </div>
  );
};

export default RouteCard;