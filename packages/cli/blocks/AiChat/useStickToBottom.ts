import { useCallback, useEffect, useRef, useState } from 'react';

const NEAR_BOTTOM_THRESHOLD_PX = 80;

/** Keeps a scroll container pinned to the bottom while its content grows, until the reader scrolls away. `follow` re-anchors or releases it; `scrollIfFollowing` jumps to the bottom when anchored. Attach the returned callback refs; the container may mount late. */
export const useStickToBottom = () => {
	const containerNode = useRef<HTMLDivElement | null>(null);
	const [container, setContainer] = useState<HTMLDivElement | null>(null);
	const [content, setContent] = useState<HTMLDivElement | null>(null);
	const following = useRef(true);

	const containerRef = useCallback((node: HTMLDivElement | null) => {
		containerNode.current = node;
		setContainer(node);
	}, []);

	const follow = useCallback((value: boolean) => {
		following.current = value;
	}, []);

	const scrollIfFollowing = useCallback(() => {
		const node = containerNode.current;
		if(node && following.current) node.scrollTop = node.scrollHeight;
	}, []);

	useEffect(() => {
		if(!container || !content) return;

		const handleScroll = () => {
			following.current = container.scrollHeight - container.scrollTop - container.clientHeight < NEAR_BOTTOM_THRESHOLD_PX;
		};
		container.addEventListener('scroll', handleScroll, { passive: true });

		const observer = new ResizeObserver(scrollIfFollowing);
		observer.observe(content);

		return () => {
			container.removeEventListener('scroll', handleScroll);
			observer.disconnect();
		};
	}, [container, content, scrollIfFollowing]);

	return { containerRef, contentRef: setContent, follow, scrollIfFollowing };
};
