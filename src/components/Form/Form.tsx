'use client';

import { useForm, type FieldValues, type UseFormProps, type UseFormReturn } from 'react-hook-form';
import { FormHTMLAttributes, HTMLAttributes, LabelHTMLAttributes, ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

export interface FormProps extends FormHTMLAttributes<HTMLFormElement>
{
	className?: string;
}

export interface FormSectionProps
{
	title?:       string;
	description?: string;
	className?:   string;
	children:     ReactNode;
}

export interface FormFieldProps
{
	className?: string;
	children:   ReactNode;
}

export interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement>
{
	required?:  boolean;
	htmlFor?:   string;
	className?: string;
}

export interface FormControlProps
{
	className?: string;
	children:   ReactNode;
}

export interface FormDescriptionProps
{
	className?: string;
	children:   ReactNode;
}

export interface FormMessageProps extends HTMLAttributes<HTMLParagraphElement>
{
	className?: string;
	children?:  ReactNode;
}

export const FormSection = ({ title, description, className = '', children }: FormSectionProps) => {
	return (
		<fieldset className={`space-y-4 border-0 p-0 m-0 min-w-0 ${className}`}>
			{(title || description) && (
				<div className='flex flex-col gap-1'>
					{title && (
						<legend className='text-base font-semibold text-text float-none w-full'>
							{title}
						</legend>
					)}
					{description && (
						<p className='text-sm text-text-muted'>{description}</p>
					)}
				</div>
			)}
			{children}
		</fieldset>
	);
};

export const FormField = ({ className = '', children }: FormFieldProps) => {
	return (
		<div className={`flex flex-col gap-1.5 ${className}`}>
			{children}
		</div>
	);
};

export const FormLabel = ({ required, className = '', children, ...props }: FormLabelProps) => {
	return (
		<label className={`text-sm font-medium text-text ${className}`} {...props}>
			{children}
			{required && (
				<span className='text-input-error ml-0.5' aria-hidden='true'> *</span>
			)}
		</label>
	);
};

export const FormControl = ({ className = '', children }: FormControlProps) => {
	return (
		<div className={className}>
			{children}
		</div>
	);
};

export const FormDescription = ({ className = '', children }: FormDescriptionProps) => {
	return (
		<p className={`text-sm text-text-muted ${className}`}>
			{children}
		</p>
	);
};

export const FormMessage = ({ className = '', children, ...props }: FormMessageProps) => {
	if(!children) return null;

	return (
		<p className={`text-sm text-input-error ${className}`} role='alert' {...props}>
			{children}
		</p>
	);
};

const Form = ({ className = '', children, ...props }: FormProps) => {
	return (
		<form className={`space-y-6 ${className}`} {...props}>
			{children}
		</form>
	);
};

export const useZodForm = <TSchema extends z.ZodType<FieldValues>>(
	schema: TSchema,
	options?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>
): UseFormReturn<z.infer<TSchema>> => {
	// react-hook-form's Resolver<Input, Context, Output> keys off the schema's *input*
	// type, while zod's own generics run output-first; the two libraries' generics
	// don't reconcile cleanly through inference alone. The public signature above is
	// fully typed for consumers; this cast is the well-established pattern for wrapping
	// react-hook-form + a zod resolver in a single generic hook.
	return useForm({
		...options,
		resolver: zodResolver(schema as never),
	}) as UseFormReturn<z.infer<TSchema>>;
};

export default Form;
