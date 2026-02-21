# ElevenLabs Voice Integration Setup

## Environment Variables

Add these to your `frontend/.env.local` file:

```env
# ElevenLabs API Configuration
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
NEXT_PUBLIC_ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
```

## Getting Your API Key

1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up or log in
3. Go to Profile Settings → API Keys
4. Copy your API key
5. Add it to `.env.local`

## Available Voices

Default voice ID is `pNInz6obpgDQGcFmaJgB` (Adam - professional male voice).

To use different voices:
1. Visit https://elevenlabs.io/voice-library
2. Choose a voice
3. Copy the voice ID
4. Update `NEXT_PUBLIC_ELEVENLABS_VOICE_ID` in `.env.local`

## Usage Example

```tsx
import { textToSpeech, playAudio } from '@/lib/elevenlabs';

// In your component
const handleSpeak = async () => {
  try {
    const audioBlob = await textToSpeech("Hello, I am Neural Core, your AI Architect.");
    playAudio(audioBlob);
  } catch (error) {
    console.error('Failed to generate speech:', error);
  }
};
```

## Integration with Agent Dashboard

The `AgentOrbWith3D` component supports:
- Voice-powered animations (orb reacts to speech)
- ElevenLabs text-to-speech
- 3D Spline models inside the orb
- Customizable hue colors per agent

## Voice Settings

Adjust in `lib/elevenlabs.ts`:

- `stability` (0-1): Lower = more expressive, Higher = more consistent
- `similarityBoost` (0-1): How closely to match the original voice
- `style` (0-1): Exaggeration of the style (for V2 models)
- `useSpeakerBoost` (boolean): Enhance clarity and maximize similarity

## API Rate Limits

Free tier: 10,000 characters/month
Paid plans: Higher limits and more voices

Check your usage: https://elevenlabs.io/subscription
