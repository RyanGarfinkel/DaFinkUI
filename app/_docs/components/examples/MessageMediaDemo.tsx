'use client';

import AudioPlayer from '@/src/components/AudioPlayer/AudioPlayer';
import { Message } from '@/src/components/Message/Message';

export const MessageMediaDemo = () => {
	return (
		<div className='flex w-full max-w-sm flex-col gap-3'>
			<Message variant='received' bubble={false}>
				<img
					src='https://picsum.photos/seed/dafink-message/320/200'
					alt='Photo shared in the conversation'
					className='w-full max-w-[220px] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]'
				/>
			</Message>

			<Message variant='received'>Just got back from the trip — here&apos;s the view!</Message>

			<Message variant='sent'>
				<AudioPlayer
					size='compact'
					src='https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
					className='w-44'
				/>
			</Message>
		</div>
	);
};
