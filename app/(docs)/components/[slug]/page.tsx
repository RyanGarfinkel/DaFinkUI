import { TimelineHorizontalDemo } from '@/src/docs/components/examples/TimelineHorizontalDemo';
import { TimelineDeployDemo } from '@/src/docs/components/examples/TimelineDeployDemo';
import { SkeletonShowcase } from '@/src/docs/components/examples/SkeletonShowcase';
import { ComponentLivePreview } from '@/src/docs/components/ComponentLivePreview';
import { ComponentPreview } from '@/src/docs/components/ComponentPreview';
import { PropsTable } from '@/src/docs/components/PropsTable';
import { getComponent, registry } from '@/src/docs/registry';
import { CodeBlock } from '@/src/docs/components/CodeBlock';
import { notFound } from 'next/navigation';

export const generateStaticParams = async () => {
  return registry.map((entry) => ({ slug: entry.slug }));
};

const ComponentPage = async (
  {
    params,
  }: {
    params: Promise<{ slug: string }>;
  }
) => {
  const { slug } = await params;
  const entry = getComponent(slug);

  if (!entry) notFound();

  const installCommand = `npx @obi/ui add ${entry.slug}`;

  return (
    <div className='flex flex-col gap-10'>
      {/* Header */}
      <div className='flex flex-col gap-2'>
        <h1 className='text-3xl font-semibold tracking-tight text-text'>
          {entry.name}
        </h1>
        <p className='text-base text-text-muted leading-relaxed'>
          {entry.description}
        </p>
      </div>

      {/* Installation */}
      <section className='flex flex-col gap-3'>
        <h2 className='text-sm font-semibold text-text uppercase tracking-wide'>
          Installation
        </h2>
        <CodeBlock code={installCommand} />
        {entry.registryDependencies.length > 0 && (
          <p className='text-sm text-text-muted'>
            Also installs:{' '}
            {entry.registryDependencies
              .map((dep) => {
                const name = dep.charAt(0).toUpperCase() + dep.slice(1);
                return name;
              })
              .join(', ')}
          </p>
        )}
        {entry.dependencies.length > 0 && (
          <p className='text-sm text-text-muted'>
            Requires:{' '}
            <code className='font-mono text-xs'>{entry.dependencies.join(', ')}</code>
          </p>
        )}
      </section>

      {/* Live preview */}
      <section className='flex flex-col gap-3'>
        <h2 className='text-sm font-semibold text-text uppercase tracking-wide'>
          Preview
        </h2>
        <ComponentPreview>
          <ComponentLivePreview slug={slug} />
        </ComponentPreview>
      </section>

      {/* Per-type examples — Skeleton only */}
      {slug === 'skeleton' && (
        <section className='flex flex-col gap-3'>
          <h2 className='text-sm font-semibold text-text uppercase tracking-wide'>
            Examples
          </h2>
          <SkeletonShowcase />
        </section>
      )}

      {/* Horizontal variant — Timeline only */}
      {slug === 'timeline' && (
        <section className='flex flex-col gap-3'>
          <h2 className='text-sm font-semibold text-text uppercase tracking-wide'>
            Horizontal variant
          </h2>
          <p className='text-sm text-text-muted'>
            Pass <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>direction=&quot;horizontal&quot;</code> to lay steps out in a row with a connecting line across the top.
          </p>
          <ComponentPreview>
            <TimelineHorizontalDemo />
          </ComponentPreview>
        </section>
      )}

      {/* Interactive example — Timeline only */}
      {slug === 'timeline' && (
        <section className='flex flex-col gap-3'>
          <h2 className='text-sm font-semibold text-text uppercase tracking-wide'>
            Interactive example
          </h2>
          <p className='text-sm text-text-muted'>
            Click the button to append steps one at a time. Each new entry slides in and the indicator dot pops.
          </p>
          <ComponentPreview>
            <TimelineDeployDemo />
          </ComponentPreview>
        </section>
      )}

      {/* Usage */}
      <section className='flex flex-col gap-3'>
        <h2 className='text-sm font-semibold text-text uppercase tracking-wide'>
          Usage
        </h2>
        <CodeBlock code={entry.usage} />
      </section>

      {/* Props */}
      {entry.props.length > 0 && (
        <section className='flex flex-col gap-3'>
          <h2 className='text-sm font-semibold text-text uppercase tracking-wide'>
            Props
          </h2>
          <PropsTable rows={entry.props} />
        </section>
      )}
    </div>
  );
};

export default ComponentPage;
