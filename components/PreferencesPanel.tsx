import React from 'react';
import { UserPreferences, Difficulty, TimeWindow, Experience } from '../types';
import { MapPin, Navigation, Clock, Activity, Ruler, FileText } from 'lucide-react';

interface Props {
  prefs: UserPreferences;
  setPrefs: (p: UserPreferences) => void;
  onSpin: () => void;
  isScanning: boolean;
}

const PreferencesPanel: React.FC<Props> = ({ prefs, setPrefs, onSpin, isScanning }) => {
  
  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPrefs({ ...prefs, location: `${position.coords.latitude}, ${position.coords.longitude}` });
        },
        () => alert("Could not get location. Please enter manually.")
      );
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-stone-200 shadow-xl z-20 overflow-y-auto w-full md:w-96 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-800 flex items-center gap-2">
          <Navigation className="w-8 h-8" />
          Route Roulette
        </h1>
        <p className="text-stone-500 mt-2 text-sm">Spin the wheel for your next hike.</p>
      </div>

      <div className="flex-1 space-y-6">
        
        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Location
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={prefs.location}
              onChange={(e) => setPrefs({...prefs, location: e.target.value})}
              placeholder="e.g. Boulder, CO"
              className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
            />
            <button 
              onClick={handleLocationClick}
              className="bg-stone-100 hover:bg-stone-200 p-2 rounded-lg text-stone-600 transition"
              title="Use my location"
            >
              <Navigation className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Distance */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
            <Ruler className="w-4 h-4" /> Distance ({prefs.minDistance} - {prefs.maxDistance} km)
          </label>
          <div className="flex items-center gap-4">
             <input 
              type="range" 
              min="1" max="10" 
              value={prefs.minDistance}
              onChange={(e) => setPrefs({...prefs, minDistance: parseInt(e.target.value)})}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
             <input 
              type="range" 
              min="5" max="30" 
              value={prefs.maxDistance}
              onChange={(e) => setPrefs({...prefs, maxDistance: parseInt(e.target.value)})}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Difficulty
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Easy', 'Moderate', 'Hard'] as Difficulty[]).map((level) => (
              <button
                key={level}
                onClick={() => setPrefs({...prefs, difficulty: level})}
                className={`text-sm py-2 rounded-lg border transition ${
                  prefs.difficulty === level 
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-800 font-medium' 
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Time Window & Start Time */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Time
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select 
              value={prefs.timeWindow}
              onChange={(e) => setPrefs({...prefs, timeWindow: e.target.value as TimeWindow})}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="Full Day">Full Day</option>
            </select>
            <input 
              type="time"
              value={prefs.startTime}
              onChange={(e) => setPrefs({...prefs, startTime: e.target.value})}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              title="Exact start time (optional)"
            />
          </div>
        </div>
        
         {/* Experience */}
         <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700">Experience Level</label>
          <select 
            value={prefs.experience}
            onChange={(e) => setPrefs({...prefs, experience: e.target.value as Experience})}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {/* Requirements / Notes */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Requirements / Notes
          </label>
          <textarea
            value={prefs.notes}
            onChange={(e) => setPrefs({...prefs, notes: e.target.value})}
            placeholder="e.g. Dog friendly, Stroller accessible, Must have parking..."
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white resize-none h-20"
          />
        </div>

      </div>

      <div className="pt-6 mt-6 border-t border-stone-100">
        <button
          onClick={onSpin}
          disabled={isScanning || !prefs.location}
          className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2 ${
            isScanning || !prefs.location
              ? 'bg-stone-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-200'
          }`}
        >
          {isScanning ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Scouting...
            </>
          ) : (
            'SPIN ROUTE'
          )}
        </button>
        {!prefs.location && <p className="text-center text-xs text-red-400 mt-2">Enter a location to spin</p>}
      </div>
    </div>
  );
};

export default PreferencesPanel;