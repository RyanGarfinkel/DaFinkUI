import { ComponentLivePreview } from '@/app/_docs/components/ComponentLivePreview';
import { ComponentComposition } from '@/app/_docs/components/ComponentComposition';
import { componentExamples } from '@/app/_docs/registry/componentExamples';
import { ComponentPreview } from '@/app/_docs/components/ComponentPreview';
import { extraSections } from '@/app/_docs/registry/extraSections';
import { CodeBlock } from '@/src/components/CodeBlock/CodeBlock';
import { PropsTable } from '@/app/_docs/components/PropsTable';
import { getComponent, registry } from '@/app/_docs/registry';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const generateMetadata = async (
	{ params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> =>
{
	const { slug } = await params;
	const entry = getComponent(slug);

	if(!entry) return {};

	return {
		title: entry.name,
		description: entry.description,
	};
};

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

  const installCommand = `npx dafink-ui add ${entry.slug}`;
  const extraDemos = componentExamples[slug] ?? [];
  const demosHeading = extraDemos.length === 0 ? 'Demo' : 'Demos';

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

      {/* Demo(s) — a list of at least one (the primary live preview + its usage
          code), plus any additional named examples registered for this slug in
          componentExamples. Every item shows its own Preview/Code toggle, so
          there is no separate standalone "Usage" section. */}
      <section className='flex flex-col gap-3'>
        <h2 className='text-sm font-semibold text-text uppercase tracking-wide'>
          {demosHeading}
        </h2>
        <CodeBlock variant='example' label={slug} code={entry.usage}>
          <ComponentLivePreview slug={slug} />
        </CodeBlock>

        {extraDemos.length > 0 && (
          <div className='flex flex-col gap-10 mt-2 pt-6 border-t border-surface-border'>
            {extraDemos.map((example) => (
              <section key={example.id} className='flex flex-col gap-1'>
                <h3 className='text-sm font-semibold text-text font-mono'>
                  {example.title}
                </h3>
                {example.description && (
                  <p className='text-sm text-text-muted mb-3'>
                    {example.description}
                  </p>
                )}
                <CodeBlock variant='example' label={example.id} code={example.usage} minHeight='120px' align='start'>
                  {example.preview}
                </CodeBlock>
              </section>
            ))}
          </div>
        )}
      </section>

      {/* Composition — only rendered for compound components */}
      {entry.composition && (
        <section className='flex flex-col gap-3'>
          <h2 className='text-sm font-semibold text-text uppercase tracking-wide'>
            Composition
          </h2>
          <ComponentPreview>
            <ComponentComposition composition={entry.composition} />
          </ComponentPreview>
        </section>
      )}

      {/* Extra sections (variant demos, interactive examples) — data-driven per slug */}
      {(extraSections[slug] ?? []).map((section) => (
        <section key={section.heading} className='flex flex-col gap-3'>
          <h2 className='text-sm font-semibold text-text uppercase tracking-wide'>
            {section.heading}
          </h2>
          {section.description && (
            <p className='text-sm text-text-muted'>
              {section.description}
            </p>
          )}
          <ComponentPreview>
            {section.demo}
          </ComponentPreview>
        </section>
      ))}

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
