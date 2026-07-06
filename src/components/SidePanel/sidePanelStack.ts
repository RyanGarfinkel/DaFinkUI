import type { SidePanelSide } from './SidePanel';

// ─── Cross-instance panel stack ────────────────────────────────────────────────
// Lets independently-triggered SidePanels on the same side auto-offset each
// other: opening a second panel pushes earlier ones on that side further
// toward the center, purely by position — no dimming, no scaling, no
// inertness. Module-level singleton (not React context) so it works across
// the whole app without requiring a shared provider ancestor.

export interface StackEntry
{
	id:   string;
	size: number;
}

const STACK_GAP = 16;

const EMPTY_STACK: StackEntry[] = [];

const stacks    = new Map<SidePanelSide, StackEntry[]>();
const listeners = new Map<SidePanelSide, Set<() => void>>();

const getStack = (side: SidePanelSide): StackEntry[] => stacks.get(side) ?? EMPTY_STACK;

const notify = (side: SidePanelSide): void =>
{
	listeners.get(side)?.forEach(listener => listener());
};

export const subscribeToStack = (side: SidePanelSide, listener: () => void): () => void =>
{
	if(!listeners.has(side)) listeners.set(side, new Set());
	listeners.get(side)!.add(listener);
	return () => listeners.get(side)?.delete(listener);
};

export const getStackSnapshot = (side: SidePanelSide): StackEntry[] => getStack(side);

export const registerInStack = (side: SidePanelSide, id: string): void =>
{
	const stack = getStack(side);
	if(stack.some(entry => entry.id === id)) return;

	stacks.set(side, [...stack, { id, size: 0 }]);
	notify(side);
};

export const unregisterFromStack = (side: SidePanelSide, id: string): void =>
{
	const stack = getStack(side);
	if(!stack.some(entry => entry.id === id)) return;

	stacks.set(side, stack.filter(entry => entry.id !== id));
	notify(side);
};

export const reportStackEntrySize = (side: SidePanelSide, id: string, size: number): void =>
{
	const stack = getStack(side);
	const index = stack.findIndex(entry => entry.id === id);
	if(index === -1 || stack[index].size === size) return;

	const next = [...stack];
	next[index] = { ...next[index], size };
	stacks.set(side, next);
	notify(side);
};

/** How far `id` must shift toward the center to stay clear of every panel
 * opened after it on the same side — the sum of their sizes plus a gap. */
export const computeStackOffset = (entries: StackEntry[], id: string): number =>
{
	const index = entries.findIndex(entry => entry.id === id);
	if(index === -1) return 0;

	return entries.slice(index + 1).reduce((sum, entry) => sum + entry.size + STACK_GAP, 0);
};

/** A panel with another panel open in front of it on the same side can't be
 * closed until that one closes — otherwise the front panel would be left
 * pointing at nothing. */
export const isBlockedInStack = (entries: StackEntry[], id: string): boolean =>
{
	const index = entries.findIndex(entry => entry.id === id);
	if(index === -1) return false;

	return index < entries.length - 1;
};
