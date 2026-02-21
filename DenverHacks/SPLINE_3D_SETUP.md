# Spline 3D Model Configuration

## Current Setup

The agent dashboard now displays 3D models inside the voice-powered orb using Spline.

### Default Model
Currently using: `https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode`

## Creating Custom 3D Models

1. **Visit Spline**: https://spline.design/
2. **Create or Upload**: Design your AI agent model
3. **Export**: Click "Export" → "Code Export" → Copy the scene URL
4. **Update**: Pass the URL to `AgentOrbWith3D` component

## Per-Agent Custom Models

Update `spatial-product-showcase.tsx` to use different models per agent:

```tsx
const AGENT_SPLINE_MODELS: Record<string, string> = {
  '01': 'https://prod.spline.design/your-neural-core-model/scene.splinecode',
  '02': 'https://prod.spline.design/your-model-trainer-model/scene.splinecode',
  '03': 'https://prod.spline.design/your-observer-model/scene.splinecode',
  '04': 'https://prod.spline.design/your-synthesizer-model/scene.splinecode',
  '05': 'https://prod.spline.design/your-deployer-model/scene.splinecode',
};

// Then in the component:
<AgentOrbWith3D
  splineScene={AGENT_SPLINE_MODELS[data.id] ?? AGENT_SPLINE_MODELS['01']}
  ...
/>
```

## Customization Options

### In `AgentOrbWith3D`:
- `splineScene`: URL to your Spline model
- `showSpline`: Toggle 3D model on/off
- `hue`: Orb color (0-360 degrees)
- `enableVoiceControl`: Animate on voice detection
- `agentName`: Display name below orb

### Model Guidelines
- Keep models under 5MB for fast loading
- Use optimized materials and textures
- Test on mobile devices for performance
- Center your model at origin (0,0,0)
- Scale appropriately for the orb container

## Performance Tips

1. **Lazy Loading**: Already implemented via `Suspense`
2. **Fallback**: Shows loading spinner while model loads
3. **Responsive**: Automatically scales to container size
4. **Optimization**: Models are loaded only when needed

## Spline Features in Agent Dashboard

✅ 3D model rendered inside glowing orb
✅ Scales with voice detection (when enabled)
✅ Smooth animations and transitions
✅ Responsive design (mobile-friendly)
✅ Loading states handled gracefully
✅ Agent name label displayed

## Troubleshooting

**Model not loading?**
- Check the Spline URL is correct and public
- Verify network connectivity
- Check browser console for errors

**Performance issues?**
- Reduce model complexity in Spline editor
- Disable animations in the Spline scene
- Set `showSpline={false}` on low-end devices
