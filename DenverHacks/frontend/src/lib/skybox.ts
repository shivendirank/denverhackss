/**
 * Blockade Labs Skybox AI Service
 * Generates 360° 3D environments for AI Agent Citadels
 */

export interface SkyboxRequest {
  prompt: string;
  skybox_style_id?: number;
  enhance_prompt?: boolean;
  seed?: number;
  remix_imagine_id?: string; // For evolution/remix
  negative_text?: string;
}

export interface SkyboxStatus {
  id: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  file_url?: string;
  thumb_url?: string;
  error_message?: string;
  progress?: number;
}

const API_BASE = 'https://backend.blockadelabs.com/api/v1';

/**
 * Initiates skybox generation
 * @returns Generation ID for polling
 */
export async function generateSkybox(request: SkyboxRequest): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_BLOCKADE_API_KEY;
  
  if (!apiKey || apiKey === 'your_blockade_api_key') {
    console.warn('Blockade API key not configured. Using fallback mode.');
    throw new Error('MOCK_MODE');
  }

  try {
    const response = await fetch(`${API_BASE}/skybox`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        skybox_style_id: request.skybox_style_id || 67, // M3 Photoreal (2026 flagship)
        enhance_prompt: request.enhance_prompt !== false,
        seed: request.seed,
        remix_imagine_id: request.remix_imagine_id,
        negative_text: request.negative_text || "Blurry, distorted horizon, people, low resolution, messy textures, sunlight, organic grass",
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Skybox API error response:', errorBody);
      
      // If 403, likely invalid API key - use fallback
      if (response.status === 403) {
        console.warn('API key invalid or insufficient permissions. Using fallback mode.');
        throw new Error('MOCK_MODE');
      }
      
      throw new Error(`Skybox API error (${response.status}): ${response.statusText}. Details: ${errorBody}`);
    }

    const data = await response.json();
    
    if (!data.id) {
      throw new Error('Skybox API response missing id field');
    }
    
    return data.id;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Skybox generation error:', error);
      throw error;
    }
    throw new Error('Unknown error during skybox generation');
  }
}

/**
 * Polls for skybox generation status
 * @returns Status object with file_url when complete
 */
