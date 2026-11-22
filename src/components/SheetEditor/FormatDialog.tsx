'use client';

import Modal, { ModalContent, ModalFooter, ModalHeader, ModalTitle } from '../Modal/Modal';
import { display, isValidFormat } from './format';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { useState } from 'react';

const EXAMPLES = ['#,##0', '0.00', '$#,##0.00', '0.0%', '000', '#,##0 "units"'];

export interface FormatDialogProps {
	open:         boolean;
	onOpenChange: (open: boolean) => void;
	initial:      string;
	sample:       number;
	onApply:      (pattern: string) => void;
}

const Body = ({ initial, sample, onApply, onClose }: Omit<FormatDialogProps, 'open' | 'onOpenChange'> & { onClose: () => void }) => {
	const [pattern, setPattern] = useState(initial);
	const valid = isValidFormat(pattern);

	const apply = () => {
		if(!valid) return;
		onApply(pattern);
		onClose();
	};

	return (
		<>
			<ModalHeader>
				<ModalTitle>Custom number format</ModalTitle>
			</ModalHeader>
			<ModalContent className='flex flex-col gap-3'>
				<Input
					label='Pattern'
					value={pattern}
					spellCheck={false}
					autoComplete='off'
					error={pattern && !valid ? 'Use at least one 0 or # for the digits.' : undefined}
					hint='0 and # are digits, "," groups thousands, "." starts decimals, % multiplies by 100. Put other text in quotes.'
					onChange={e => setPattern(e.target.value)}
					onKeyDown={e =>
					{
						if(e.key !== 'Enter') return;
						e.preventDefault();
						apply();
					}}
				/>
				<p className='text-sm text-text-muted' aria-live='polite'>
					Preview: <span className='font-mono text-text'>{valid ? display(sample, pattern) : '—'}</span>
				</p>
				<div role='group' aria-label='Examples' className='flex flex-wrap gap-1.5'>
					{EXAMPLES.map(example => (
						<button
							key={example}
							type='button'
							className='rounded-[var(--radius-sm)] border-[length:var(--border-width)] border-input-border px-2 py-1 font-mono text-xs text-text hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring'
							onClick={() => setPattern(example)}
						>
							{example}
						</button>
					))}
				</div>
			</ModalContent>
			<ModalFooter>
				<Button variant='ghost' onClick={onClose}>Cancel</Button>
				<Button disabled={!valid} onClick={apply}>Apply</Button>
			</ModalFooter>
		</>
	);
};

export const FormatDialog = ({ open, onOpenChange, ...body }: FormatDialogProps) => (
	<Modal open={open} onOpenChange={onOpenChange} size='sm'>
		{open && <Body {...body} onClose={() => onOpenChange(false)} />}
	</Modal>
);
