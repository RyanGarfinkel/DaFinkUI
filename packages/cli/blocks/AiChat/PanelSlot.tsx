'use client';

import { ResizablePanel, ResizableHandle } from '../../components/Resizable/Resizable';
import Drawer, { DrawerHandle } from '../../components/Drawer/Drawer';
import type { ReactNode } from 'react';

export interface PanelSize {
	initial: number;
	min:     number;
	max:     number;
}

export interface PanelSlotProps {
	label:    string;
	children: ReactNode;
}

export interface DesktopPanelProps extends PanelSlotProps {
	size:     PanelSize;
	expanded: boolean;
	onSnap:   () => void;
}

export interface MobilePanelProps extends PanelSlotProps {
	open:    boolean;
	onClose: () => void;
	/** Threads slide in from the right; the other panels rise from the bottom behind a handle. */
	side?:   'right' | 'bottom';
}

const FULL_WIDTH = { width: 'auto', flexGrow: 1, flexShrink: 1 } as const;

export const DesktopPanel = ({ label, size, expanded, onSnap, children }: DesktopPanelProps) => (
	<>
		{!expanded && <ResizableHandle aria-label={`Resize ${label.toLowerCase()} panel`} />}
		<ResizablePanel defaultSize={size.initial} minSize={size.min} maxSize={size.max} onSnap={onSnap} style={expanded ? FULL_WIDTH : undefined} className='flex'>
			{children}
		</ResizablePanel>
	</>
);

export const MobilePanel = ({ label, open, onClose, side = 'bottom', children }: MobilePanelProps) => (
	<Drawer
		open={open}
		onOpenChange={(next) => !next && onClose()}
		side={side}
		aria-label={label}
		className={side === 'right' ? '!w-full !max-w-full' : '!h-[92dvh] !max-h-[92dvh] rounded-t-[var(--radius-lg)]'}
	>
		{side === 'bottom' && <DrawerHandle />}
		{children}
	</Drawer>
);
