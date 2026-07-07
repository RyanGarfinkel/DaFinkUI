'use client';

import { useRef, useState, useEffect, HTMLAttributes } from 'react';
import Slider from '../Slider/Slider';
import Button from '../Button/Button';

export type AudioPlayerSize = 'default' | 'compact';

export interface AudioPlayerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>
{
	src:       string;
	title?:    string;
	subtitle?: string;
	size?:     AudioPlayerSize;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;

const fmt = (s: number): string =>
{
	if(!isFinite(s) || s < 0) return '0:00';
	const m  = Math.floor(s / 60);
	const ss = Math.floor(s % 60);
	return `${m}:${ss.toString().padStart(2, '0')}`;
};

const PlayIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
	<svg viewBox='0 0 24 24' fill='currentColor' className={className} aria-hidden='true'>
		<path d='M8 5v14l11-7L8 5z' />
	</svg>
);

const PauseIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
	<svg viewBox='0 0 24 24' fill='currentColor' className={className} aria-hidden='true'>
		<path d='M6 19h4V5H6v14zm8-14v14h4V5h-4z' />
	</svg>
);

const VolumeIcon = ({ muted, volume }: { muted: boolean; volume: number }) =>
{
	if(muted || volume === 0)
		return (
			<svg viewBox='0 0 24 24' fill='currentColor' className='w-4 h-4' aria-hidden='true'>
				<path d='M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z' />
			</svg>
		);

	if(volume < 0.5)
		return (
			<svg viewBox='0 0 24 24' fill='currentColor' className='w-4 h-4' aria-hidden='true'>
				<path d='M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z' />
			</svg>
		);

	return (
		<svg viewBox='0 0 24 24' fill='currentColor' className='w-4 h-4' aria-hidden='true'>
			<path d='M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z' />
		</svg>
	);
};

const SkipBackIcon = () => (
	<svg viewBox='0 0 24 24' fill='currentColor' className='w-4 h-4' aria-hidden='true'>
		<path d='M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z' />
	</svg>
);

const SkipForwardIcon = () => (
	<svg viewBox='0 0 24 24' fill='currentColor' className='w-4 h-4' aria-hidden='true'>
		<path d='M11.5 8c2.65 0 5.05.99 6.9 2.6L22 7v9h-9l3.62-3.62C15.23 11.22 13.46 10.5 11.5 10.5c-3.54 0-6.55 2.31-7.6 5.5L1.53 15.22C2.92 10.03 6.85 8 11.5 8z' />
	</svg>
);

