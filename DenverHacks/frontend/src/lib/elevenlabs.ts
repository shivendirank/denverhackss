// ElevenLabs Configuration
export const ELEVENLABS_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
  voiceId: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB', // Default: Adam voice
  modelId: 'eleven_monolingual_v1',
  stability: 0.5,
  similarityBoost: 0.75,
  style: 0.0,
  useSpeakerBoost: true,
};

export interface ElevenLabsVoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface ElevenLabsRequest {
  text: string;
  model_id?: string;
  voice_settings?: ElevenLabsVoiceSettings;
}

/**
 * Convert text to speech using ElevenLabs API
 * @param text - The text to convert to speech
 * @param voiceId - Optional custom voice ID
 * @returns Audio blob
 */
export async function textToSpeech(
  text: string,
  voiceId?: string
): Promise<Blob> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || ELEVENLABS_CONFIG.voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_CONFIG.apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_CONFIG.modelId,
        voice_settings: {
          stability: ELEVENLABS_CONFIG.stability,
          similarity_boost: ELEVENLABS_CONFIG.similarityBoost,
          style: ELEVENLABS_CONFIG.style,
          use_speaker_boost: ELEVENLABS_CONFIG.useSpeakerBoost,
        },
      } as ElevenLabsRequest),
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.statusText}`);
  }

  return await response.blob();
}

/**
 * Get available voices from ElevenLabs
 * @returns List of available voices
 */
export async function getVoices() {
  const response = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: {
      'xi-api-key': ELEVENLABS_CONFIG.apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Play audio from blob
 * @param audioBlob - The audio blob to play
 */
export function playAudio(audioBlob: Blob): HTMLAudioElement {
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
  
  // Clean up URL after audio finishes
  audio.onended = () => {
    URL.revokeObjectURL(audioUrl);
  };
  
  return audio;
}
