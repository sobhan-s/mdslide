---
title: Custom Styling Demo
theme: light
---

<style>
/* Import custom Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Creepster&family=Press+Start+2P&display=swap');

:root {
  /* Override main font to Creepster (spooky/drippy) */
  --slide-font: 'Creepster', cursive;

  /* Override code block font to Press Start 2P (8-bit pixel) */
  --slide-mono: 'Press Start 2P', monospace;

  /* Override accent color to bright neon pink */
  --slide-accent: #ff007f;
  --slide-text: #222222;
}
</style>

# Custom Styling Overrides

### Injecting custom Google Fonts and accent colors directly

---

## Testing Custom Mono Font

Any code blocks or inline code elements will automatically inherit the Press Start 2P font family:

```typescript
const isWorking = true;
console.log('Custom monospace font works!');
```

---

## Accents & Highlight Checks

Bullet markers, hyperlinks, and highlighted code borders will reflect the bright neon pink accent color:

- Point number one (Note the pink marker)
- Visit the compiler repository [Here](https://github.com/mindfiredigital/mdslide)
- Clean, customizable variable tokens
