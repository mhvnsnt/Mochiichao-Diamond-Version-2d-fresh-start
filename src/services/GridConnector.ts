export class GridConnector {
  static async forgeNewSprite(promptDesc: string): Promise<Blob | null> {
    const hfKey = (import.meta as any).env.VITE_HUGGING_FACE_API_KEY;
    if (!hfKey) {
      console.warn("Hugging Face API key not found in vault.");
      return null;
    }

    const url = "https://api-inference.huggingface.co/models/Your_Custom_Trained_Model_Name";
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${hfKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: `masterpiece 2d pixel art sprite, front facing, ${promptDesc}, pokemon gen 4 style, transparent background`
        })
      });

      if (!response.ok) {
        throw new Error(`Grid rejected the request: ${response.status}`);
      }

      // Return the raw image data blob
      return await response.blob();
    } catch (error) {
      console.error("Connection to the grid failed", error);
      return null;
    }
  }
}
