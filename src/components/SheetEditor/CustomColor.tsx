'use client';

import { ColorPicker } from '../ColorPicker/ColorPicker';
import Button from '../Button/Button';
import { useState } from 'react';

export interface CustomColorProps {
	value?:  string;
	onApply: (color: string) => void;
}

/** Any color: the picker previews locally and only Apply writes to the sheet, so a drag is one undo step. */
export const CustomColor = ({ value, onApply }: CustomColorProps) => {
	const [color, setColor] = useState(value?.startsWith('#') ? value : '#4f46e5');

	return (
		<div className='flex w-56 flex-col gap-2'>
			<ColorPicker label='Custom color' value={color} onValueChange={setColor} showInput />
			<Button size='sm' onClick={() => onApply(color)}>Apply</Button>
		</div>
	);
};
