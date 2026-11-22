import type { FieldProps, Option, Tone, EditHistory } from './Models';
import { describe, it, expectTypeOf } from 'vitest';

describe('Models', () =>
{
	it('makes every field prop optional', () =>
	{
		expectTypeOf<FieldProps>().toEqualTypeOf<{ label?: string; hint?: string; error?: string }>();
	});

	it('requires a value and a label on an option', () =>
	{
		expectTypeOf<Option>().toEqualTypeOf<{ value: string; label: string }>();
	});

	it('limits tone to the four status values', () =>
	{
		expectTypeOf<Tone>().toEqualTypeOf<'default' | 'success' | 'warning' | 'danger'>();
	});

	it('describes undo and redo with their availability', () =>
	{
		expectTypeOf<EditHistory>().toEqualTypeOf<{ undo: () => void; redo: () => void; canUndo: boolean; canRedo: boolean }>();
	});
});
