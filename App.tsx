import React, { useState } from 'react';
import PreferencesPanel from './components/PreferencesPanel';
import MapDisplay from './components/MapDisplay';
import RouteCard from './components/RouteCard';
import ChatInterface from './components/ChatInterface';
import { UserPreferences, RouteData, ChatMessage } from './types';
import { findAndPickRoute, generateFastBlurb, sendChatMessage } from './services/geminiService';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [prefs, setPrefs] = useState<UserPreferences>({
    location: '',
    minDistance: 3,
    maxDistance: 10,
    difficulty: 'Moderate',
    timeWindow: 'Morning',
    experience: 'Intermediate',
    notes: '',
    startTime: ''
  });

  const [currentRoute, setCurrentRoute] = useState<RouteData | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // History is not fully implemented in UI but tracked for state
  const [history, setHistory] = useState<RouteData[]>([]);

  // --- Handlers ---

  const handleSpin = async () => {
    if (!prefs.location) return;

    setIsScanning(true);
    setCurrentRoute(null);
    setChatHistory([]); // Reset chat for new route
    
    // On mobile, automatically close sidebar after spin to show map
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    try {
      // 1. Find Route (Gemini Flash + Search + Maps)
      const route = await findAndPickRoute(prefs);

      // 2. Fast Blurb Generation (Gemini Flash Lite) - Parallel to enhance feeling of speed if we were waiting, 
      // but here we just update the object.
      const marketingBlurb = await generateFastBlurb(route);
      
      const enrichedRoute = { ...route, description: marketingBlurb };

      setCurrentRoute(enrichedRoute);
      setHistory(prev => [enrichedRoute, ...prev].slice(0, 5));
    } catch (error) {
      alert("Oops! Couldn't find a route. Try a different location or wider distance range.");
      console.error(error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!currentRoute) return;

    const newUserMsg: ChatMessage = { role: 'user', text };
    setChatHistory(prev => [...prev, newUserMsg]);
    setIsChatLoading(true);

    // Filter history for API
    const apiHistory = chatHistory.map(m => ({ role: m.role, text: m.text }));
    apiHistory.push({ role: 'user', text });

    const responseText = await sendChatMessage(apiHistory, currentRoute, prefs);

    setChatHistory(prev => [...prev, { role: 'model', text: responseText }]);
    setIsChatLoading(false);
  };

  const handleDeepDiveUpdate = (analysis: string) => {
    // Optional: could add this analysis to chat context automatically
    console.log("Deep dive completed");
  };

  // --- Render ---

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-stone-100 relative">
      
      {/* Left Sidebar (Preferences) Wrapper with transitions */}
      <div 
        className={`
          bg-white z-30 transition-all duration-300 ease-in-out shadow-xl md:shadow-none
          ${isSidebarOpen 
            ? 'h-[60vh] md:h-full w-full md:w-96 opacity-100' 
            : 'h-0 md:h-full w-full md:w-0 opacity-0 md:opacity-100 overflow-hidden'
          }
        `}
      >
        <div className="w-full h-full md:w-96">
          <PreferencesPanel 
            prefs={prefs} 
            setPrefs={setPrefs} 
            onSpin={handleSpin} 
            isScanning={isScanning} 
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col h-full overflow-hidden">
        
        {/* Sidebar Toggle Button (Floating) */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md text-stone-600 hover:text-emerald-600 border border-stone-200 transition hover:bg-stone-50"
          title={isSidebarOpen ? "Maximize Map" : "Show Menu"}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
        </button>

        {/* Map Background Layer */}
        <div className="absolute inset-0 z-0">
          <MapDisplay route={currentRoute} isScanning={isScanning} />
        </div>

        {/* Overlay Content: Route Card & Chat */}
        {currentRoute && !isScanning && (
          <div className="z-10 flex flex-col h-full pointer-events-none">
            {/* Top Spacer */}
            <div className="flex-1"></div>
            
            {/* Route Card Container */}
            <div className="pointer-events-auto px-4 pb-20 md:pb-8 flex flex-col items-center gap-4 overflow-y-auto max-h-[85vh] scrollbar-hide">
              <RouteCard 
                route={currentRoute} 
                prefs={prefs}
                onDeepDiveUpdate={handleDeepDiveUpdate}
              />
              
              {/* Chat Interface */}
              <div className="w-full max-w-2xl">
                 <ChatInterface 
                    messages={chatHistory} 
                    onSendMessage={handleSendMessage} 
                    isLoading={isChatLoading}
                    currentRoute={currentRoute}
                 />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;