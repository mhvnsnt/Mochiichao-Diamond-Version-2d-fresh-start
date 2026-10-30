import React, { useState } from 'react';
import { GridConnector } from '../services/GridConnector';

export default function SpriteGenerator() {
  const [spriteUrl, setSpriteUrl] = useState<string | null>(null);
  const [isForgin, setIsForgin] = useState<boolean>(false);
  const [promptDesc, setPromptDesc] = useState<string>("dark type cyber wolf");

  const handleGenerate = async () => {
    setIsForgin(true);
    // Tellin the grid exactly what to manifest
    const blob = await GridConnector.forgeNewSprite(promptDesc);
    
    if (blob) {
      // Convertin the raw grid data into a visible image URL
      const imageUrl = URL.createObjectURL(blob);
      setSpriteUrl(imageUrl);
    }
    setIsForgin(false);
  };

  return (
    <div className="bg-slate-900 border border-teal-900 p-4 rounded-lg flex flex-col gap-4 mt-4">
      <h3 className="text-teal-400 font-bold uppercase tracking-wider text-sm">Grid Asset Forge</h3>
      
      <input 
        type="text" 
        value={promptDesc}
        onChange={(e) => setPromptDesc(e.target.value)}
        className="w-full bg-slate-950 border border-slate-800 text-teal-50 px-3 py-2 rounded focus:outline-none focus:border-teal-500 transition-colors"
        placeholder="e.g. fire breathing turtle"
      />

      <button 
        onClick={handleGenerate} 
        disabled={isForgin}
        className="bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold py-2 rounded transition-colors disabled:opacity-50 uppercase tracking-wider text-sm"
      >
        {isForgin ? "Connecting to Grid..." : "Forge Sprite"}
      </button>
      
      {spriteUrl && (
        <div className="mt-4 flex justify-center p-4 bg-slate-950 border border-slate-800 rounded">
          <img src={spriteUrl} alt="Forged Grid Asset" className="pixelated w-32 h-32 object-contain" style={{ imageRendering: 'pixelated' }} />
        </div>
      )}
    </div>
  );
}
