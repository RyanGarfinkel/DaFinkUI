import { HTMLAttributes } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FormulaSize    = 'sm' | 'md' | 'lg';
export type FormulaDisplay = 'inline' | 'block';

export interface FormulaProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'dangerouslySetInnerHTML'>
{
	/** The math expression, written in LaTeX (e.g. "x^2 + y^2 = r^2", "\\frac{a}{b}", "\\sum_{i=1}^{n} x_i"). */
	expression: string;
	/** "inline" flows with surrounding text; "block" centers the equation on its own line. */
	display?:   FormulaDisplay;
	/** Font size of the rendered formula. */
	size?:      FormulaSize;
}

const SIZE_CLASSES: Record<FormulaSize, string> = {
	sm: 'text-sm',
	md: 'text-base',
	lg: 'text-lg',
};

// ─── Formula ──────────────────────────────────────────────────────────────────

export const Formula = ({ expression, display = 'inline', size = 'md', className = '', ...props }: FormulaProps) =>
{
	const html = katex.renderToString(expression, {
		displayMode:  display === 'block',
		throwOnError: false,
		errorColor:   'var(--color-danger)',
		output:       'htmlAndMathml',
	});

	const Tag = display === 'block' ? 'div' : 'span';

	return (
		<Tag
			{...props}
			className={[SIZE_CLASSES[size], className].filter(Boolean).join(' ')}
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
};

export default Formula;
