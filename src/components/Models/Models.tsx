export interface FieldProps {
	label?: string;
	hint?:  string;
	error?: string;
}

export interface Option {
	value: string;
	label: string;
}

export type Tone = 'default' | 'success' | 'warning' | 'danger';

export interface EditHistory {
	undo:    () => void;
	redo:    () => void;
	canUndo: boolean;
	canRedo: boolean;
}
