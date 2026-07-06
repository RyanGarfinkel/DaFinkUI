'use client';

import { Card, CardContent, CardFooter, CardHeader } from '../../components/Card/Card';
import { FormSection, FormField, FormLabel } from '../../components/Form/Form';
import { RadioGroup, RadioItem } from '../../components/Radio/Radio';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { useState } from 'react';

const CheckIcon = () => (
	<svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' className='text-success' aria-hidden='true'>
		<polyline points='20 6 9 17 4 12' />
	</svg>
);

export const CheckoutForm = () => {
	const [email,         setEmail]         = useState('');
	const [fullName,      setFullName]      = useState('');
	const [paymentMethod, setPaymentMethod] = useState('card');
	const [cardNumber,    setCardNumber]    = useState('');
	const [expiry,        setExpiry]        = useState('');
	const [cvc,           setCvc]           = useState('');
	const [loading,       setLoading]       = useState(false);
	const [success,       setSuccess]       = useState(false);

	const canPay = !!email && !!fullName && (paymentMethod !== 'card' || (!!cardNumber && !!expiry && !!cvc));

	const handlePay = () => {
		setLoading(true);
		setTimeout(() => {
			setLoading(false);
			setSuccess(true);
		}, 900);
	};

	return (
		<Card className='w-full max-w-lg'>
			<CardHeader>
				<h3 className='text-xl font-semibold text-text'>Checkout</h3>
				<p className='text-sm text-text-muted'>Complete your purchase.</p>
			</CardHeader>
			{success ? (
				<CardContent className='flex flex-col items-center gap-4 py-6'>
					<div className='w-14 h-14 rounded-full bg-success/15 flex items-center justify-center'>
						<CheckIcon />
					</div>
					<p className='text-sm text-text-muted text-center'>Payment complete. A receipt has been sent to {email || 'your email'}.</p>
				</CardContent>
			) : (
				<>
					<CardContent className='flex flex-col gap-6'>
						<FormSection title='Contact'>
							<FormField>
								<FormLabel required>Email</FormLabel>
								<Input type='email' autoComplete='email' placeholder='you@example.com' value={email} onChange={(e) => setEmail(e.target.value)} />
							</FormField>
							<FormField>
								<FormLabel required>Full name</FormLabel>
								<Input autoComplete='name' placeholder='Jordan Park' value={fullName} onChange={(e) => setFullName(e.target.value)} />
							</FormField>
						</FormSection>

						<FormSection title='Payment method'>
							<RadioGroup name='payment-method' value={paymentMethod} onValueChange={setPaymentMethod}>
								<RadioItem value='card' label='Credit or debit card' />
								<RadioItem value='paypal' label='PayPal' />
							</RadioGroup>

							{paymentMethod === 'card' ? (
								<div className='flex flex-col gap-4'>
									<FormField>
										<FormLabel required>Card number</FormLabel>
										<Input inputMode='numeric' autoComplete='cc-number' placeholder='4242 4242 4242 4242' value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
									</FormField>
									<div className='flex gap-4'>
										<FormField className='flex-1'>
											<FormLabel required>Expiry (MM/YY)</FormLabel>
											<Input autoComplete='cc-exp' placeholder='MM/YY' value={expiry} onChange={(e) => setExpiry(e.target.value)} />
										</FormField>
										<FormField className='flex-1'>
											<FormLabel required>CVC</FormLabel>
											<Input inputMode='numeric' autoComplete='cc-csc' placeholder='123' value={cvc} onChange={(e) => setCvc(e.target.value)} />
										</FormField>
									</div>
								</div>
							) : (
								<p className='text-sm text-text-muted'>You&apos;ll be redirected to PayPal to complete your payment.</p>
							)}
						</FormSection>
					</CardContent>
					<CardFooter className='flex items-center justify-between'>
						<span className='text-sm text-text-muted'>Total: $49.00</span>
						<Button onClick={handlePay} loading={loading} disabled={!canPay}>
							Pay $49.00
						</Button>
					</CardFooter>
				</>
			)}
		</Card>
	);
};

export default CheckoutForm;
