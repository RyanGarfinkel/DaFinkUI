import { BLOCK_CATEGORIES } from '@/app/_docs/registry/blockCategories';
import { blocks } from '@/app/_docs/registry/blocks';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blocks',
  description: 'Prebuilt DaFink UI blocks — full compositions like dashboards, login forms, and settings forms, meant to be copied and adapted.',
};

const BlocksPage = () => {
  const byCategory = BLOCK_CATEGORIES.reduce<Record<string, typeof blocks>>(
    (acc, cat) => {
      const entries = blocks.filter((b) => b.category === cat);
      if (entries.length > 0) acc[cat] = entries;
      return acc;
    },
    {},
  );

  const total = blocks.length;

  return (
    <div className='flex flex-col gap-10'>
      {/* Header */}
      <div className='flex flex-col gap-2'>
        <h1 className='text-3xl font-semibold tracking-tight text-text'>Blocks</h1>
        <p className='text-base text-text-muted leading-relaxed'>
          {total} prebuilt blocks across {Object.keys(byCategory).length} categories. Each one is a full
          composition of existing components — copy it in, then adapt it to your use case.
        </p>
      </div>

      {/* Category groups */}
      <div className='flex flex-col gap-10'>
        {BLOCK_CATEGORIES.filter((cat) => byCategory[cat]).map((category) => (
          <section key={category}>
            <h2 className='text-xs font-semibold uppercase tracking-widest text-text-subtle mb-3'>
              {category}
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {byCategory[category].map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/blocks/${entry.slug}`}
                  className='group flex flex-col gap-1 rounded-lg border border-surface-border bg-surface px-4 py-3.5 transition-colors duration-[var(--duration-fast)] hover:border-surface-border-hover hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring'
                >
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-text group-hover:text-brand transition-colors duration-[var(--duration-fast)]'>
                      {entry.name}
                    </span>
                    <span className='text-[10px] font-mono text-text-subtle border border-surface-border rounded px-1.5 py-0.5'>
                      {entry.registryDependencies.length} components
                    </span>
                  </div>
                  <p className='text-xs text-text-muted leading-relaxed line-clamp-2'>
                    {entry.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default BlocksPage;
