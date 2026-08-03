// Effect entries mirror ComponentEntry exactly (they're real, prop-driven,
// individually testable/specced components) but live in their own gallery
// section, separate from app/_docs/registry/index.ts, the same way blocks
// live separately from components. See rules/docs-site.md -> "Effect Registry".
import type { ComponentEntry } from './index';

export type EffectEntry = ComponentEntry;

export const effects: EffectEntry[] = [
  {
    slug: 'scroll-fade',
    name: 'ScrollFade',
    category: 'Scroll',
    description: 'A scroll container that fades whichever edge still has more content to reveal, instead of cutting content off abruptly.',
    usage: `import { ScrollFade } from '@components';

export default function Example() {
  return (
    <ScrollFade className="h-48 w-full max-w-sm rounded-[var(--radius-lg)] border border-surface-border bg-surface p-4">
      <ul className="flex flex-col gap-3 text-sm text-text">
        {Array.from({ length: 12 }, (_, i) => (
          <li key={i}>Item {i + 1}</li>
        ))}
      </ul>
    </ScrollFade>
  );
}`,
    props: [
      { name: 'direction', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Which axis scrolls. Vertical fades top/bottom; horizontal fades left/right.' },
      { name: 'fadeSize',  type: 'string', default: "'h-10' / 'w-10'", description: 'Tailwind size class for how deep the fade extends from the edge.' },
      { name: 'fadeFrom',  type: 'string', default: "'from-surface'", description: "Tailwind gradient-from color class. Match the scrolling content's actual background or the fade won't blend." },
      { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes merged onto the scrollable element.' },
      { name: 'wrapperClassName', type: 'string', default: "''", description: 'Additional CSS classes merged onto the outer wrapper; use for flex-sizing (e.g. flex-1 min-h-0) when ScrollFade must grow inside a flex-col parent.' },
      { name: 'children',  type: 'ReactNode', default: 'undefined', description: 'The scrollable content.' },
    ],
    dependencies:         [],
    registryDependencies: [],
    files:                ['ScrollFade/ScrollFade.tsx'],
  },
  {
    slug: 'reveal',
    name: 'Reveal',
    category: 'Scroll',
    description: 'Scroll-triggered entrance animation driven by IntersectionObserver, with a RevealGroup for staggered cascades. Content stays visible without JS and under reduced motion.',
    usage: `import { Reveal, RevealGroup } from '@components';

export default function Example() {
  return (
    <RevealGroup stagger={120} effect="slide-up" className="flex flex-col gap-3 w-full max-w-sm">
      <Reveal>
        <div className="rounded-lg border border-surface-border bg-surface px-4 py-3 text-sm text-text">Scroll-triggered entrance</div>
      </Reveal>
      <Reveal>
        <div className="rounded-lg border border-surface-border bg-surface px-4 py-3 text-sm text-text">Staggered by 120ms</div>
      </Reveal>
      <Reveal effect="scale">
        <div className="rounded-lg border border-surface-border bg-surface px-4 py-3 text-sm text-text">With its own effect</div>
      </Reveal>
    </RevealGroup>
  );
}`,
    props: [
      {
        name: 'effect',
        type: '"fade" | "slide-up" | "slide-left" | "slide-right" | "scale"',
        default: '"fade"',
        description: 'Entrance effect applied when the element scrolls into view.',
      },
      {
        name: 'delay',
        type: 'number',
        default: '0',
        description: 'Delay in milliseconds before the entrance transition starts.',
      },
      {
        name: 'once',
        type: 'boolean',
        default: 'true',
        description: 'Reveal only on first entry. When false, content re-hides on exit and re-reveals on re-entry.',
      },
      {
        name: 'stagger (RevealGroup)',
        type: 'number',
        default: '100',
        description: 'Milliseconds added to each successive child Reveal’s delay.',
      },
      {
        name: 'delay (RevealGroup)',
        type: 'number',
        default: '0',
        description: 'Base delay applied to the first child of the group.',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional Tailwind classes merged onto the wrapper element.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Reveal/Reveal.tsx'],
    composition: {
      name: 'RevealGroup',
      children: [
        { name: 'Reveal' },
      ],
    },
  },
  {
    slug: 'slide-in',
    name: 'SlideIn',
    category: 'Scroll',
    description: 'A small, fixed-distance jump-and-fade entrance triggered by IntersectionObserver, from the left, right, or bottom edge.',
    usage: `import { SlideIn } from '@components';

export default function Example() {
  return (
    <div className="flex flex-col gap-3 w-full max-w-sm">
      <SlideIn direction="bottom">
        <div className="rounded-lg border border-surface-border bg-surface px-4 py-3 text-sm text-text">Jumps in from the bottom</div>
      </SlideIn>
      <SlideIn direction="left">
        <div className="rounded-lg border border-surface-border bg-surface px-4 py-3 text-sm text-text">Jumps in from the left</div>
      </SlideIn>
      <SlideIn direction="right">
        <div className="rounded-lg border border-surface-border bg-surface px-4 py-3 text-sm text-text">Jumps in from the right</div>
      </SlideIn>
    </div>
  );
}`,
    props: [
      { name: 'direction', type: "'left' | 'right' | 'bottom'", default: "'bottom'", description: 'Which edge the element jumps in from when scrolled into view.' },
      { name: 'distance',  type: 'number',    default: '24',  description: 'Pixel distance of the jump.' },
      { name: 'once',      type: 'boolean',   default: 'true', description: 'Reveal only on first entry. When false, content re-hides on exit and re-reveals on re-entry.' },
      { name: 'children',  type: 'ReactNode', default: '-',   description: 'Content to reveal.' },
      { name: 'className', type: 'string',    default: "''",  description: 'Additional CSS classes.' },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['SlideIn/SlideIn.tsx'],
  },
  {
    slug: 'count-up',
    name: 'CountUp',
    category: 'Text',
    description: 'Animates a number from a start value to its final value when scrolled into view. Screen readers always get the real value; reduced motion renders it immediately.',
    usage: `import { CountUp } from '@components';

export default function Example() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-10">
      <div className="flex flex-col items-center gap-1">
        <CountUp value={12480} separator="," className="text-3xl font-semibold tracking-tight text-text" />
        <span className="text-xs text-text-muted">Daily downloads</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <CountUp value={99.98} decimals={2} suffix="%" className="text-3xl font-semibold tracking-tight text-text" />
        <span className="text-xs text-text-muted">Uptime</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <CountUp value={1200000} prefix="$" separator="," duration={1500} className="text-3xl font-semibold tracking-tight text-text" />
        <span className="text-xs text-text-muted">ARR</span>
      </div>
    </div>
  );
}`,
    props: [
      {
        name: 'value',
        type: 'number',
        default: '-',
        description: 'Required. Final value to count up to.',
      },
      {
        name: 'start',
        type: 'number',
        default: '0',
        description: 'Value the animation starts from.',
      },
      {
        name: 'duration',
        type: 'number',
        default: '1000',
        description: 'Animation duration in milliseconds, eased with the --ease-standard token curve.',
      },
      {
        name: 'decimals',
        type: 'number',
        default: '0',
        description: 'Number of decimal places rendered.',
      },
      {
        name: 'prefix',
        type: 'string',
        default: '""',
        description: 'String prepended to the number (e.g. "$").',
      },
      {
        name: 'suffix',
        type: 'string',
        default: '""',
        description: 'String appended to the number (e.g. "%").',
      },
      {
        name: 'separator',
        type: 'string',
        default: '""',
        description: 'Thousands separator (e.g. ",").',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional Tailwind classes merged onto the root span.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['CountUp/CountUp.tsx'],
  },
  {
    slug: 'text-shimmer',
    name: 'TextShimmer',
    category: 'Text',
    description: 'Text with a looping gradient shimmer sweeping across it via background-clip: text. Token-driven colors keep AA contrast; reduced motion renders static text.',
    usage: `import { TextShimmer } from '@components';

export default function Example() {
  return (
    <div className="flex flex-col items-center gap-4">
      <TextShimmer className="text-2xl font-semibold tracking-tight">Generating your report…</TextShimmer>
      <TextShimmer duration={1600} className="text-sm font-medium">Thinking…</TextShimmer>
    </div>
  );
}`,
    props: [
      {
        name: 'duration',
        type: 'number',
        default: 'calc(var(--duration-slow) * 8)',
        description: 'Duration of one shimmer sweep in milliseconds. Defaults to a token-derived 2400ms.',
      },
      {
        name: 'children',
        type: 'ReactNode',
        default: '-',
        description: 'Required. The text to shimmer.',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional Tailwind classes merged onto the text element.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['TextShimmer/TextShimmer.tsx'],
  },
  {
    slug: 'typewriter',
    name: 'Typewriter',
    category: 'Text',
    description: 'Reveals text character by character, like a terminal being typed in real time. Screen readers receive the full string immediately; reduced motion renders it statically.',
    usage: `import { Typewriter } from '@components';

export default function Example() {
  return (
    <div className="flex flex-col items-start gap-6">
      <h1 className="text-4xl font-bold tracking-tight text-text">
        <Typewriter text="Hello, world." />
      </h1>
      <p className="text-base font-mono text-text-muted">
        <Typewriter
          text="System ready. Awaiting input…"
          speed={60}
          delay={400}
          cursorPersist
        />
      </p>
    </div>
  );
}`,
    props: [
      {
        name: 'text',
        type: 'string',
        default: '-',
        description: 'Required. The full text to type out.',
      },
      {
        name: 'speed',
        type: 'number',
        default: '50',
        description: 'Milliseconds between each character.',
      },
      {
        name: 'delay',
        type: 'number',
        default: '0',
        description: 'Milliseconds to wait before typing begins.',
      },
      {
        name: 'cursor',
        type: 'boolean',
        default: 'true',
        description: 'Show a blinking | cursor while typing.',
      },
      {
        name: 'cursorPersist',
        type: 'boolean',
        default: 'false',
        description: 'Keep the cursor visible after typing completes.',
      },
      {
        name: 'onComplete',
        type: '() => void',
        default: '-',
        description: 'Called when all characters have been revealed.',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional Tailwind classes merged onto the root span.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Typewriter/Typewriter.tsx'],
  },
  {
    slug: 'marquee',
    name: 'Marquee',
    category: 'Background',
    description: 'Infinite horizontal scrolling strip of content, used as an ambient ticker or logo wall. Renders children twice in a track that translates by exactly -50% for a seamless loop.',
    usage: `import { Marquee } from '@components';

export default function Example() {
  return (
    <Marquee pauseOnHover>
      <span className="px-6 text-sm text-text-muted">Fast</span>
      <span className="px-6 text-sm text-text-muted">Accessible</span>
      <span className="px-6 text-sm text-text-muted">Composable</span>
      <span className="px-6 text-sm text-text-muted">Token-driven</span>
    </Marquee>
  );
}`,
    props: [
      { name: 'direction',    type: "'left' | 'right'", default: "'left'", description: 'Scroll direction of the track.' },
      { name: 'duration',     type: 'number',           default: '20',     description: 'Seconds for one full loop of the track.' },
      { name: 'pauseOnHover', type: 'boolean',          default: 'true',   description: 'Pause the scroll animation while the pointer hovers the marquee.' },
      { name: 'gap',          type: 'number',           default: '16',     description: 'Pixel gap between repeated copies of the content.' },
      { name: 'children',     type: 'ReactNode',        default: '-',      description: 'Required. The content to repeat and scroll.' },
      { name: 'className',    type: 'string',           default: "''",     description: 'Additional CSS classes.' },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Marquee/Marquee.tsx'],
  },
  {
    slug: 'ripple',
    name: 'Ripple',
    category: 'Background',
    description: 'Decorative concentric rings expanding outward and fading out in a continuous, staggered loop, typically placed behind a logo or icon.',
    usage: `import { Ripple } from '@components';

export default function Example() {
  return (
    <Ripple className="h-32 w-32">
      <div className="h-10 w-10 rounded-full bg-brand" />
    </Ripple>
  );
}`,
    props: [
      { name: 'count',     type: 'number',    default: '4',    description: 'Number of concentric rings.' },
      { name: 'duration',  type: 'number',    default: '3000', description: "Milliseconds for one ring's full expand-and-fade cycle." },
      { name: 'children',  type: 'ReactNode', default: '-',    description: 'Optional content rendered centered above the rings.' },
      { name: 'className', type: 'string',    default: "''",   description: 'Additional CSS classes.' },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Ripple/Ripple.tsx'],
  },
  {
    slug: 'particles',
    name: 'Particles',
    category: 'Background',
    description: 'A purely decorative ambient background of small floating dots, gently drifting and pulsing opacity, meant to sit behind real content. Dot positions come from a deterministic seeded PRNG so server and client render identically.',
    usage: `import { Particles } from '@components';

export default function Example() {
  return (
    <Particles className="h-40 w-full max-w-sm rounded-lg border border-surface-border">
      <div className="flex h-40 items-center justify-center">
        <p className="text-sm text-text-muted">Ambient background</p>
      </div>
    </Particles>
  );
}`,
    props: [
      { name: 'quantity',  type: 'number',    default: '30', description: 'Number of floating dots to render.' },
      { name: 'children',  type: 'ReactNode', default: '-',  description: 'Optional content rendered above the particles.' },
      { name: 'className', type: 'string',    default: "''", description: 'Additional CSS classes.' },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Particles/Particles.tsx'],
  },
  {
    slug: 'spotlight',
    name: 'Spotlight',
    category: 'Cursor',
    description: 'Wraps content in a container with a soft radial glow that follows the cursor, revealing a "spotlight" highlight as it moves over it.',
    usage: `import { Spotlight } from '@components';

export default function Example() {
  return (
    <Spotlight className="rounded-lg border border-surface-border bg-surface p-8">
      <p className="text-sm text-text">Move your cursor over this card</p>
    </Spotlight>
  );
}`,
    props: [
      { name: 'size',      type: 'number',    default: '400', description: 'Diameter of the glow in pixels.' },
      { name: 'children',  type: 'ReactNode', default: '-',   description: 'Required. The content to wrap.' },
      { name: 'className', type: 'string',    default: "''",  description: 'Additional CSS classes.' },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Spotlight/Spotlight.tsx'],
  },
  {
    slug: 'meteors',
    name: 'Meteors',
    category: 'Background',
    description: 'A purely decorative ambient background of small diagonal "shooting star" streaks that repeatedly fall across a container, staggered so several are visible mid-flight at once.',
    usage: `import { Meteors } from '@components';

export default function Example() {
  return (
    <Meteors className="h-40 w-full max-w-sm rounded-lg border border-surface-border">
      <div className="flex h-40 items-center justify-center">
        <p className="text-sm text-text-muted">Falling meteors</p>
      </div>
    </Meteors>
  );
}`,
    props: [
      { name: 'count',     type: 'number',    default: '10', description: 'Number of meteor streaks rendered.' },
      { name: 'children',  type: 'ReactNode', default: '-',  description: 'Optional content rendered above the meteors.' },
      { name: 'className', type: 'string',    default: "''", description: 'Additional CSS classes.' },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Meteors/Meteors.tsx'],
  },
  {
    slug: 'magnetic',
    name: 'Magnetic',
    category: 'Cursor',
    description: "A wrapper that makes its child subtly translate toward the cursor when nearby, and snap back to rest when the cursor leaves. Common on buttons for a tactile 'magnetic hover' feel.",
    usage: `import { Magnetic } from '@components';
import { Button } from '@components';

export default function Example() {
  return (
    <Magnetic>
      <Button variant="primary">Hover near me</Button>
    </Magnetic>
  );
}`,
    props: [
      { name: 'children',  type: 'ReactElement', default: '-',   description: 'Required. A single interactive child that follows the cursor.' },
      { name: 'strength',  type: 'number',       default: '0.3', description: 'Multiplier applied to the cursor offset, 0-1.' },
      { name: 'range',     type: 'number',       default: '80',  description: "Activation radius in px around the wrapper's center." },
      { name: 'className', type: 'string',       default: "''",  description: 'Additional CSS classes, applied to the wrapping div.' },
    ],
    dependencies: [],
    registryDependencies: ['button'],
    files: ['Magnetic/Magnetic.tsx'],
  },
  {
    slug: 'cursor-trail',
    name: 'CursorTrail',
    category: 'Cursor',
    description: 'A short trail of glowing dots that follows the cursor with a slight lag, each dot progressively smaller and fainter toward the tail.',
    usage: `import { CursorTrail } from '@components';

export default function Example() {
  return (
    <CursorTrail className="h-40 w-full max-w-sm rounded-lg border border-surface-border">
      <div className="flex h-40 items-center justify-center">
        <p className="text-sm text-text-muted">Move your cursor here</p>
      </div>
    </CursorTrail>
  );
}`,
    props: [
      { name: 'children',    type: 'ReactNode', default: '-',  description: 'Required. Content the trail overlays.' },
      { name: 'trailLength', type: 'number',    default: '6',  description: 'Number of dots in the trail.' },
      { name: 'size',        type: 'number',    default: '12', description: 'Diameter in pixels of the leading (largest) dot.' },
      { name: 'className',   type: 'string',    default: "''", description: 'Additional CSS classes.' },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['CursorTrail/CursorTrail.tsx'],
  },
  {
    slug: 'click-spark',
    name: 'ClickSpark',
    category: 'Cursor',
    description: 'Spawns a brief burst of thin spark lines radiating outward from the click point on every click, fading out as they travel — a satisfying, subtle click-feedback effect.',
    usage: `import { ClickSpark } from '@components';

export default function Example() {
  return (
    <ClickSpark className="flex h-40 w-full max-w-sm items-center justify-center rounded-lg border border-surface-border">
      <p className="text-sm text-text-muted">Click anywhere in this box</p>
    </ClickSpark>
  );
}`,
    props: [
      { name: 'children',   type: 'ReactNode', default: '-',   description: 'Required. Content to wrap. Clicks anywhere within trigger a burst at the click coordinates.' },
      { name: 'sparkCount', type: 'number',    default: '8',   description: 'Number of spark lines rendered per burst.' },
      { name: 'sparkSize',  type: 'number',    default: '12',  description: 'Length of each spark line in pixels.' },
      { name: 'duration',   type: 'number',    default: '400', description: "Milliseconds for one burst's full shoot-and-fade animation." },
      { name: 'className',  type: 'string',    default: "''",  description: 'Additional CSS classes.' },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['ClickSpark/ClickSpark.tsx'],
  },
  {
    slug: 'confetti',
    name: 'Confetti',
    category: 'Cursor',
    description: 'Bursts colorful confetti pieces outward from the click point on every click — falling, spinning, and fading out. A celebratory effect for success states, completions, and purchases.',
    usage: `import { Confetti } from '@components';
import { Button } from '@components';

export default function Example() {
  return (
    <Confetti>
      <Button variant="primary">Click to celebrate</Button>
    </Confetti>
  );
}`,
    props: [
      { name: 'children',      type: 'ReactNode', default: '-',    description: 'Required. Content to wrap, typically a button. Clicking it (or anywhere in the wrapper) triggers the burst.' },
      { name: 'particleCount', type: 'number',    default: '60',   description: 'Number of confetti pieces rendered per burst.' },
      { name: 'colors',        type: 'string[]',  default: "['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#a78bfa']", description: 'Hex colors randomly assigned to pieces.' },
      { name: 'duration',      type: 'number',    default: '1500', description: "Milliseconds for one burst's full fall-and-fade animation." },
      { name: 'className',     type: 'string',    default: "''",   description: 'Additional CSS classes.' },
    ],
    dependencies: [],
    registryDependencies: ['button'],
    files: ['Confetti/Confetti.tsx'],
  },
  {
    slug: 'text-scramble',
    name: 'TextScramble',
    category: 'Text',
    description: 'Text that animates in by rapidly cycling through random-looking characters before resolving, left-to-right, into the real final text — a "decrypt" reveal effect.',
    usage: `import { TextScramble } from '@components';

export default function Example() {
  return (
    <TextScramble text="Decrypting…" className="text-2xl font-semibold tracking-tight text-text" />
  );
}`,
    props: [
      { name: 'text',       type: 'string', default: '-',                        description: 'Required. The final text to resolve to.' },
      { name: 'duration',   type: 'number', default: '800',                       description: 'Total milliseconds for the scramble-to-resolve animation.' },
      { name: 'characters', type: 'string', default: '\'!<>-_\\\\/[]{}—=+*^?#\'',     description: 'Charset used for scrambling filler characters.' },
      { name: 'className',  type: 'string', default: "''",                       description: 'Additional CSS classes.' },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['TextScramble/TextScramble.tsx'],
  },
];

export const getEffect = (slug: string) => {
  return effects.find(e => e.slug === slug);
};

/** `effects` filtered to entries meant for the /effects gallery, sidebar, and
 * search. Mirrors `visibleRegistry` in index.ts; no entry is hidden today,
 * but this keeps the two registries following the same convention. */
export const visibleEffects = effects.filter(e => !e.hidden);
