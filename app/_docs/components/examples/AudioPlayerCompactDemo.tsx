'use client';

import AudioPlayer from '@/src/components/AudioPlayer/AudioPlayer';

export const AudioPlayerCompactDemo = () => {
	return (
		<div className='w-full max-w-sm rounded-full bg-surface-active px-4 py-2 text-text'>
			<AudioPlayer
				size='compact'
				src='https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
			/>
		</div>
	);
};
