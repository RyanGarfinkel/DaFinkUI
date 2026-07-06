'use client';

import Modal, { ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose } from '../../components/Modal/Modal';
import { Card, CardContent, CardHeader } from '../../components/Card/Card';
import { Select, type SelectOption } from '../../components/Select/Select';
import Badge, { type BadgeVariant } from '../../components/Badge/Badge';
import Avatar from '../../components/Avatar/Avatar';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { useState } from 'react';

type TeamRole = 'Admin' | 'Member' | 'Viewer';

interface TeamMember
{
	id:    number;
	name:  string;
	email: string;
	role:  TeamRole;
}

const ROLE_OPTIONS: SelectOption[] = [
	{ value: 'Admin',  label: 'Admin'  },
	{ value: 'Member', label: 'Member' },
	{ value: 'Viewer', label: 'Viewer' },
];

const ROLE_BADGE_VARIANT: Record<TeamRole, BadgeVariant> = {
	Admin:  'default',
	Member: 'success',
	Viewer: 'outline',
};

const INITIAL_MEMBERS: TeamMember[] = [
	{ id: 1, name: 'Ava Thompson',  email: 'ava.thompson@company.com',  role: 'Admin'  },
	{ id: 2, name: 'Noah Martinez', email: 'noah.martinez@company.com', role: 'Member' },
	{ id: 3, name: 'Priya Sharma',  email: 'priya.sharma@company.com',  role: 'Member' },
	{ id: 4, name: 'Liam Chen',     email: 'liam.chen@company.com',     role: 'Viewer' },
	{ id: 5, name: 'Sofia Rossi',   email: 'sofia.rossi@company.com',   role: 'Viewer' },
];

export const TeamManagement = () => {
	const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
	const [inviteOpen, setInviteOpen] = useState(false);
	const [inviteEmail, setInviteEmail] = useState('');
	const [inviteRole, setInviteRole] = useState<TeamRole>('Member');
	const [memberPendingRemoval, setMemberPendingRemoval] = useState<TeamMember | null>(null);

	const handleInviteOpenChange = (open: boolean) => {
		setInviteOpen(open);
		if(!open)
		{
			setInviteEmail('');
			setInviteRole('Member');
		}
	};

	const handleSendInvite = () => {
		if(!inviteEmail.trim()) return;

		setMembers((prev) => [
			...prev,
			{ id: Date.now(), name: inviteEmail.split('@')[0], email: inviteEmail, role: inviteRole },
		]);
		handleInviteOpenChange(false);
	};

	const handleRemoveOpenChange = (open: boolean) => {
		if(!open) setMemberPendingRemoval(null);
	};

	const handleConfirmRemove = () => {
		if(!memberPendingRemoval) return;

		setMembers((prev) => prev.filter((m) => m.id !== memberPendingRemoval.id));
		setMemberPendingRemoval(null);
	};

	return (
		<Card className='w-full max-w-lg'>
			<CardHeader className='flex items-center justify-between gap-4'>
				<div className='flex flex-col'>
					<h3 className='text-xl font-semibold text-text'>Team members</h3>
					<p className='text-sm text-text-muted'>Manage who has access to this workspace.</p>
				</div>
				<Button size='sm' onClick={() => setInviteOpen(true)}>Invite member</Button>
			</CardHeader>

			<CardContent>
				<div className='flex flex-col divide-y divide-surface-border'>
					{members.map((member) => (
						<div key={member.id} className='flex items-center gap-3 py-3 first:pt-0 last:pb-0'>
							<Avatar name={member.name} size='sm' />
							<div className='flex-1 min-w-0'>
								<p className='text-sm font-medium text-text truncate'>{member.name}</p>
								<p className='text-xs text-text-muted truncate'>{member.email}</p>
							</div>
							<Badge variant={ROLE_BADGE_VARIANT[member.role]}>{member.role}</Badge>
							<Button
								variant='ghost'
								size='icon'
								aria-label={`Remove ${member.name}`}
								onClick={() => setMemberPendingRemoval(member)}
								className='text-text-muted hover:text-danger'
							>
								<svg
									width='14'
									height='14'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
									aria-hidden='true'
								>
									<path d='M3 6h18' />
									<path d='M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6' />
									<line x1='10' y1='11' x2='10' y2='17' />
									<line x1='14' y1='11' x2='14' y2='17' />
								</svg>
							</Button>
						</div>
					))}
				</div>
			</CardContent>

			<Modal open={inviteOpen} onOpenChange={handleInviteOpenChange}>
				<ModalClose />
				<ModalHeader>
					<ModalTitle>Invite member</ModalTitle>
				</ModalHeader>
				<ModalContent className='flex flex-col gap-4'>
					<Input
						type='email'
						label='Email'
						placeholder='name@company.com'
						value={inviteEmail}
						onChange={(e) => setInviteEmail(e.target.value)}
					/>
					<Select
						label='Role'
						options={ROLE_OPTIONS}
						value={inviteRole}
						onChange={(value) => setInviteRole(value as TeamRole)}
					/>
				</ModalContent>
				<ModalFooter>
					<Button variant='secondary' onClick={() => handleInviteOpenChange(false)}>Cancel</Button>
					<Button onClick={handleSendInvite}>Send invite</Button>
				</ModalFooter>
			</Modal>

			<Modal open={memberPendingRemoval !== null} onOpenChange={handleRemoveOpenChange}>
				<ModalClose />
				<ModalHeader>
					<ModalTitle>Remove member</ModalTitle>
				</ModalHeader>
				<ModalContent>
					{`Remove ${memberPendingRemoval?.name} from the team? This can't be undone.`}
				</ModalContent>
				<ModalFooter>
					<Button variant='secondary' onClick={() => setMemberPendingRemoval(null)}>Cancel</Button>
					<Button variant='destructive' onClick={handleConfirmRemove}>Remove</Button>
				</ModalFooter>
			</Modal>
		</Card>
	);
};

export default TeamManagement;
