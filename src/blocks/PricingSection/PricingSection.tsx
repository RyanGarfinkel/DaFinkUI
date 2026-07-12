'use client';

import Accordion, { AccordionContent, AccordionItem, AccordionTrigger } from '../../components/Accordion/Accordion';
import { ToggleGroup, ToggleGroupItem } from '../../components/ToggleGroup/ToggleGroup';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Badge from '../../components/Badge/Badge';
import { useState } from 'react';

type BillingPeriod = 'monthly' | 'yearly';

interface Tier
{
	name:        string;
	description: string;
	monthly:     number;
	yearly:      number;
	features:    string[];
	recommended: boolean;
}

const TIERS: Tier[] = [
	{
		name:        'Starter',
		description: 'For individuals getting started.',
		monthly:     9,
		yearly:      86,
		features:    ['1 project', 'Community support', 'Basic analytics', '1 GB storage'],
		recommended: false,
	},
	{
		name:        'Pro',
		description: 'For growing teams that need more power.',
		monthly:     29,
		yearly:      278,
		features:    ['Unlimited projects', 'Priority support', 'Advanced analytics', '50 GB storage', 'Team collaboration'],
		recommended: true,
	},
	{
		name:        'Enterprise',
		description: 'For large organizations with custom needs.',
		monthly:     99,
		yearly:      950,
		features:    ['Unlimited everything', 'Dedicated support', 'Custom integrations', 'SSO & audit logs', '99.9% uptime SLA'],
		recommended: false,
	},
];

const FAQS = [
	{
		value: 'switch-plans',
		question: 'Can I switch plans later?',
		answer: 'Yes, upgrade or downgrade at any time. Changes are prorated so you only pay for what you use.',
	},
	{
		value: 'billing-cycle',
		question: "What's the difference between monthly and yearly billing?",
		answer: 'Yearly billing is paid upfront for the year and works out to about 20% cheaper than paying monthly.',
	},
	{
		value: 'cancel',
		question: 'Can I cancel anytime?',
		answer: "Yes, there's no lock-in contract. Cancel from your billing settings and you won't be charged again.",
	},
	{
		value: 'payment-methods',
		question: 'What payment methods do you accept?',
		answer: 'We accept all major credit and debit cards, plus PayPal for monthly and yearly plans.',
	},
	{
		value: 'enterprise',
		question: 'Do you offer custom Enterprise pricing?',
		answer: 'Yes, contact our sales team for volume discounts, custom contracts, and dedicated onboarding.',
	},
];

const CheckIcon = () => (
	<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='text-brand shrink-0' aria-hidden='true'>
		<polyline points='20 6 9 17 4 12' />
	</svg>
);

export const PricingSection = () => {
	const [period, setPeriod] = useState<BillingPeriod>('monthly');

	return (
		<div className='flex flex-col gap-16 w-full'>
			<div className='flex flex-col gap-8 w-full'>
				<div className='flex flex-col items-center gap-4 text-center'>
					<h2 className='text-2xl font-semibold text-text'>Simple, transparent pricing</h2>
					<p className='text-sm text-text-muted max-w-md'>Choose the plan that fits your team. Switch to yearly billing and save 20%.</p>
					<ToggleGroup type='single' value={period} onValueChange={(v) => setPeriod(v as BillingPeriod)} size='md' aria-label='Billing period'>
						<ToggleGroupItem value='monthly'>Monthly</ToggleGroupItem>
						<ToggleGroupItem value='yearly'>Yearly</ToggleGroupItem>
					</ToggleGroup>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
					{TIERS.map((tier) => {
						const price = period === 'monthly' ? tier.monthly : tier.yearly;

						return (
							<Card key={tier.name} variant={tier.recommended ? 'elevated' : 'default'} className={tier.recommended ? 'border-2 border-brand' : ''}>
								<CardHeader>
									<div className='flex items-center justify-between gap-2'>
										<h3 className='text-lg font-semibold text-text'>{tier.name}</h3>
										{tier.recommended && <Badge variant='default'>Most popular</Badge>}
									</div>
									<p className='text-sm text-text-muted mt-1'>{tier.description}</p>
									<div className='flex items-baseline gap-1 mt-4'>
										<span className='text-3xl font-semibold text-text'>${price}</span>
										<span className='text-sm text-text-muted'>{period === 'monthly' ? '/mo' : '/yr'}</span>
									</div>
								</CardHeader>
								<CardContent>
									<ul className='flex flex-col gap-2.5'>
										{tier.features.map((feature) => (
											<li key={feature} className='flex items-center gap-2 text-sm text-text'>
												<CheckIcon />
												{feature}
											</li>
										))}
									</ul>
								</CardContent>
								<CardFooter>
									<Button variant={tier.recommended ? 'primary' : 'outlined'} className='w-full' onClick={() => {}}>
										{tier.recommended ? 'Start free trial' : 'Get started'}
									</Button>
								</CardFooter>
							</Card>
						);
					})}
				</div>
			</div>

			<div className='w-full max-w-2xl mx-auto'>
				<Card>
					<CardHeader>
						<h2 className='text-xl font-semibold text-text'>Pricing questions</h2>
						<p className='text-sm text-text-muted'>Common questions about plans and billing.</p>
					</CardHeader>
					<CardContent>
						<Accordion type='single' collapsible>
							{FAQS.map((faq) => (
								<AccordionItem key={faq.value} value={faq.value}>
									<AccordionTrigger>{faq.question}</AccordionTrigger>
									<AccordionContent>{faq.answer}</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default PricingSection;