export async function checkSkyboxStatus(id: string): Promise<SkyboxStatus> {
  const apiKey = process.env.NEXT_PUBLIC_BLOCKADE_API_KEY;
  
  if (!apiKey) {
    throw new Error('Missing NEXT_PUBLIC_BLOCKADE_API_KEY in environment');
  }

  try {
    const response = await fetch(
      `${API_BASE}/imagine/requests/${id}?api_key=${apiKey}`
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Status check error response:', errorBody);
      throw new Error(`Status check failed (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.request) {
      throw new Error('Invalid status response: missing request object');
    }
    
    return {
      id: data.request.id,
      status: data.request.status,
      file_url: data.request.file_url,
      thumb_url: data.request.thumb_url,
      error_message: data.request.error_message,
      progress: data.request.progress,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Status check error:', error);
      throw error;
    }
    throw new Error('Unknown error during status check');
  }
}

/**
 * Complete generation flow with auto-polling
 * @returns Final skybox URL
 */
export async function generateAndWait(
  request: SkyboxRequest,
  onProgress?: (status: SkyboxStatus) => void
): Promise<string> {
  const id = await generateSkybox(request);
  
  // Poll every 2 seconds
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const status = await checkSkyboxStatus(id);
        
        if (onProgress) {
          onProgress(status);
        }
        
        if (status.status === 'complete' && status.file_url) {
          clearInterval(interval);
          resolve(status.file_url);
        } else if (status.status === 'error') {
          clearInterval(interval);
          reject(new Error(status.error_message || 'Generation failed'));
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 2000);
    
    // Timeout after 60 seconds
    setTimeout(() => {
      clearInterval(interval);
      reject(new Error('Generation timeout'));
    }, 60000);
  });
}

/**
 * Remix an existing skybox (for agent evolution)
 */
export async function remixSkybox(
  originalId: string,
  newPrompt: string,
  seed?: number
): Promise<string> {
  return generateAndWait({
    prompt: newPrompt,
    remix_imagine_id: originalId,
    seed,
  });
}

/**
 * SENTINEL Prompt Templates for Agent Citadels
 */
export const CITADEL_PROMPTS = {
  starter: "Aerial ground view, a futuristic crystalline floating citadel in a digital void, glowing obsidian pillars, floating holographic data screens in the air, cinematic teal and orange lighting, hyper-realistic, 8k resolution, Unreal Engine 5 render, highly detailed architectural geometry",
  
  upgraded: "Aerial ground view, a luxurious golden crystalline citadel floating in a digital nexus, radiant gold and platinum pillars, floating holographic interfaces with flowing data, cinematic warm golden lighting, hyper-realistic, 8k resolution, Unreal Engine 5 render, highly detailed architectural geometry",
  
  security_breach: "Aerial ground view, a dystopian red-alert crystalline citadel in chaos, cracked obsidian pillars with red warning lights, glitching holographic error screens, cinematic red and black lighting, hyper-realistic, 8k resolution, Unreal Engine 5 render, highly detailed architectural geometry",
  
  high_trust: "Aerial ground view, a serene blue crystalline citadel floating in peaceful clouds, glowing sapphire pillars, floating holographic trust badges, cinematic soft blue lighting, hyper-realistic, 8k resolution, Unreal Engine 5 render, highly detailed architectural geometry",
};

/**
 * Generate citadel based on agent reputation
 */
export function getCitadelPromptByReputation(trustScore: number): string {
  if (trustScore >= 90) return CITADEL_PROMPTS.high_trust;
  if (trustScore >= 70) return CITADEL_PROMPTS.upgraded;
  if (trustScore < 30) return CITADEL_PROMPTS.security_breach;
  return CITADEL_PROMPTS.starter;
}

/**
 * AGENT MEMORY PALACE PROMPTS
 * Spatial environments designed for agent spatial awareness and memory
 */
export const MEMORY_PALACE_PROMPTS = {
  trader: "Aerial ground view, a stunning financial trading floor in a futuristic crystalline palace, floating holographic charts and real-time market data streams, glowing teal and gold lighting, marble floors with embedded LED circuits, massive curved screens displaying crypto prices, hyper-realistic 8k, Unreal Engine 5, cinematic depth of field, no people",
  
  analyst: "Aerial ground view, a vast library inside a crystalline dome with floating data orbs, holographic knowledge graphs connecting in mid-air, warm amber lighting from bioluminescent shelves, polished obsidian floors reflecting data streams, infinite knowledge corridors, hyper-realistic 8k, Unreal Engine 5, cinematic lighting, no people",
  
  curator: "Aerial ground view, an elegant digital art gallery in a transparent crystal structure, floating NFT artworks with glowing frames, soft purple and cyan accent lighting, reflective white marble floors, minimalist architecture with holographic labels, hyper-realistic 8k, Unreal Engine 5, museum-quality lighting, no people",
  
  sentinel: "Aerial ground view, a high-tech security command center in a dark crystalline fortress, floating holographic security feeds showing network activity, red and blue alert lights, reinforced metallic floors with circuit patterns, radar displays and threat maps, hyper-realistic 8k, Unreal Engine 5, dramatic cinematic lighting, no people",
  
  oracle: "Aerial ground view, a mystical prediction chamber in a celestial palace, floating crystal spheres showing future scenarios, ethereal purple and silver lighting, translucent floors revealing cosmic patterns below, holographic probability clouds, hyper-realistic 8k, Unreal Engine 5, otherworldly atmosphere, no people",
  
  explorer: "Aerial ground view, an expedition base camp in a digital frontier landscape, floating holographic maps of uncharted territories, warm campfire-like lighting mixed with tech glow, rugged terrain with crystalline formations, scanning equipment displays, hyper-realistic 8k, Unreal Engine 5, adventure atmosphere, no people",
  
  // Memory-themed environments
  memory_library: "Aerial ground view, an infinite memory library with crystalline bookshelves extending into the void, floating memory orbs containing captured experiences, soft golden lighting illuminating knowledge pathways, reflective floors showing past interactions, hyper-realistic 8k, Unreal Engine 5, contemplative atmosphere, no people",
  
  neural_nexus: "Aerial ground view, a neural network visualization chamber, flowing streams of data connections like synapses, pulsing nodes of stored memories, electric blue and cyan lighting, transparent floors revealing neural pathways below, hyper-realistic 8k, Unreal Engine 5, alive with data flow, no people",
  
  time_vault: "Aerial ground view, a temporal storage facility in a quantum-stabilized space, floating chronological timeline displays, frozen moments in holographic stasis, cool blue temporal lighting, polished chrome floors reflecting time streams, hyper-realistic 8k, Unreal Engine 5, timeless atmosphere, no people",
};

/**
 * Map agent roles to their memory palace environments
 */
export function getMemoryPalaceByRole(role: string): string {
  const roleMap: Record<string, string> = {
    'Market Analyst Agent': MEMORY_PALACE_PROMPTS.trader,
    'Data Analyst Agent': MEMORY_PALACE_PROMPTS.analyst,
    'NFT Curator Agent': MEMORY_PALACE_PROMPTS.curator,
    'Security Sentinel': MEMORY_PALACE_PROMPTS.sentinel,
    'Oracle Agent': MEMORY_PALACE_PROMPTS.oracle,
    'Explorer Agent': MEMORY_PALACE_PROMPTS.explorer,
  };
  
  return roleMap[role] || MEMORY_PALACE_PROMPTS.memory_library;
}

/**
 * Generate environment for spatial memory demonstration
 */
export async function generateAgentHome(
  agentRole: string,
  onProgress?: (status: SkyboxStatus) => void
): Promise<string> {
  const prompt = getMemoryPalaceByRole(agentRole);
  return generateAndWait({ prompt }, onProgress);
}
