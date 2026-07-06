'use client';

import { Card, CardContent, CardHeader } from '../../components/Card/Card';
import ScrollFade from '../../components/ScrollFade/ScrollFade';
import Avatar from '../../components/Avatar/Avatar';
import Button from '../../components/Button/Button';
import { useState } from 'react';

interface Notification
{
	id:      number;
	name:    string;
	message: string;
	time:    string;
	read:    boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
	{ id: 1, name: 'Alex Kim',    message: 'Alex Kim commented on your PR',       time: '2m ago',  read: false },
	{ id: 2, name: 'Sam Chen',    message: 'Sam Chen assigned you a task',        time: '18m ago', read: false },
	{ id: 3, name: 'Jordan Park', message: 'Jordan Park mentioned you in a doc',  time: '42m ago', read: false },
	{ id: 4, name: 'Riley Yu',    message: 'Riley Yu approved your request',      time: '1h ago',  read: true  },
	{ id: 5, name: 'Morgan Lee',  message: 'Morgan Lee left a review',            time: '3h ago',  read: true  },
	{ id: 6, name: 'Taylor Cruz', message: 'Taylor Cruz shared a file with you',  time: '5h ago',  read: true  },
	{ id: 7, name: 'Casey Diaz',  message: 'Casey Diaz replied to your comment',  time: '1d ago',  read: true  },
	{ id: 8, name: 'Drew Nolan',  message: 'Drew Nolan invited you to a project', time: '2d ago',  read: true  },
];

export const NotificationsPanel = () => {
	const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

	const markAllAsRead = () => {
		setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
	};

	return (
		<Card className='w-full max-w-md'>
			<CardHeader className='flex items-center justify-between'>
				<h3 className='text-base font-semibold text-text'>Notifications</h3>
				<Button variant='ghost' size='sm' onClick={markAllAsRead}>
					Mark all as read
				</Button>
			</CardHeader>
			<CardContent>
				<ScrollFade direction='vertical' className='max-h-80'>
					<div className='flex flex-col divide-y divide-surface-border'>
						{notifications.map((n) => (
							<div key={n.id} className='flex items-start gap-3 py-3 first:pt-0 last:pb-0'>
								<Avatar name={n.name} size='sm' />
								<div className='flex-1 min-w-0'>
									<p className={n.read ? 'text-sm text-text-muted' : 'text-sm font-medium text-text'}>
										{n.message}
									</p>
									<p className='text-xs text-text-muted mt-0.5'>{n.time}</p>
								</div>
								{!n.read && (
									<span className='flex items-center gap-1.5 mt-1.5 shrink-0'>
										<span className='w-2 h-2 rounded-full bg-brand' aria-hidden='true' />
										<span className='sr-only'>Unread</span>
									</span>
								)}
							</div>
						))}
					</div>
				</ScrollFade>
			</CardContent>
		</Card>
	);
};

export default NotificationsPanel;