const AudioPlayer = ({
	src,
	title,
	subtitle,
	size = 'default',
	className = '',
	...props
}: AudioPlayerProps) =>
{
	const isCompact = size === 'compact';

	const audioRef = useRef<HTMLAudioElement>(null);

	const [playing,     setPlaying]     = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration,    setDuration]    = useState(0);
	const [volume,      setVolume]      = useState(1);
	const [muted,       setMuted]       = useState(false);
	const [speedIdx,    setSpeedIdx]    = useState(2);

	const speed = SPEEDS[speedIdx];

	useEffect(() =>
	{
		const audio = audioRef.current;
		if(!audio) return;

		const onTimeUpdate     = () => setCurrentTime(audio.currentTime);
		const onDurationChange = () => setDuration(audio.duration);
		const onEnded          = () => setPlaying(false);
		const onPlay           = () => setPlaying(true);
		const onPause          = () => setPlaying(false);

		audio.addEventListener('timeupdate',      onTimeUpdate);
		audio.addEventListener('durationchange',  onDurationChange);
		audio.addEventListener('loadedmetadata',  onDurationChange);
		audio.addEventListener('ended',           onEnded);
		audio.addEventListener('play',            onPlay);
		audio.addEventListener('pause',           onPause);

		return () =>
		{
			audio.removeEventListener('timeupdate',     onTimeUpdate);
			audio.removeEventListener('durationchange', onDurationChange);
			audio.removeEventListener('loadedmetadata', onDurationChange);
			audio.removeEventListener('ended',          onEnded);
			audio.removeEventListener('play',           onPlay);
			audio.removeEventListener('pause',          onPause);
		};
	}, []);

	useEffect(() =>
	{
		const audio = audioRef.current;
		if(!audio) return;

		const onEmptied = () =>
		{
			setPlaying(false);
			setCurrentTime(0);
			setDuration(0);
		};

		audio.addEventListener('emptied', onEmptied);
		audio.load();

		return () => audio.removeEventListener('emptied', onEmptied);
	}, [src]);

	useEffect(() =>
	{
		const audio = audioRef.current;
		if(audio) audio.playbackRate = speed;
	}, [speed]);

	useEffect(() =>
	{
		const audio = audioRef.current;
		if(audio) audio.muted = muted;
	}, [muted]);

	const togglePlay = () =>
	{
		const audio = audioRef.current;
		if(!audio) return;
		if(playing) audio.pause();
		else audio.play().catch(() => {});
	};

	const skip = (delta: number) =>
	{
		const audio = audioRef.current;
		if(!audio) return;
		audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + delta));
	};

	const seek = (value: number) =>
	{
		const audio = audioRef.current;
		if(!audio) return;
		audio.currentTime = value;
		setCurrentTime(value);
	};

	const changeVolume = (value: number) =>
	{
		const audio = audioRef.current;
		if(!audio) return;
		audio.volume = value;
		setVolume(value);
		if(value > 0) setMuted(false);
	};

	const cycleSpeed = () => setSpeedIdx(i => (i + 1) % SPEEDS.length);

	return (
		<div
			role='region'
			aria-label={title ? `Audio player: ${title}` : 'Audio player'}
			className={
				isCompact
					? `flex items-center gap-2 ${className}`
					: `flex flex-col gap-3 p-4 rounded-[var(--radius-lg)] border border-surface-border bg-surface-panel shadow-[var(--shadow-sm)] ${className}`
			}
			{...props}
		>
			<audio ref={audioRef} src={src} preload='metadata' />

			{!isCompact && (title || subtitle) && (
				<div className='min-w-0'>
					{title    && <p className='truncate text-sm font-medium text-text'>{title}</p>}
					{subtitle && <p className='truncate text-xs text-text-muted'>{subtitle}</p>}
				</div>
			)}

			{isCompact ? (
				<>
					<Button
						variant='on-color'
						size='icon-sm'
						shape='circle'
						onClick={togglePlay}
						aria-label={playing ? 'Pause' : 'Play'}
						className='shrink-0'
					>
						{playing ? <PauseIcon className='w-3.5 h-3.5' /> : <PlayIcon className='w-3.5 h-3.5' />}
					</Button>

					<Slider
						value={currentTime}
						onValueChange={seek}
						min={0}
						max={duration || 0}
						step={0.1}
						size='sm'
						tone='current'
						ariaLabel='Seek'
						ariaValueText={`${fmt(currentTime)} of ${fmt(duration)}`}
						className='flex-1'
					/>

					<span className='w-8 shrink-0 text-[11px] tabular-nums text-current/70' aria-hidden='true'>
						{fmt(currentTime)}
					</span>
				</>
			) : (
				<>
					<div className='flex items-center gap-2'>
						<span className='w-10 shrink-0 text-right text-xs tabular-nums text-text-muted' aria-hidden='true'>
							{fmt(currentTime)}
						</span>

						<Slider
							value={currentTime}
							onValueChange={seek}
							min={0}
							max={duration || 0}
							step={0.1}
							ariaLabel='Seek'
							ariaValueText={`${fmt(currentTime)} of ${fmt(duration)}`}
							className='flex-1'
						/>

						<span className='w-10 shrink-0 text-xs tabular-nums text-text-muted' aria-hidden='true'>
							{fmt(duration)}
						</span>
					</div>

					<div className='flex items-center gap-2'>
						<Button variant='ghost' size='md' onClick={() => skip(-10)} aria-label='Skip back 10 seconds'>
							<SkipBackIcon />
							10
						</Button>

						<Button
							variant='primary'
							size='icon'
							shape='circle'
							onClick={togglePlay}
							aria-label={playing ? 'Pause' : 'Play'}
						>
							{playing ? <PauseIcon /> : <PlayIcon />}
						</Button>

						<Button variant='ghost' size='md' onClick={() => skip(10)} aria-label='Skip forward 10 seconds'>
							10
							<SkipForwardIcon />
						</Button>

						<div className='flex-1' />

						<div className='flex items-center gap-1.5'>
							<Button
								variant='ghost'
								size='icon'
								onClick={() => setMuted(m => !m)}
								aria-label={muted || volume === 0 ? 'Unmute' : 'Mute'}
							>
								<VolumeIcon muted={muted} volume={volume} />
							</Button>

							<Slider
								value={muted ? 0 : volume}
								onValueChange={changeVolume}
								min={0}
								max={1}
								step={0.05}
								ariaLabel='Volume'
								className='w-16'
							/>
						</div>

						<Button
							variant='ghost'
							size='md'
							onClick={cycleSpeed}
							aria-label={`Playback speed ${speed}×. Click to change.`}
							className='tabular-nums'
						>
							{speed}×
						</Button>
					</div>
				</>
			)}
		</div>
	);
};

export default AudioPlayer;
