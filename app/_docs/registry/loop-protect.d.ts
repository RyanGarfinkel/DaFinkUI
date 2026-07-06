declare module 'loop-protect' {
	/** Returns a Babel plugin that rewrites for/while/do loops to break out on their own once
	 * `timeout` milliseconds have elapsed since entering the loop. */
	export default function loopProtect(timeout?: number): object;
}
