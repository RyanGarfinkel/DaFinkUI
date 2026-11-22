import { CodeIcon, FileIcon, ImageIcon, SheetIcon, SlidesIcon } from './icons';
import type { ArtifactKind } from './types';
import type { ReactNode } from 'react';

type EntryKind = ArtifactKind | 'slides' | 'sheet';

export const KIND_LABELS: Record<EntryKind, string> = {
	pdf:      'PDF',
	markdown: 'Document',
	image:    'Image',
	code:     'Code',
	slides:   'Slides',
	sheet:    'Sheet',
};

export const KIND_ICONS: Record<EntryKind, ReactNode> = {
	pdf:      <FileIcon />,
	markdown: <FileIcon />,
	image:    <ImageIcon />,
	code:     <CodeIcon />,
	slides:   <SlidesIcon />,
	sheet:    <SheetIcon />,
};
