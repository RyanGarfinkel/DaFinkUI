'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/Tabs/Tabs';
import { Card, CardContent, CardHeader } from '../../components/Card/Card';
import ScrollFade from '../../components/ScrollFade/ScrollFade';
import Button from '../../components/Button/Button';
import Badge from '../../components/Badge/Badge';
import { useState, type ReactNode } from 'react';

type NotificationType = 'mention' | 'task' | 'system';

interface Notification
{
	id:      number;
	type:    NotificationType;
	message: string;
	time:    string;
	read:    boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
	{ id: 1, type: 'mention', message: 'Alex Kim mentioned you in "Q3 roadmap"',   time: '2m ago',  read: false },
	{ id: 2, type: 'task',    message: 'Design review assigned to you',            time: '18m ago', read: false },
	{ id: 3, type: 'system',  message: 'Your weekly usage report is ready',        time: '1h ago',  read: false },
	{ id: 4, type: 'mention', message: 'Sam Chen replied to your comment',         time: '3h ago',  read: true  },
	{ id: 5, type: 'task',    message: 'Deploy checklist marked complete',         time: '5h ago',  read: true  },
	{ id: 6, type: 'system',  message: 'New login from a Chrome browser',          time: '1d ago',  read: true  },
];

const MentionIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' />
	</svg>
);

const TaskIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<rect x='3' y='4' width='18' height='18' rx='2' />
		<path d='m9 12 2 2 4-4' />
	</svg>
);

const SystemIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9' />
		<path d='M13.73 21a2 2 0 0 1-3.46 0' />
	</svg>
);

const CheckIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<polyline points='20 6 9 17 4 12' />
	</svg>
);

const CloseIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M18 6 6 18' />
		<path d='m6 6 12 12' />
	</svg>
);

const CaughtUpIcon = () => (
	<svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='text-success' aria-hidden='true'>
		<circle cx='12' cy='12' r='10' />
		<path d='m8 12 3 3 5-6' />
	</svg>
);

const TYPE_ICON: Record<NotificationType, ReactNode> = {
	mention: <MentionIcon />,
	task:    <TaskIcon />,
	system:  <SystemIcon />,
};

const TYPE_STYLE: Record<NotificationType, string> = {
	mention: 'bg-brand/15 text-brand',
	task:    'bg-success-bg text-success',
	system:  'bg-warning-bg text-warning',
};

export const NotificationsPanelActionable = () => {
	const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
	const [filter, setFilter] = useState('all');

	const unreadCount = notifications.filter((n) => !n.read).length;

	const markAsRead = (id: number) => {
		setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
	};

	const dismiss = (id: number) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	};

	const renderList = (items: Notification[]) => {
		if (items.length === 0) {
			return (
				<div className='flex flex-col items-center gap-2 py-10 text-center'>
					<CaughtUpIcon />
					<p className='text-sm text-text-muted'>You&apos;re all caught up.</p>
				</div>
			);
		}

		return (
			<ScrollFade direction='vertical' className='max-h-72'>
				<div className='flex flex-col divide-y divide-surface-border'>
					{items.map((n) => (
						<div key={n.id} className='flex items-start gap-3 py-3 first:pt-0 last:pb-0'>
							<span className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${TYPE_STYLE[n.type]}`}>
								{TYPE_ICON[n.type]}
							</span>
							<div className='flex-1 min-w-0'>
								<p className={n.read ? 'text-sm text-text-muted' : 'text-sm font-medium text-text'}>{n.message}</p>
								<p className='text-xs text-text-muted mt-0.5'>{n.time}</p>
							</div>
							<div className='flex items-center gap-1 shrink-0'>
								{!n.read && (
									<Button variant='ghost' size='icon' className='h-7 w-7' aria-label={`Mark as read: ${n.message}`} onClick={() => markAsRead(n.id)}>
										<CheckIcon />
									</Button>
								)}
								<Button variant='ghost' size='icon' className='h-7 w-7 text-text-muted hover:text-danger' aria-label={`Dismiss: ${n.message}`} onClick={() => dismiss(n.id)}>
									<CloseIcon />
								</Button>
							</div>
						</div>
					))}
				</div>
			</ScrollFade>
		);
	};

	return (
		<Tabs value={filter} onValueChange={setFilter}>
			<Card className='w-full max-w-md'>
				<CardHeader className='flex flex-col gap-3'>
					<div className='flex items-center justify-between'>
						<h3 className='text-base font-semibold text-text'>Notifications</h3>
						{unreadCount > 0 && <Badge variant='default'>{unreadCount} new</Badge>}
					</div>
					<TabsList>
						<TabsTrigger value='all'>All</TabsTrigger>
						<TabsTrigger value='unread'>Unread</TabsTrigger>
					</TabsList>
				</CardHeader>
				<CardContent>
					<TabsContent value='all' className='pt-0'>{renderList(notifications)}</TabsContent>
					<TabsContent value='unread' className='pt-0'>{renderList(notifications.filter((n) => !n.read))}</TabsContent>
				</CardContent>
			</Card>
		</Tabs>
	);
};

export default NotificationsPanelActionable;
