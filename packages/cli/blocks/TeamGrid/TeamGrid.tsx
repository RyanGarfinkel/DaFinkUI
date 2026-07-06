'use client';

import Badge, { type BadgeVariant } from '../../components/Badge/Badge';
import { Card, CardContent } from '../../components/Card/Card';
import Avatar from '../../components/Avatar/Avatar';

interface TeamMember
{
	name:       string;
	role:       string;
	department: string;
	variant:    BadgeVariant;
}

const TEAM_MEMBERS: TeamMember[] = [
	{ name: 'Ava Thompson',  role: 'Design Lead',        department: 'Design',      variant: 'default' },
	{ name: 'Noah Martinez', role: 'Senior Engineer',    department: 'Engineering', variant: 'success' },
	{ name: 'Priya Sharma',  role: 'Product Manager',    department: 'Product',     variant: 'warning' },
	{ name: 'Liam Chen',     role: 'Frontend Engineer',  department: 'Engineering', variant: 'success' },
	{ name: 'Sofia Rossi',   role: 'UX Designer',        department: 'Design',      variant: 'default' },
	{ name: 'Ethan Brooks',  role: 'Growth Marketing',   department: 'Marketing',   variant: 'outline' },
];

export const TeamGrid = () => {
	return (
		<div className='flex flex-col gap-5 w-full'>
			<div className='flex flex-col gap-1'>
				<h2 className='text-2xl font-semibold text-text'>Meet the team</h2>
				<p className='text-sm text-text-muted'>The people designing and building the product every day.</p>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
				{TEAM_MEMBERS.map((member) => (
					<Card key={member.name}>
						<CardContent className='flex flex-col items-center gap-2 text-center'>
							<Avatar name={member.name} size='lg' />
							<p className='text-sm font-medium text-text'>{member.name}</p>
							<p className='text-xs text-text-muted'>{member.role}</p>
							<Badge variant={member.variant}>{member.department}</Badge>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
};

export default TeamGrid;
