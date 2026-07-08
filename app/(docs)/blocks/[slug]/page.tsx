import { blockPreviews } from '@/app/_docs/registry/blockPreviews';
import { blockExamples } from '@/app/_docs/registry/blockExamples';
import { CodeBlock } from '@/src/components/CodeBlock/CodeBlock';
import { getBlock, blocks } from '@/app/_docs/registry/blocks';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const generateMetadata = async (
	{ params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> =>
{
	const { slug } = await params;
	const entry = getBlock(slug);

	if(!entry) return {};

	return {
		title: entry.name,
		description: entry.description,
	};
};

export const generateStaticParams = async () => {
  return blocks.map((entry) => ({ slug: entry.slug }));
};

const BlockPage = async (
  {
    params,
  }: {
    params: Promise<{ slug: string }>;
  }
) => {
  const { slug } = await params;
  const entry = getBlock(slug);

  if (!entry) notFound();

  const installCommand = `npx dafink-ui add ${entry.slug}`;
  const extraDemos = blockExamples[slug] ?? [];
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
          blockExamples. Every item shows its own Preview/Code toggle, so there
          is no separate standalone "Usage" section. */}
      <section className='flex flex-col gap-3'>
        <h2 className='text-sm font-semibold text-text uppercase tracking-wide'>
          {demosHeading}
        </h2>
        <CodeBlock variant='example' label={entry.name} code={entry.usage} minHeight='320px'>
          {blockPreviews[slug]}
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
                <CodeBlock variant='example' label={example.id} code={example.usage} minHeight='320px'>
                  {example.preview}
                </CodeBlock>
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default BlockPage;
