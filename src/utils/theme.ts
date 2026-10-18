// Dynamic Theme & Color Utilities for Bright Future Coaching Academy

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex) return null;
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  if (c.length !== 6) return null;
  const num = parseInt(c, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const adjust = (val: number) => Math.min(255, Math.max(0, Math.round(val + (val * percent) / 100)));
  const r = adjust(rgb.r).toString(16).padStart(2, '0');
  const g = adjust(rgb.g).toString(16).padStart(2, '0');
  const b = adjust(rgb.b).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

export function applyDynamicTheme(primaryColor?: string, accentColor?: string) {
  if (typeof document === 'undefined') return;

  const primary = primaryColor?.trim() || '#0f2042';
  const accent = accentColor?.trim() || '#f59e0b';

  const dark = adjustBrightness(primary, -35);
  const light = adjustBrightness(primary, 25);
  const accentDark = adjustBrightness(accent, -20);
  const accentLight = adjustBrightness(accent, 20);

  const root = document.documentElement;
  root.style.setProperty('--theme-primary', primary);
  root.style.setProperty('--theme-primary-dark', dark);
  root.style.setProperty('--theme-primary-light', light);
  root.style.setProperty('--theme-accent', accent);
  root.style.setProperty('--theme-accent-dark', accentDark);
  root.style.setProperty('--theme-accent-light', accentLight);
  root.style.setProperty('--color-primary', primary);
  root.style.setProperty('--color-accent', accent);
  root.style.setProperty(
    '--theme-gradient',
    `linear-gradient(135deg, ${dark} 0%, ${primary} 65%, ${light} 100%)`
  );

  let styleTag = document.getElementById('academy-dynamic-theme-style') as HTMLStyleElement | null;
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'academy-dynamic-theme-style';
    document.head.appendChild(styleTag);
  }

  styleTag.textContent = `
    :root {
      --theme-primary: ${primary};
      --theme-primary-dark: ${dark};
      --theme-primary-light: ${light};
      --theme-accent: ${accent};
      --theme-gradient: linear-gradient(135deg, ${dark} 0%, ${primary} 55%, ${light} 100%);
    }

    /* Core Dynamic Brand Surfaces */
    .bg-dark-blue,
    .bg-\\[\\#0f2042\\],
    .bg-\\[\\#070f1e\\] {
      background-color: ${primary} !important;
    }

    .border-dark-blue,
    .border-blue-900,
    .border-blue-950,
    .border-\\[\\#0f2042\\] {
      border-color: ${dark} !important;
    }

    .text-dark-blue,
    .text-\\[\\#0f2042\\] {
      color: ${primary} !important;
    }

    /* Gradient Hero & Footers */
    .gradient-royal,
    .gradient-dark-blue {
      background: linear-gradient(135deg, ${dark} 0%, ${primary} 55%, ${light} 100%) !important;
    }

    /* Primary Accent Buttons & Highlights */
    .text-amber-400,
    .text-amber-300 {
      color: ${accent} !important;
    }

    .bg-amber-400 {
      background-color: ${accent} !important;
    }

    .border-amber-400 {
      border-color: ${accent} !important;
    }

    /* Active Nav Items & Action CTAs */
    nav a.bg-\\[\\#0f2042\\] {
      background-color: ${primary} !important;
      color: ${accent} !important;
      border-color: ${dark} !important;
    }

    button.bg-blue-700,
    a.bg-blue-700 {
      background-color: ${primary} !important;
    }

    button.bg-blue-700:hover,
    a.bg-blue-700:hover {
      background-color: ${dark} !important;
    }

    .text-blue-700 {
      color: ${primary} !important;
    }

    .border-blue-700 {
      border-color: ${primary} !important;
    }
  `;
}
