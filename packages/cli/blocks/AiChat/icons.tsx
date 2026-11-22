import { CheckIcon as Check, ChevronLeftIcon as ChevronLeft, ChevronRightIcon as ChevronRight, CloseIcon as Close, PlusIcon as Plus, SearchIcon as Search } from '../../components/Icons/Icons';

export const PlusIcon = () => <Plus size={14} />;

export const MenuIcon = () => (
	<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M4 6h16M4 12h16M4 18h16' />
	</svg>
);

export const PencilIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' />
	</svg>
);

export const TrashIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6' />
	</svg>
);

export const ReplyIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<polyline points='9 14 4 9 9 4' />
		<path d='M20 20v-7a4 4 0 0 0-4-4H4' />
	</svg>
);

export const CopyIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<rect width='14' height='14' x='8' y='8' rx='2' ry='2' />
		<path d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' />
	</svg>
);

export const CheckIcon = () => <Check size={14} strokeWidth={2.5} />;

export const SearchIcon = () => <Search size={14} />;

export const ChevronLeftIcon = () => <ChevronLeft size={12} />;

export const ChevronRightIcon = ({ className = '' }: { className?: string }) => <ChevronRight size={12} className={className} />;

export const RefreshIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<polyline points='23 4 23 10 17 10' />
		<polyline points='1 20 1 14 7 14' />
		<path d='M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15' />
	</svg>
);

export const CloseIcon = () => <Close size={14} />;

export const ExpandIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<polyline points='15 3 21 3 21 9' />
		<polyline points='9 21 3 21 3 15' />
		<path d='M21 3l-7 7M3 21l7-7' />
	</svg>
);

export const CollapseIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<polyline points='4 14 10 14 10 20' />
		<polyline points='20 10 14 10 14 4' />
		<path d='M14 10l7-7M3 21l7-7' />
	</svg>
);

export const SlidesIcon = () => (
	<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<rect x='3' y='4' width='18' height='12' rx='2' />
		<path d='M12 16v4M8 20h8' />
	</svg>
);

export const SheetIcon = () => (
	<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<rect x='3' y='3' width='18' height='18' rx='2' />
		<path d='M3 9h18M3 15h18M9 3v18' />
	</svg>
);

export const FileIcon = () => (
	<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z' />
		<path d='M14 2v6h6M8 13h8M8 17h5' />
	</svg>
);

export const ImageIcon = () => (
	<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<rect x='3' y='3' width='18' height='18' rx='2' />
		<circle cx='9' cy='9' r='2' />
		<path d='m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21' />
	</svg>
);

export const CodeIcon = () => (
	<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='m16 18 6-6-6-6M8 6l-6 6 6 6' />
	</svg>
);

export const DownloadIcon = () => (
	<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3' />
	</svg>
);
