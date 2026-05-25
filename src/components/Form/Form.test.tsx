import Form, {
	FormSection,
	FormField,
	FormLabel,
	FormControl,
	FormDescription,
	FormMessage,
} from './Form';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Form', () =>
{
	it('renders a form element', () =>
	{
		render(<Form aria-label='test'><input /></Form>);
		expect(screen.getByRole('form')).toBeDefined();
	});

	it('applies space-y-6 class by default', () =>
	{
		render(<Form aria-label='test form'><input /></Form>);
		expect(screen.getByRole('form').className).toContain('space-y-6');
	});

	it('forwards native form props', () =>
	{
		render(
			<Form aria-label='signup' method='post' action='/submit'>
				<input />
			</Form>
		);
		const form = screen.getByRole('form');
		expect(form.getAttribute('method')).toBe('post');
		expect(form.getAttribute('action')).toBe('/submit');
	});

	it('merges custom className', () =>
	{
		render(<Form aria-label='test form' className='custom-class'><input /></Form>);
		expect(screen.getByRole('form').className).toContain('custom-class');
	});
});

describe('FormLabel', () =>
{
	it('renders a label element', () =>
	{
		render(<FormLabel htmlFor='test'>Email</FormLabel>);
		expect(screen.getByText('Email').tagName).toBe('LABEL');
	});

	it('renders required indicator when required is true', () =>
	{
		render(<FormLabel required htmlFor='test'>Email</FormLabel>);
		const indicator = screen.getByText('*', { exact: false });
		expect(indicator).toBeDefined();
	});

	it('does not render required indicator when required is false', () =>
	{
		render(<FormLabel htmlFor='test'>Email</FormLabel>);
		const label = screen.getByText('Email');
		expect(label.parentElement?.textContent).not.toContain('*');
	});

	it('required indicator is aria-hidden', () =>
	{
		const { container } = render(<FormLabel required htmlFor='test'>Password</FormLabel>);
		const indicator = container.querySelector('[aria-hidden="true"]');
		expect(indicator).not.toBeNull();
		expect(indicator?.getAttribute('aria-hidden')).toBe('true');
	});

	it('applies correct token classes', () =>
	{
		render(<FormLabel htmlFor='test'>Label</FormLabel>);
		const label = screen.getByText('Label');
		expect(label.className).toContain('text-text');
		expect(label.className).toContain('font-medium');
	});

	it('forwards htmlFor prop', () =>
	{
		render(<FormLabel htmlFor='my-input'>Label</FormLabel>);
		expect(screen.getByText('Label').getAttribute('for')).toBe('my-input');
	});

	it('merges custom className', () =>
	{
		render(<FormLabel className='custom-label'>Label</FormLabel>);
		expect(screen.getByText('Label').className).toContain('custom-label');
	});
});

describe('FormMessage', () =>
{
	it('renders nothing when children is not provided', () =>
	{
		const { container } = render(<FormMessage />);
		expect(container.firstChild).toBeNull();
	});

	it('renders nothing when children is empty string', () =>
	{
		const { container } = render(<FormMessage>{''}</FormMessage>);
		expect(container.firstChild).toBeNull();
	});

	it('renders message when children is provided', () =>
	{
		render(<FormMessage>This field is required.</FormMessage>);
		expect(screen.getByText('This field is required.')).toBeDefined();
	});

	it('applies error token class', () =>
	{
		render(<FormMessage>Error</FormMessage>);
		expect(screen.getByText('Error').className).toContain('text-input-error');
	});

	it('has role="alert"', () =>
	{
		render(<FormMessage>Error message</FormMessage>);
		expect(screen.getByRole('alert')).toBeDefined();
	});

	it('merges custom className', () =>
	{
		render(<FormMessage className='extra'>Error</FormMessage>);
		expect(screen.getByText('Error').className).toContain('extra');
	});
});

describe('FormSection', () =>
{
	it('renders a fieldset element', () =>
	{
		render(<FormSection><input /></FormSection>);
		expect(screen.getByRole('group').tagName).toBe('FIELDSET');
	});

	it('renders title as a legend', () =>
	{
		render(<FormSection title='Account settings'><input /></FormSection>);
		expect(screen.getByText('Account settings').tagName).toBe('LEGEND');
	});

	it('renders description text', () =>
	{
		render(<FormSection description='Manage your account.'><input /></FormSection>);
		expect(screen.getByText('Manage your account.')).toBeDefined();
	});

	it('renders title and description together', () =>
	{
		render(
			<FormSection title='Profile' description='Update your details.'>
				<input />
			</FormSection>
		);
		expect(screen.getByText('Profile')).toBeDefined();
		expect(screen.getByText('Update your details.')).toBeDefined();
	});

	it('renders no header elements when neither title nor description provided', () =>
	{
		render(<FormSection><input /></FormSection>);
		expect(screen.queryByRole('legend')).toBeNull();
	});

	it('applies description token class', () =>
	{
		render(<FormSection description='Hint text'><input /></FormSection>);
		expect(screen.getByText('Hint text').className).toContain('text-text-muted');
	});

	it('merges custom className', () =>
	{
		render(<FormSection className='custom-section'><input /></FormSection>);
		expect(screen.getByRole('group').className).toContain('custom-section');
	});
});

describe('FormField', () =>
{
	it('renders children', () =>
	{
		render(<FormField><label>Name</label></FormField>);
		expect(screen.getByText('Name')).toBeDefined();
	});

	it('applies flex flex-col and gap classes', () =>
	{
		const { container } = render(<FormField><span>x</span></FormField>);
		const div = container.firstChild as HTMLElement;
		expect(div.className).toContain('flex');
		expect(div.className).toContain('flex-col');
		expect(div.className).toContain('gap-1.5');
	});

	it('merges custom className', () =>
	{
		const { container } = render(<FormField className='my-field'><span>x</span></FormField>);
		expect((container.firstChild as HTMLElement).className).toContain('my-field');
	});
});

describe('FormDescription', () =>
{
	it('renders description text', () =>
	{
		render(<FormDescription>Hint text here.</FormDescription>);
		expect(screen.getByText('Hint text here.')).toBeDefined();
	});

	it('applies muted text token class', () =>
	{
		render(<FormDescription>Hint</FormDescription>);
		expect(screen.getByText('Hint').className).toContain('text-text-muted');
	});

	it('merges custom className', () =>
	{
		render(<FormDescription className='extra-desc'>Hint</FormDescription>);
		expect(screen.getByText('Hint').className).toContain('extra-desc');
	});
});

describe('FormControl', () =>
{
	it('renders children', () =>
	{
		render(<FormControl><input placeholder='test' /></FormControl>);
		expect(screen.getByPlaceholderText('test')).toBeDefined();
	});

	it('merges custom className', () =>
	{
		const { container } = render(
			<FormControl className='custom-control'><input /></FormControl>
		);
		expect((container.firstChild as HTMLElement).className).toContain('custom-control');
	});
});
