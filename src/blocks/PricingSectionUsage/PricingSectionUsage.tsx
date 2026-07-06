'use client';

import { Card, CardContent, CardFooter, CardHeader } from '../../components/Card/Card';
import Slider from '../../components/Slider/Slider';
import Button from '../../components/Button/Button';
import Badge from '../../components/Badge/Badge';
import { useState } from 'react';

const BASE_FEE       = 19;
const INCLUDED_CALLS = 10;
const RATE_PER_1K    = 0.4;

export const PricingSectionUsage = () => {
	const [calls, setCalls] = useState(50);

	const billableCalls = Math.max(0, calls - INCLUDED_CALLS);
	const estimate = BASE_FEE + billableCalls * RATE_PER_1K;

	return (
		<Card variant='elevated' className='w-full max-w-md'>
			<CardHeader className='flex flex-col gap-1'>
				<h3 className='text-xl font-semibold text-text'>Usage-based pricing</h3>
				<p className='text-sm text-text-muted'>Pay only for the API calls you make — no seats, no tiers.</p>
			</CardHeader>
			<CardContent className='flex flex-col gap-6'>
				<div className='flex items-end justify-between'>
					<div className='flex items-baseline gap-1'>
						<span className='text-3xl font-semibold text-text'>${estimate.toFixed(2)}</span>
						<span className='text-sm text-text-muted'>/mo</span>
					</div>
					<Badge variant='default'>Estimate</Badge>
				</div>

				<Slider
					label='Monthly API calls'
					value={calls}
					onValueChange={setCalls}
					min={10}
					max={500}
					step={10}
					hint={`${(calls * 1000).toLocaleString()} calls per month — first ${(INCLUDED_CALLS * 1000).toLocaleString()} are always free`}
				/>

				<p className='text-xs text-text-muted'>
					${BASE_FEE} base fee + ${RATE_PER_1K.toFixed(2)} per 1,000 calls beyond the free tier.
				</p>
			</CardContent>
			<CardFooter className='flex items-center justify-between'>
				<span className='text-sm text-text-muted'>Billed monthly</span>
				<Button>Start free trial</Button>
			</CardFooter>
		</Card>
	);
};

export default PricingSectionUsage;
