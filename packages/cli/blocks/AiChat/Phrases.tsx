'use client';

import { useEffect, useState } from 'react';

export const USER_NAME = 'Ryan';
const PHRASE_INTERVAL_MS = 2200;

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TYPING_PHRASES = [
	'Responding',
	'Thinking',
	'Pondering',
	'Brewing',
	'Conjuring',
	'Noodling',
	'Simmering',
	'Percolating',
	'Untangling',
	'Weaving',
	'Musing',
	'Cooking',
];

const pickRandom = <T,>(items: T[], exclude?: T): T => {
	const pool = items.length > 1 ? items.filter((item) => item !== exclude) : items;
	return pool[Math.floor(Math.random() * pool.length)];
};

const buildGreetings = (now: Date) => {
	const weekday = WEEKDAYS[now.getDay()];
	const hour = now.getHours();
	const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

	return [
		`Happy ${weekday}`,
		`Happy ${weekday}, ${USER_NAME}`,
		`Good ${timeOfDay}, ${USER_NAME}`,
		`Welcome back, ${USER_NAME}`,
		`Hey ${USER_NAME}, what's on your mind?`,
		`How can I help, ${USER_NAME}?`,
		'Ready when you are',
		'What are we working on?',
	];
};

// Only ever mounted after a user action (new chat, /clear), never during server render, so
// picking randomly in the initializer can't cause a hydration mismatch.
export const Greeting = () => {
	const [greeting] = useState(() => pickRandom(buildGreetings(new Date())));

	return <p className='font-serif text-2xl italic text-text'>{greeting}</p>;
};

export const TypingPhrase = () => {
	const [phrase, setPhrase] = useState(() => pickRandom(TYPING_PHRASES));

	useEffect(() => {
		const timer = setInterval(() => setPhrase((prev) => pickRandom(TYPING_PHRASES, prev)), PHRASE_INTERVAL_MS);
		return () => clearInterval(timer);
	}, []);

	return <p role='status' className='text-xs text-text-muted'>{phrase}…</p>;
};
