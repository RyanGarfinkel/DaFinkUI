'use client';

import { CodeBlock } from '../../components/CodeBlock/CodeBlock';
import Button from '../../components/Button/Button';
import { ChatMarkdown } from './ChatMarkdown';
import type { ChatArtifact } from './types';
import { DownloadIcon } from './icons';

export interface ArtifactViewerProps {
	artifact: ChatArtifact;
}

const MIME_TYPES = { markdown: 'text/markdown', code: 'text/plain' } as const;

const downloadArtifact = (artifact: ChatArtifact) => {
	const isText = artifact.kind === 'markdown' || artifact.kind === 'code';
	const href = isText ? URL.createObjectURL(new Blob([artifact.content], { type: MIME_TYPES[artifact.kind as keyof typeof MIME_TYPES] })) : artifact.content;
	const link = Object.assign(document.createElement('a'), { href, download: artifact.filename ?? artifact.title });

	link.click();
	if(isText) setTimeout(() => URL.revokeObjectURL(href), 1000);
};

const Body = ({ artifact }: ArtifactViewerProps) => {
	switch(artifact.kind)
	{
	case 'pdf':
		return <iframe src={artifact.content} title={artifact.title} className='h-full w-full border-0 bg-surface' />;

	case 'image':
		return (
			<div className='flex h-full items-center justify-center overflow-auto p-5'>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={artifact.content} alt={artifact.title} className='max-h-full max-w-full rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border bg-white object-contain' />
			</div>
		);

	case 'markdown':
		return (
			<div className='h-full overflow-auto p-5'>
				<ChatMarkdown text={artifact.content} />
			</div>
		);

	case 'code':
		return (
			<div className='h-full overflow-auto p-5'>
				<CodeBlock code={artifact.content} />
			</div>
		);
	}
};

export const ArtifactViewer = ({ artifact }: ArtifactViewerProps) => (
	<div className='flex h-full min-h-0 flex-col'>
		<div className='flex shrink-0 items-center justify-between gap-2 border-b-[length:var(--border-width)] border-surface-border px-4 py-2'>
			<p className='min-w-0 truncate text-xs text-text-muted'>{artifact.filename ?? artifact.title}</p>
			<Button variant='ghost' size='sm' className='gap-1.5' onClick={() => downloadArtifact(artifact)}>
				<DownloadIcon />
				Download
			</Button>
		</div>
		<div className='min-h-0 flex-1'>
			<Body artifact={artifact} />
		</div>
	</div>
);

export default ArtifactViewer;
