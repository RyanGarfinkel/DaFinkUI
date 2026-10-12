'use client';

import { MODEL_OPTIONS, EFFORT_OPTIONS } from './constants';
import Menu from '../../components/Menu/Menu';
import { ChevronRightIcon } from './icons';

export interface ModelPickerProps {
	model:          string;
	effort:         string;
	onModelChange:  (value: string) => void;
	onEffortChange: (value: string) => void;
}

const labelOf = (options: { value: string; label: string }[], value: string) =>
	options.find((option) => option.value === value)?.label ?? value;

export const ModelPicker = ({ model, effort, onModelChange, onEffortChange }: ModelPickerProps) => {
	const modelLabel  = labelOf(MODEL_OPTIONS, model);
	const effortLabel = labelOf(EFFORT_OPTIONS, effort);

	return (
		<Menu
			side='top'
			align='end'
			unstyledTrigger
			triggerProps={{ 'aria-label': `Model and effort: ${modelLabel}, ${effortLabel}` }}
			triggerClassName='inline-flex cursor-pointer items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 text-xs text-text-muted transition-colors duration-[var(--duration-fast)] hover:bg-surface-hover hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring'
			trigger={(
				<>
					<span>{modelLabel}</span>
					<span aria-hidden='true'>·</span>
					<span>{effortLabel}</span>
					<ChevronRightIcon className='-rotate-90' />
				</>
			)}
			items={[
				{
					label:   'Model',
					detail:  modelLabel,
					submenu: MODEL_OPTIONS.map((option) => ({
						label:    option.label,
						selected: option.value === model,
						onSelect: () => onModelChange(option.value),
					})),
				},
				{
					label:   'Effort',
					detail:  effortLabel,
					submenu: EFFORT_OPTIONS.map((option) => ({
						label:    option.label,
						selected: option.value === effort,
						onSelect: () => onEffortChange(option.value),
					})),
				},
			]}
		/>
	);
};

export default ModelPicker;
