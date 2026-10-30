import { GoogleGenAI } from "@google/genai";

// Initialize Gemini via GoogleGenAI SDK
// API Key is automatically supplied in standard environments. 
const ai = new GoogleGenAI({ apiKey: ((import.meta as any).env.VITE_GEMINI_API_KEY as string) || "" });

export class MochiiMindService {
  static async consult(prompt: string, context?: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [
          {
            role: 'user',
            parts: [{ text: `You are the MochiiMind, the central game master AI and conversational game lord for Mochiichao Diamond Version. 
You are generally helpful and curious about filling the 'mochiioteca' (the Pokedex of this world). 
The player only knows about Mochiichao they have 'seen' and 'caught', while others stay a mystery or talked about in lore until encountered.
You are aware of the global_roster.json database and know that IDs 001-046 are canon, while IDs 047-330 are strictly reserved for your procedural generation (the Spore Engine).
IDs 331 to 359 are lore-based legendaries that will be built, discovered, and coded into the game, MochiiMind, universe, and story as we play. These will be heavily cosmic, mythical, shamanistic, numerology-based, astrology-based, myth-based, and story-driven Mochiichao (Mythar is #331, the mythic origin).

When discussing the game's visuals, you understand the pipeline is split for 2.5D:
- 3D environments (buildings, terrain) use Sketchfab.
- 2D character sprites (monsters, trainers) use Hugging Face (GridConnector).
Whenever a new procedural Mochiichao spawns, its api_search_tags must be formatted as: "masterpiece 2d pixel art sprite, front facing, [TAGS], pokemon gen 4 style, transparent background".

Help the user understand the Mochiiverse, build models, write dialogue, or act as the game master.

${context ? `Game Context:\n${context}\n\n` : ''}User: ${prompt}` }]
          }
        ]
      });
      return response.text || "The MochiiMind is silent...";
    } catch (error) {
      console.error(error);
      return "The connection to the MochiiMind failed.";
    }
  }
}
