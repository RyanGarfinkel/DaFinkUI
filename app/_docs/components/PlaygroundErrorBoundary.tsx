'use client';

import { Alert } from '@/src/components/Alert/Alert';
import { Component, type ReactNode } from 'react';

interface PlaygroundErrorBoundaryProps
{
	children: ReactNode;
	/** Bump this when the evaluated code changes so a fixed error clears on the next attempt. */
	resetKey: string | number;
}

interface PlaygroundErrorBoundaryState
{
	error: Error | null;
}

/** Catches errors thrown while React actually renders the evaluated playground element (as
 * opposed to errors thrown while transpiling/invoking the code, which the caller already
 * catches) — a real component in the scope can still throw mid-render on a bad prop combination,
 * and without this boundary that would crash the whole Playground page instead of just the
 * preview. */
export class PlaygroundErrorBoundary extends Component<PlaygroundErrorBoundaryProps, PlaygroundErrorBoundaryState>
{
	public constructor(props: PlaygroundErrorBoundaryProps)
	{
		super(props);
		this.state = { error: null };
	}

	public static getDerivedStateFromError(error: Error): PlaygroundErrorBoundaryState
	{
		return { error };
	}

	public componentDidUpdate(prevProps: PlaygroundErrorBoundaryProps): void
	{
		if(prevProps.resetKey !== this.props.resetKey && this.state.error)
			this.setState({ error: null });
	}

	public render()
	{
		if(this.state.error)
		{
			return (
				<Alert variant='danger' title="Couldn't render this code">
					{this.state.error.message}
				</Alert>
			);
		}

		return this.props.children;
	}
}
