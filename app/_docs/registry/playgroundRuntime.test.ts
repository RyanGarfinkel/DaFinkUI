'use client';

import { evaluateBody, ensureReturn } from './playgroundRuntime';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as React from 'react';

describe('evaluateBody', () =>
{
	it('renders a valid function body against the given scope', () =>
	{
		const Fake = ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'fake' }, children);
		const node = evaluateBody('return (<Fake>Hello</Fake>);', { Fake });

		render(node as React.ReactElement);
		expect(screen.getByTestId('fake').textContent).toBe('Hello');
	});

	it('throws a catchable error on malformed JSX instead of crashing', () =>
	{
		expect(() => evaluateBody('return (<div>;', {})).toThrow();
	});

	it('throws a catchable error when referencing an undefined variable', () =>
	{
		expect(() => evaluateBody('return SomeUndefinedThing.doStuff();', {})).toThrow();
	});

	it('throws a catchable error when the scope is missing a referenced component', () =>
	{
		expect(() => evaluateBody('return (<NotInScope />);', {})).toThrow();
	});

	it('does not hang on an infinite while loop — loop-protect breaks it and execution continues', () =>
	{
		const start = Date.now();
		const node = evaluateBody(
			'let n = 0;\nwhile (true) { n++; }\nreturn (<div data-testid="done">{n > 0 ? "ran" : "skipped"}</div>);',
			{}
		);
		const elapsed = Date.now() - start;

		render(node as React.ReactElement);
		expect(screen.getByTestId('done').textContent).toBe('ran');
		expect(elapsed).toBeLessThan(2000);
	});

	it('does not hang on an infinite for loop', () =>
	{
		const start = Date.now();
		const node = evaluateBody(
			'for (;;) { /* spin */ }\nreturn (<div data-testid="done">ok</div>);',
			{}
		);
		const elapsed = Date.now() - start;

		render(node as React.ReactElement);
		expect(screen.getByTestId('done').textContent).toBe('ok');
		expect(elapsed).toBeLessThan(2000);
	});

	it('still completes a short, legitimate loop without cutting it off early', () =>
	{
		const node = evaluateBody(
			'let total = 0;\nfor (let i = 0; i < 5; i++) { total += i; }\nreturn (<div data-testid="sum">{total}</div>);',
			{}
		);

		render(node as React.ReactElement);
		expect(screen.getByTestId('sum').textContent).toBe('10');
	});

	it('does not throw for code that reads ambient globals (documented, not sandboxed)', () =>
	{
		expect(() => evaluateBody('return (<div>{typeof window}</div>);', {})).not.toThrow();
	});
});

describe('ensureReturn', () =>
{
	it('leaves code with an explicit return untouched', () =>
	{
		const code = 'const x = 1;\nreturn (<div>{x}</div>);';
		expect(ensureReturn(code)).toBe(code);
	});

	it('wraps a bare JSX expression in a return statement', () =>
	{
		expect(ensureReturn('<div>Hello</div>')).toBe('return (\n<div>Hello</div>\n);');
	});

	it('leaves empty input untouched', () =>
	{
		expect(ensureReturn('')).toBe('');
	});
});
