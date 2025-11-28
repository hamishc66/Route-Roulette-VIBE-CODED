export type Difficulty = 'Easy' | 'Moderate' | 'Hard';
export type TimeWindow = 'Morning' | 'Afternoon' | 'Evening' | 'Full Day';
export type Experience = 'Beginner' | 'Intermediate' | 'Advanced';

export interface UserPreferences {
  location: string;
  minDistance: number;
  maxDistance: number;
  difficulty: Difficulty;
  timeWindow: TimeWindow;
  experience: Experience;
  notes: string;
  startTime: string;
}

export interface RouteData {
  id: string;
  name: string;
  location: string;
  distance: string; // e.g., "5.2 km"
  difficulty: Difficulty;
  terrain: string; // e.g., "Forest, Ridge"
  description: string;
  safetyNotes: string[];
  coordinates?: { lat: number; lng: number }; // Optional for map visualization
  mapsLink?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface AppState {
  preferences: UserPreferences;
  currentRoute: RouteData | null;
  history: RouteData[];
  isScanning: boolean;
  isAnalyzing: boolean;
  chatHistory: ChatMessage[];
}