import { GoogleGenAI } from "@google/genai";
import { UserPreferences, RouteData } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to sanitize JSON strings from markdown blocks
const cleanJson = (text: string) => {
  // Matches ```json [content] ``` allowing for flexible whitespace
  const match = text.match(/```json\s*([\s\S]*?)\s*```/);
  return match ? match[1] : text;
};

// 1. SEARCH & SPIN: Find candidate routes
export const findAndPickRoute = async (prefs: UserPreferences): Promise<RouteData> => {
  const modelId = "gemini-2.5-flash"; // Use Flash for search & grounding
  
  const prompt = `
    Find a specific hiking or walking route near ${prefs.location} that matches these criteria:
    - Difficulty: ${prefs.difficulty}
    - Distance: Between ${prefs.minDistance} and ${prefs.maxDistance} km
    - Best for: ${prefs.timeWindow} ${prefs.startTime ? `(specifically around ${prefs.startTime})` : ''}
    - User Experience Level: ${prefs.experience}
    - Specific Requirements: ${prefs.notes || "None"}

    Use Google Search and Google Maps to find real trails.
    
    Return a JSON object representing the SINGLE best "Roulette Spin" result.
    Wrap the JSON in a markdown code block like this:
    \`\`\`json
    { ... }
    \`\`\`

    The JSON must follow this schema:
    {
      "name": "Name of the trail or park",
      "location": "City or Region",
      "distance": "e.g. 5.5 km",
      "difficulty": "Easy/Moderate/Hard",
      "terrain": "e.g. Coastal, Forest, Urban",
      "description": "A 2-sentence vibe description.",
      "safetyNotes": ["Note 1", "Note 2"],
      "mapsLink": "A google maps link if found or query link"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        // Tools: Search and Maps are allowed together.
        // responseMimeType and responseSchema are NOT supported when using tools.
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
      }
    });

    const rawText = response.text || "{}";
    const jsonText = cleanJson(rawText);
    const data = JSON.parse(jsonText);
    
    return {
      id: crypto.randomUUID(),
      ...data,
      // Fallback if parsing fails slightly or fields missing
      safetyNotes: data.safetyNotes || ["Check local weather.", "Bring water."],
      mapsLink: data.mapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.name + ' ' + data.location)}`
    };
  } catch (error) {
    console.error("Route finding error:", error);
    throw new Error("Failed to scout a route. Please check your internet connection or try a different location.");
  }
};

// 2. FAST BLURB: Quick vibe check
export const generateFastBlurb = async (route: RouteData): Promise<string> => {
  // Use Flash Lite for low latency
  const modelId = "gemini-2.5-flash-lite-latest"; // Using the alias for lite
  
  const prompt = `
    Write a catchy, 10-word marketing tagline for this hike: "${route.name}" which is ${route.terrain}.
    Make it sound adventurous but safe.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text?.trim() || "A great adventure awaits!";
  } catch (e) {
    return "Explore the outdoors!";
  }
};

// 3. DEEP DIVE: Thinking model
export const deepDiveRoute = async (route: RouteData, userPrefs: UserPreferences): Promise<string> => {
  const modelId = "gemini-3-pro-preview";
  
  const prompt = `
    Analyze this route strictly for the user:
    Route: ${route.name} (${route.distance}, ${route.difficulty})
    User Level: ${userPrefs.experience}
    Time: ${userPrefs.timeWindow} ${userPrefs.startTime ? `(Start: ${userPrefs.startTime})` : ''}
    Notes: ${userPrefs.notes}

    Provide a detailed safety and suitability analysis. 
    Explain why this specific route is good or risky for this specific user.
    Be honest about physical demands.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2048 }, // Moderate thinking for detailed analysis
      }
    });
    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Deep dive error:", error);
    return "Deep dive analysis currently unavailable.";
  }
};

// 4. CHAT: Interactive
export const sendChatMessage = async (
  history: { role: 'user' | 'model'; text: string }[],
  currentRoute: RouteData,
  userPrefs: UserPreferences
): Promise<string> => {
  const modelId = "gemini-3-pro-preview"; // Intelligent chat

  const systemInstruction = `
    You are Route Roulette's guide. 
    The user is currently looking at this route: ${currentRoute.name} located in ${currentRoute.location}.
    Details: ${currentRoute.distance}, ${currentRoute.difficulty}, ${currentRoute.terrain}.
    User Skills: ${userPrefs.experience}.
    User Notes: ${userPrefs.notes}.
    
    Answer questions about THIS route. 
    If asked for alternatives, suggest they 'Spin Again'.
    Keep answers concise, helpful, and safety-conscious.
  `;

  const chat = ai.chats.create({
    model: modelId,
    config: {
      systemInstruction,
    },
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }))
  });

  try {
    const lastMsg = history[history.length - 1];
    const result = await chat.sendMessage({ message: lastMsg.text });
    return result.text;
  } catch (error) {
    console.error("Chat error:", error);
    return "I'm having trouble connecting to the ranger station. Try again?";
  }
};