import React from 'react';
import { RouteData } from '../types';
import { Map, ExternalLink } from 'lucide-react';

interface Props {
  route: RouteData | null;
  isScanning: boolean;
}

const MapDisplay: React.FC<Props> = ({ route, isScanning }) => {
  return (
    <div className="absolute inset-0 bg-stone-200 z-0 overflow-hidden flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#444cf7_1px,transparent_1px)] [background-size:16px_16px]"></div>

      {!route && !isScanning && (
        <div className="text-center p-8 text-stone-500">
          <Map className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <p className="text-lg font-medium">Map Waiting for Spin</p>
          <p className="text-sm">Set your preferences and hit Spin to find a route.</p>
        </div>
      )}

      {isScanning && (
        <div className="text-center p-8 z-10">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-emerald-200 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 rounded-full animate-spin border-t-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <Map className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-emerald-800 animate-pulse">Scouting Area...</p>
        </div>
      )}

      {route && !isScanning && (
        <div className="w-full h-full relative">
           {/* Simulated Map Visual using a generic tailored image based on terrain */}
           <img 
             src={`https://picsum.photos/seed/${route.id}/1200/800?grayscale&blur=2`} 
             className="w-full h-full object-cover opacity-60"
             alt="Map Background"
           />
           
           {/* Map Pin Visual */}
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
             <div className="relative group">
                <div className="w-16 h-16 bg-emerald-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center animate-bounce">
                  <Map className="w-8 h-8 text-white" />
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white px-3 py-1 rounded shadow-lg whitespace-nowrap text-sm font-bold text-stone-800">
                    {route.location}
                </div>
             </div>
           </div>

           {/* Attribution / Real Map Link */}
           <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg text-xs flex items-center gap-2">
             <span className="text-stone-500">Source: Google Maps Grounding</span>
             <a href={route.mapsLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
               View Real Map <ExternalLink className="w-3 h-3" />
             </a>
           </div>
        </div>
      )}
    </div>
  );
};

export default MapDisplay;
