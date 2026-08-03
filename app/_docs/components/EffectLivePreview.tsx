'use client';

import TextScramble from '@/src/components/TextScramble/TextScramble';
import Reveal, { RevealGroup } from '@/src/components/Reveal/Reveal';
import { ScrollFade } from '@/src/components/ScrollFade/ScrollFade';
import TextShimmer from '@/src/components/TextShimmer/TextShimmer';
import CursorTrail from '@/src/components/CursorTrail/CursorTrail';
import ClickSpark from '@/src/components/ClickSpark/ClickSpark';
import Typewriter from '@/src/components/Typewriter/Typewriter';
import Particles from '@/src/components/Particles/Particles';
import Spotlight from '@/src/components/Spotlight/Spotlight';
import Confetti from '@/src/components/Confetti/Confetti';
import Magnetic from '@/src/components/Magnetic/Magnetic';
import SlideIn from '@/src/components/SlideIn/SlideIn';
import Meteors from '@/src/components/Meteors/Meteors';
import Marquee from '@/src/components/Marquee/Marquee';
import CountUp from '@/src/components/CountUp/CountUp';
import Button from '@/src/components/Button/Button';
import Ripple from '@/src/components/Ripple/Ripple';

interface EffectLivePreviewProps {
  slug: string;
}

export const EffectLivePreview = ({ slug }: EffectLivePreviewProps) => {
  switch (slug) {
    case 'scroll-fade':
      return (
        <ScrollFade className='h-48 w-full max-w-sm rounded-[var(--radius-lg)] border border-surface-border bg-surface p-4'>
          <ul className='flex flex-col gap-3 text-sm text-text'>
            {Array.from({ length: 12 }, (_, i) => (
              <li key={i}>Item {i + 1}</li>
            ))}
          </ul>
        </ScrollFade>
      );

    case 'reveal':
      return (
        <RevealGroup stagger={120} effect='slide-up' className='flex flex-col gap-3 w-full max-w-sm'>
          <Reveal>
            <div className='rounded-lg border border-surface-border bg-surface px-4 py-3 text-sm text-text'>Scroll-triggered entrance</div>
          </Reveal>
          <Reveal>
            <div className='rounded-lg border border-surface-border bg-surface px-4 py-3 text-sm text-text'>Staggered by 120ms</div>
          </Reveal>
          <Reveal effect='scale'>
            <div className='rounded-lg border border-surface-border bg-surface px-4 py-3 text-sm text-text'>With its own effect</div>
          </Reveal>
        </RevealGroup>
      );

    case 'slide-in':
      return (
        <div className='flex flex-col gap-3 w-full max-w-sm'>
          <SlideIn direction='bottom'>
            <div className='rounded-lg border border-surface-border bg-surface px-4 py-3 text-sm text-text'>Jumps in from the bottom</div>
          </SlideIn>
          <SlideIn direction='left'>
            <div className='rounded-lg border border-surface-border bg-surface px-4 py-3 text-sm text-text'>Jumps in from the left</div>
          </SlideIn>
          <SlideIn direction='right'>
            <div className='rounded-lg border border-surface-border bg-surface px-4 py-3 text-sm text-text'>Jumps in from the right</div>
          </SlideIn>
        </div>
      );

    case 'count-up':
      return (
        <div className='flex flex-wrap items-center justify-center gap-10'>
          <div className='flex flex-col items-center gap-1'>
            <CountUp value={12480} separator=',' className='text-3xl font-semibold tracking-tight text-text' />
            <span className='text-xs text-text-muted'>Daily downloads</span>
          </div>
          <div className='flex flex-col items-center gap-1'>
            <CountUp value={99.98} decimals={2} suffix='%' className='text-3xl font-semibold tracking-tight text-text' />
            <span className='text-xs text-text-muted'>Uptime</span>
          </div>
          <div className='flex flex-col items-center gap-1'>
            <CountUp value={1200000} prefix='$' separator=',' duration={1500} className='text-3xl font-semibold tracking-tight text-text' />
            <span className='text-xs text-text-muted'>ARR</span>
          </div>
        </div>
      );

    case 'text-shimmer':
      return (
        <div className='flex flex-col items-center gap-4'>
          <TextShimmer className='text-2xl font-semibold tracking-tight'>Generating your report…</TextShimmer>
          <TextShimmer duration={1600} className='text-sm font-medium'>Thinking…</TextShimmer>
        </div>
      );

    case 'typewriter':
      return (
        <div className='flex flex-col items-start gap-6'>
          <h2 className='text-3xl font-bold tracking-tight text-text'>
            <Typewriter text='Hello, world.' />
          </h2>
          <p className='text-base font-mono text-text-muted'>
            <Typewriter text='System ready. Awaiting input…' speed={60} delay={400} cursorPersist />
          </p>
        </div>
      );

    case 'marquee':
      return (
        <Marquee pauseOnHover>
          <span className='px-6 text-sm text-text-muted'>Fast</span>
          <span className='px-6 text-sm text-text-muted'>Accessible</span>
          <span className='px-6 text-sm text-text-muted'>Composable</span>
          <span className='px-6 text-sm text-text-muted'>Token-driven</span>
        </Marquee>
      );

    case 'ripple':
      return (
        <Ripple className='h-32 w-32'>
          <div className='h-10 w-10 rounded-full bg-brand' />
        </Ripple>
      );

    case 'particles':
      return (
        <Particles className='h-40 w-full max-w-sm rounded-lg border border-surface-border'>
          <div className='flex h-40 items-center justify-center'>
            <p className='text-sm text-text-muted'>Ambient background</p>
          </div>
        </Particles>
      );

    case 'spotlight':
      return (
        <Spotlight className='rounded-lg border border-surface-border bg-surface p-8'>
          <p className='text-sm text-text'>Move your cursor over this card</p>
        </Spotlight>
      );

    case 'meteors':
      return (
        <Meteors className='h-40 w-full max-w-sm rounded-lg border border-surface-border'>
          <div className='flex h-40 items-center justify-center'>
            <p className='text-sm text-text-muted'>Falling meteors</p>
          </div>
        </Meteors>
      );

    case 'magnetic':
      return (
        <Magnetic>
          <Button variant='primary'>Hover near me</Button>
        </Magnetic>
      );

    case 'cursor-trail':
      return (
        <CursorTrail className='h-40 w-full max-w-sm rounded-lg border border-surface-border'>
          <div className='flex h-40 items-center justify-center'>
            <p className='text-sm text-text-muted'>Move your cursor here</p>
          </div>
        </CursorTrail>
      );

    case 'click-spark':
      return (
        <ClickSpark className='flex h-40 w-full max-w-sm items-center justify-center rounded-lg border border-surface-border'>
          <p className='text-sm text-text-muted'>Click anywhere in this box</p>
        </ClickSpark>
      );

    case 'confetti':
      return (
        <Confetti>
          <Button variant='primary'>Click to celebrate</Button>
        </Confetti>
      );

    case 'text-scramble':
      return (
        <TextScramble text='Decrypting…' className='text-2xl font-semibold tracking-tight text-text' />
      );

    default:
      return (
        <div className='text-sm text-text-muted'>
          No preview available for this effect.
        </div>
      );
  }
};

export default EffectLivePreview;
