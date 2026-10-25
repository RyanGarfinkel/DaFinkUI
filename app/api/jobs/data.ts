import type { JobApplication } from '@/src/blocks/JobApplicationTracker/ApplicationCard';

// Docs-site-only sample store backing the /blocks/job-application-tracker live preview. Never
// listed in the block's registry `files`. In a real app this is your database. The store lives
// on globalThis so every route handler shares one copy (dev mode can bundle each route with its
// own module instance); it resets whenever the server restarts.

const SEED: JobApplication[] = [
	{
		id: 'job-1',
		role: 'Frontend Engineer',
		company: 'Notion',
		status: 'wishlist',
		workType: 'Remote',
		location: 'Remote (US)',
		notes: 'Referred by a former teammate — reaching out before applying.',
	},
	{
		id: 'job-2',
		role: 'Product Designer',
		company: 'Linear',
		status: 'wishlist',
		workType: 'Remote',
		location: 'Remote (US)',
		notes: 'Strong portfolio fit, role posted this week.',
	},
	{
		id: 'job-3',
		role: 'Senior Frontend Engineer',
		company: 'Stripe',
		status: 'applied',
		workType: 'Hybrid',
		location: 'San Francisco, CA',
		salary: '$170k–$210k',
		appliedDate: '2026-08-15T00:00:00.000Z',
		url: 'https://stripe.com/jobs',
		contact: 'Jamie Lin (referral)',
		notes: 'Applied through a referral.',
		resume: { name: 'Resume_SFE_Stripe.pdf', size: '214 KB', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
	},
	{
		id: 'job-4',
		role: 'Full Stack Engineer',
		company: 'Vercel',
		status: 'applied',
		workType: 'Remote',
		location: 'Remote (US)',
		appliedDate: '2026-08-20T00:00:00.000Z',
		notes: 'Applied via the careers page.',
	},
	{
		id: 'job-5',
		role: 'Frontend Engineer',
		company: 'Figma',
		status: 'interviewing',
		workType: 'Onsite',
		location: 'San Francisco, CA',
		salary: '$160k–$195k',
		appliedDate: '2026-08-05T00:00:00.000Z',
		contact: 'Priya Shah (recruiter)',
		notes: 'Onsite loop scheduled after two strong screens.',
		resume: { name: 'Resume_FE_Figma.pdf', size: '198 KB', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
	},
	{
		id: 'job-6',
		role: 'Product Engineer',
		company: 'Ramp',
		status: 'offer',
		workType: 'Hybrid',
		location: 'New York, NY',
		salary: '$185k + equity',
		appliedDate: '2026-07-28T00:00:00.000Z',
		notes: 'Offer received, negotiating start date and equity.',
	},
	{
		id: 'job-7',
		role: 'Frontend Engineer',
		company: 'Airbnb',
		status: 'rejected',
		workType: 'Onsite',
		location: 'San Francisco, CA',
		appliedDate: '2026-07-10T00:00:00.000Z',
		notes: 'Passed after the final round — asked for feedback.',
	},
];

const globalStore = globalThis as { __jobsStore?: JobApplication[] };

export const getStore = (): JobApplication[] => globalStore.__jobsStore ??= structuredClone(SEED);

export const LATENCY_MS = 400;

export const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
