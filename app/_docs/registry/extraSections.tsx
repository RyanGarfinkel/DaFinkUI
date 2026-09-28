import { WorkflowBuilderShowcase } from '@/app/_docs/components/examples/WorkflowBuilderShowcase';
import { AudioPlayerCompactDemo } from '@/app/_docs/components/examples/AudioPlayerCompactDemo';
import { CodeBlock } from '@/src/components/CodeBlock/CodeBlock';

export interface ExtraSection {
	heading: string;
	description?: React.ReactNode;
	demo?: React.ReactNode;
}

interface KeyboardShortcutRow {
	keys: string[];
	description: string;
}

const KeyboardShortcutsTable = ({ rows }: { rows: KeyboardShortcutRow[] }) => (
	<div className='w-full overflow-x-auto'>
		<table className='w-full border-collapse text-left'>
			<thead>
				<tr>
					<th className='border-b border-surface-border pb-2 pr-6 w-40 text-xs font-medium text-text-muted uppercase tracking-wide'>
						Key
					</th>
					<th className='border-b border-surface-border pb-2 text-xs font-medium text-text-muted uppercase tracking-wide'>
						Function
					</th>
				</tr>
			</thead>
			<tbody>
				{rows.map(({ keys, description }) => (
					<tr key={keys.join('+')} className='border-b border-surface-border last:border-b-0'>
						<td className='py-3 pr-6 align-top whitespace-nowrap'>
							{keys.map((key, i) => (
								<span key={key}>
									{i > 0 && <span className='mx-1.5 text-text-subtle'>+</span>}
									<kbd className='rounded-md bg-surface-active px-1.5 py-0.5 font-mono text-xs text-text-muted'>
										{key}
									</kbd>
								</span>
							))}
						</td>
						<td className='py-3 text-sm text-text-muted align-top'>
							{description}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	</div>
);

const TOGGLE_GROUP_KEYS: KeyboardShortcutRow[] = [
	{ keys: ['tab'], description: "Moves focus to the group's active item, or out to the next tabbable element if focus is already inside the group." },
	{ keys: ['shift', 'tab'], description: 'Moves focus out of the group to the previous tabbable element.' },
	{ keys: ['enter'], description: 'Activates the focused item.' },
	{ keys: ['space'], description: 'Activates the focused item.' },
	{ keys: ['right arrow'], description: 'Moves focus to the next item, wrapping from the last item to the first.' },
	{ keys: ['down arrow'], description: 'Moves focus to the next item, wrapping from the last item to the first.' },
	{ keys: ['left arrow'], description: 'Moves focus to the previous item, wrapping from the first item to the last.' },
	{ keys: ['up arrow'], description: 'Moves focus to the previous item, wrapping from the first item to the last.' },
	{ keys: ['home'], description: 'Moves focus to the first enabled item.' },
	{ keys: ['end'], description: 'Moves focus to the last enabled item.' },
];

const TOOL_CALL_ENTRY_TYPE = `interface ToolCallLink {
  title: string;
  url:   string;
}

interface ToolCallEntry {
  id:      string;
  kind:    string;
  title:   string;
  detail:  string;
  result?: string;
  links?:  ToolCallLink[];
  icon?:   ReactNode;
}`;

export const extraSections: Record<string, ExtraSection[]> = {
	'toggle-group': [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						ToggleGroup uses roving tabindex: only the active or last-focused item sits in the page&apos;s Tab order, so Tab moves focus into and out of the whole group in a single stop rather than stepping through every item.
					</p>
					<KeyboardShortcutsTable rows={TOGGLE_GROUP_KEYS} />
				</div>
			),
		},
	],
	audioplayer: [
		{
			heading: 'Compact size',
			description: (
				<>
					Pass <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>size=&quot;compact&quot;</code> for exactly three elements in one row (play/pause, seek slider, elapsed time) with no card chrome of its own. The play button and slider derive their color from <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>currentColor</code>, so they stay legible when dropped straight into a colored container, like a <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>Message</code> bubble.
				</>
			),
			demo: <AudioPlayerCompactDemo />,
		},
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						AudioPlayer adds no custom focus management: every control is a real, native-tab-order element (<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>Button</code> and <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>Slider</code>&apos;s native <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>input type=&quot;range&quot;</code>), so Tab steps through them in DOM order with no roving tabindex or trap. The container is <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;region&quot;</code> with an <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label</code> that includes the track title when provided, the seek slider exposes a human-readable <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-valuetext</code> (e.g. &quot;1:32 of 6:12&quot;), and the play/pause and mute buttons&apos; <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label</code> update live to describe the action each will perform next.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['space'], description: 'Toggles playback when the play/pause button is focused.' },
						{ keys: ['enter'], description: 'Toggles playback when the play/pause button is focused.' },
						{ keys: ['left arrow'], description: 'Steps the seek slider back 0.1 seconds, or decreases volume by 0.05 on the volume slider.' },
						{ keys: ['right arrow'], description: 'Steps the seek slider forward 0.1 seconds, or increases volume by 0.05 on the volume slider.' },
						{ keys: ['home'], description: 'Jumps the seek slider to the start.' },
						{ keys: ['end'], description: 'Jumps the seek slider to the end.' },
					]} />
				</div>
			),
		},
	],
	'workflow-builder': [
		{
			heading: 'Examples',
			demo: <WorkflowBuilderShowcase />,
		},
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						WorkflowBuilder relies on React Flow&apos;s built-in keyboard support rather than a custom roving-tabindex implementation: every node renders with <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;group&quot;</code>, <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>tabIndex={0}</code>, and <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-roledescription=&quot;node&quot;</code>, so nodes sit in normal document tab order alongside the toolbar buttons, the Layout ToggleGroup, and — once a node is selected — the inspector panel&apos;s form fields. Creating a connection between two nodes is pointer/touch-only: each connection <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>Handle</code> is a plain, non-focusable div with only mouse/touch/click handlers, so there is no keyboard path to wire two ports together. Everything else — selecting, moving, and deleting nodes and edges — is fully keyboard-operable, and none of it fires in <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>readOnly</code> mode.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['tab'], description: "Moves focus to the next node, toolbar control, or inspector field, following the page's normal tab order." },
						{ keys: ['shift', 'tab'], description: 'Moves focus to the previous stop in that same order.' },
						{ keys: ['enter'], description: 'Selects the focused node and opens the inspector panel, or activates the focused button.' },
						{ keys: ['space'], description: 'Selects the focused node and opens the inspector panel, or activates the focused button.' },
						{ keys: ['up arrow'], description: 'Moves the selected node up (Shift moves it further per press).' },
						{ keys: ['down arrow'], description: 'Moves the selected node down (Shift moves it further per press).' },
						{ keys: ['left arrow'], description: 'Moves the selected node left (Shift moves it further per press).' },
						{ keys: ['right arrow'], description: 'Moves the selected node right (Shift moves it further per press).' },
						{ keys: ['escape'], description: 'Deselects the focused node and closes the inspector panel.' },
						{ keys: ['delete'], description: 'Deletes the selected node or edge (disabled in read-only mode).' },
						{ keys: ['backspace'], description: 'Deletes the selected node or edge (disabled in read-only mode).' },
					]} />
				</div>
			),
		},
	],
	'tool-call-trace': [
		{
			heading: 'ToolCallEntry fields',
			demo: <CodeBlock variant='code' code={TOOL_CALL_ENTRY_TYPE} />,
		},
		{
			heading: 'Accessibility',
			description: (
				<p>
					ToolCallTrace has no custom focus management of its own: the trigger is Collapsible&apos;s native button with <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-expanded</code>, reachable with Tab and toggled with Enter/Space, and its content is hidden from assistive tech while collapsed. Once expanded, the nested Timeline&apos;s numbered dots and connector lines are purely decorative (<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-hidden</code>), so the only additional tab stops are each result link, which opens in a new tab via <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>target=&quot;_blank&quot; rel=&quot;noopener noreferrer&quot;</code>.
				</p>
			),
		},
	],
	button: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Button renders a native <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;button&gt;</code>, so it sits in normal Tab order and Enter/Space activate it with no extra JS; when <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>href</code> is passed it renders a Next.js <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>Link</code> instead, so only Enter (not Space) activates it, matching native anchor behavior. <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>loading</code> sets both <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-busy=&quot;true&quot;</code> and <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>disabled</code>. Icon-only sizes (<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>icon</code>, <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>icon-sm</code>) require an <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label</code> since none is supplied automatically. No roving tabindex or arrow-key behavior.
				</p>
			),
		},
	],
	input: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Input renders a native <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;input&gt;</code> with no custom focus management: native Tab order, native text-editing keys. The visible <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>label</code> is linked via <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>htmlFor</code>/<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>id</code>, and the error/hint message is linked via <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-describedby</code>, with <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-invalid</code> set when <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>error</code> is present. When <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>type=&quot;password&quot;</code>, a second real, independently Tab-reachable <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;button&gt;</code> toggles visibility and updates its own <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label</code> between &quot;Show password&quot; and &quot;Hide password&quot;.
				</p>
			),
		},
	],
	'otp-input': [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						Every cell is a real, independently focusable <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;input&gt;</code> in native tab order (not roving tabindex): Tab steps through all cells one by one like any other multi-field form. Each cell carries <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label=&quot;Character N of M&quot;</code>, and the cells are grouped under <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;group&quot;</code> with <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-labelledby</code>/<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-describedby</code> pointing at the visible label and hint/error text. The native caret is hidden (<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>caret-transparent</code>) and replaced with a decorative, <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-hidden</code> blinking-line cursor that respects <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>prefers-reduced-motion</code>. Only the first cell carries <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>autoComplete=&quot;one-time-code&quot;</code>, enabling SMS/browser autofill.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['character key'], description: 'Fills the focused cell (filtered by the charset prop) and advances focus to the next cell.' },
						{ keys: ['backspace'], description: 'Clears the focused cell if it has a value; if already empty, clears and moves focus to the previous cell.' },
						{ keys: ['left arrow'], description: 'Moves focus to the previous cell.' },
						{ keys: ['right arrow'], description: 'Moves focus to the next cell.' },
						{ keys: ['cmd', 'v'], description: 'Pasting anywhere fills every cell from the start with the first N filtered characters and moves focus to the last filled cell.' },
					]} />
				</div>
			),
		},
	],
	textarea: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Textarea renders a native <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;textarea&gt;</code> with no custom focus management or keyboard handling: native Tab order, native multi-line text editing (including Enter for newlines). <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>label</code> is linked via <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>htmlFor</code>/<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>id</code>, and the error or hint message is linked via <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-describedby</code>, with <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-invalid</code> set whenever <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>error</code> is present.
				</p>
			),
		},
	],
	radio: [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						RadioGroup renders <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;radiogroup&quot;</code> around native, visually-hidden (<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>sr-only</code>) <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;input type=&quot;radio&quot;&gt;</code> elements that all share one <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>name</code>, so the browser treats the whole group as a single Tab stop: Tab lands on the selected item (or the first enabled item if none is selected) rather than stepping through every item. Arrow keys are handled in JS rather than left to default browser radio behavior: they move focus between enabled items, wrapping at the ends, but do not themselves select an item — a focused item only becomes selected on Enter/Space (or click), which is a deliberate divergence from an uncontrolled native radio group where arrow keys select immediately. <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-checked</code> mirrors the controlled state on each input.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['tab'], description: 'Moves focus to the group, landing on the selected item (or first enabled item if none selected), or out to the next tabbable element if focus is already inside.' },
						{ keys: ['shift', 'tab'], description: 'Moves focus out of the group to the previous tabbable element.' },
						{ keys: ['right arrow'], description: 'Moves focus to the next enabled item, wrapping from the last to the first, without selecting it.' },
						{ keys: ['down arrow'], description: 'Moves focus to the next enabled item, wrapping from the last to the first, without selecting it.' },
						{ keys: ['left arrow'], description: 'Moves focus to the previous enabled item, wrapping from the first to the last, without selecting it.' },
						{ keys: ['up arrow'], description: 'Moves focus to the previous enabled item, wrapping from the first to the last, without selecting it.' },
						{ keys: ['enter'], description: 'Selects the focused item.' },
						{ keys: ['space'], description: 'Selects the focused item.' },
					]} />
				</div>
			),
		},
	],
	switch: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Switch renders a native <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;button role=&quot;switch&quot;&gt;</code> with <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-checked</code> mirroring the controlled <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>checked</code> prop: no custom keyboard handling, Enter/Space toggle it via native button semantics, and it sits in normal Tab order as a single stop, no roving tabindex or arrow keys. <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>label</code> is linked via <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>htmlFor</code>/<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>id</code>, and <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>hint</code> is linked via <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-describedby</code>.
				</p>
			),
		},
	],
	checkbox: [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						Checkbox renders a native <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;input type=&quot;checkbox&quot;&gt;</code> wrapped in a <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;label&gt;</code>, so the entire label row is a click target: native Tab order, no roving tabindex. Space toggles it via native semantics; Enter is the one piece of custom handling Checkbox adds on top — a native checkbox only responds to Space in every browser, which reads as broken next to a button or link that responds to both, so Checkbox&apos;s own <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>onKeyDown</code> makes Enter toggle it too (a consumer&apos;s own <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>onKeyDown</code> still runs first and can call <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>preventDefault()</code> to suppress it). When an explicit <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>id</code> is passed it&apos;s also linked via <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>htmlFor</code>. Checkbox does not set <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-invalid</code> itself; error state is left to a wrapping <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>FormField</code>/<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>FormMessage</code>.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['tab'], description: 'Focuses the checkbox, or the whole label row if it wraps one — native tab order, no roving tabindex.' },
						{ keys: ['space'], description: 'Toggles the checkbox. Native browser behavior, not something Checkbox adds.' },
						{ keys: ['enter'], description: 'Also toggles the checkbox, matching Space. This is Checkbox’s own addition: a native checkbox otherwise ignores Enter entirely.' },
					]} />
				</div>
			),
		},
	],
	select: [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						The trigger is a native <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;button&gt;</code> (<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-haspopup=&quot;listbox&quot;</code>, <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-expanded</code>, <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-controls</code>); opening moves focus to the popup <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;ul role=&quot;listbox&quot;&gt;</code> itself (<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>tabIndex={-1}</code>, focused programmatically), which drives the active option via <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-activedescendant</code> rather than moving real DOM focus between <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;option&quot;</code> items. Focus is not trapped: Tab closes the list and lets focus continue naturally to the next page element, while Escape closes and explicitly returns focus to the trigger.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['enter'], description: 'Opens the dropdown from the trigger, or confirms the active option and closes when the list is open.' },
						{ keys: ['space'], description: 'Opens the dropdown from the trigger, or confirms the active option and closes when the list is open.' },
						{ keys: ['down arrow'], description: 'Moves the active option to the next one, wrapping from the last to the first.' },
						{ keys: ['up arrow'], description: 'Moves the active option to the previous one, wrapping from the first to the last.' },
						{ keys: ['home'], description: 'Jumps the active option to the first item.' },
						{ keys: ['end'], description: 'Jumps the active option to the last item.' },
						{ keys: ['escape'], description: 'Closes the dropdown and returns focus to the trigger.' },
						{ keys: ['tab'], description: 'Closes the dropdown without returning focus to the trigger, letting Tab land on the next page element.' },
					]} />
				</div>
			),
		},
	],
	badge: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Badge renders a plain <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;span&gt;</code> with no ARIA role and nothing focusable; it has no keyboard behavior of its own. Status variants pair their color with a distinct text label (e.g. &quot;Active&quot;, &quot;Failed&quot;), so meaning never depends on color alone. A badge showing live-updating status should get a wrapping <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-live=&quot;polite&quot;</code> region from the consumer.
				</p>
			),
		},
	],
	card: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Card, CardHeader, CardContent, and CardFooter all render plain <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;div&gt;</code>s with no ARIA role. The <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>interactive</code> prop only changes hover/focus-visible styling (lift, shadow, ring) and adds <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>cursor-pointer</code> — it does not add <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>tabIndex</code>, a <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role</code>, or a keyboard handler, so a clickable Card is not keyboard-reachable unless the consumer adds those themselves (or places a real button/link inside instead).
				</p>
			),
		},
	],
	skeleton: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Every Skeleton export (<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>Skeleton</code>, <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>SkeletonCard</code>, <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>SkeletonInput</code>, <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>SkeletonTableRow</code>, <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>SkeletonForm</code>, <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>SkeletonImage</code>) renders with <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-hidden=&quot;true&quot;</code>, so screen readers skip every placeholder entirely; there is nothing focusable or keyboard-reachable. Announce loading state separately with a visually hidden <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;status&quot;</code> element if one is needed.
				</p>
			),
		},
	],
	alert: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Alert&apos;s root has <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;alert&quot;</code>, so assistive technology announces its content as soon as it mounts; the variant icon is <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-hidden=&quot;true&quot;</code> and Alert has no keyboard behavior of its own. Only the <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>success</code> variant uses a visually distinct icon (a check-circle) — <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>default</code>, <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>warning</code>, and <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>danger</code> currently share the same triangle-alert icon path, so for those three the required title/body text is what keeps the state from depending on color alone.
				</p>
			),
		},
	],
	avatar: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Avatar renders a plain <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;span&gt;</code> with nothing focusable. An image avatar puts the required <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>alt</code> directly on the <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;img&gt;</code>; a fallback with a name or alt gets <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;img&quot;</code> plus <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label</code> on the root (initials stay <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-hidden=&quot;true&quot;</code>), and a fallback with neither is fully <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-hidden=&quot;true&quot;</code>. AvatarGroup&apos;s &quot;+N&quot; overflow indicator follows the same <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;img&quot;</code> pattern. Avatar adds no keyboard behavior; wrap it in a button or link if it needs to be interactive.
				</p>
			),
		},
	],
	separator: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					The no-label horizontal case renders a real <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;hr&gt;</code>, whose separator role and orientation are implicit; every other case (vertical, or any labeled separator) is a <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;div role=&quot;separator&quot;&gt;</code> with an explicit <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-orientation</code>. The decorative line segments are <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-hidden=&quot;true&quot;</code>, leaving only the label text exposed to assistive tech. Per the WAI-ARIA separator role for non-interactive use, Separator has no <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>tabIndex</code> and no keyboard behavior.
				</p>
			),
		},
	],
	spinner: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Spinner&apos;s outer element has <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;status&quot;</code> and an <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label</code> set from the <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>label</code> prop (default <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&apos;Loading…&apos;</code>), plus a visually hidden fallback <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;span&gt;</code> with the same text, so assistive tech announces it on mount; the spinning ring itself is <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-hidden=&quot;true&quot;</code>. There is nothing focusable or keyboard-reachable.
				</p>
			),
		},
	],
	progress: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Progress&apos;s track has <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;progressbar&quot;</code> with <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-valuenow</code>, <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-valuemin={0}</code>, and <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-valuemax</code> kept in sync with props, so assistive tech announces the numeric value even when <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>showLabel</code> is false; the fill bar itself carries no ARIA of its own. Progress has no focusable elements or keyboard behavior — add a wrapping <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label</code> when the bar isn&apos;t already next to descriptive text.
				</p>
			),
		},
	],
	sidebar: [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						Sidebar is a persistent layout landmark (<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>{'<aside>'}</code>), not a popup overlay, so none of the focus-trap/Escape/backdrop checklist applies. Its nav items use roving tabindex: only the active or last-focused item sits in the page&apos;s Tab order (<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>tabIndex={'{0}'}</code>, all others <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>{'{-1}'}</code>), so Tab moves into and out of the whole sidebar in one stop rather than stepping through every link and button; arrow keys move the roving position instead. The active item gets <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-current=&quot;page&quot;</code>, and the collapse toggle is a real button with <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-expanded</code>/<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label</code>.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['tab'], description: "Moves focus to the sidebar's roving item (the active item, or the first item if none is active), or out to the next tabbable page element if focus is already inside." },
						{ keys: ['shift', 'tab'], description: 'Moves focus out of the sidebar to the previous tabbable element.' },
						{ keys: ['down arrow'], description: 'Moves focus to the next item, wrapping from the last item to the first.' },
						{ keys: ['up arrow'], description: 'Moves focus to the previous item, wrapping from the first item to the last.' },
						{ keys: ['home'], description: 'Moves focus to the first item.' },
						{ keys: ['end'], description: 'Moves focus to the last item.' },
						{ keys: ['right arrow'], description: 'From a row with a trailing action control, dives into its first action; from inside an action group, moves to the next action.' },
						{ keys: ['left arrow'], description: 'From inside an action group, moves to the previous action, or back out to the row from the first action.' },
						{ keys: ['escape'], description: "From inside a row's action group, moves focus back to the row." },
						{ keys: ['enter'], description: 'Activates the focused link or button.' },
					]} />
				</div>
			),
		},
	],
	modal: [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						Modal is a blocking overlay built on the native <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>{'<dialog>'}</code> element with <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>showModal()</code>: <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;dialog&quot;</code>, <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-modal=&quot;true&quot;</code>, and <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-labelledby</code> pointing at <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>ModalTitle</code>. Focus moves to the first focusable element inside the panel on open (or the panel itself if it has none), is fully trapped inside the panel while open (focusable elements are re-queried on every Tab press), and returns to the trigger element whenever the modal closes, however it closed.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['escape'], description: 'Closes the modal and returns focus to the trigger.' },
						{ keys: ['tab'], description: 'Moves focus to the next focusable element inside the panel, wrapping from the last back to the first (focus trap).' },
						{ keys: ['shift', 'tab'], description: 'Moves focus to the previous focusable element inside the panel, wrapping from the first back to the last.' },
						{ keys: ['enter'], description: 'Activates the focused button (native behavior).' },
					]} />
				</div>
			),
		},
	],
	drawer: [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						Drawer shares Modal&apos;s full blocking-overlay contract — native <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>{'<dialog>'}</code> with <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>showModal()</code>, <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;dialog&quot;</code>, <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-modal=&quot;true&quot;</code>, <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-labelledby</code> — just with a translate-based slide-in animation instead of fade + scale. Focus moves to the first focusable element in the panel on open, is trapped inside it (Tab/Shift+Tab wrap, re-queried on every press), and returns to the trigger on any close path (Escape, backdrop click, `DrawerClose`, or unmount).
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['escape'], description: 'Closes the drawer and returns focus to the trigger.' },
						{ keys: ['tab'], description: 'Moves focus to the next focusable element inside the panel, wrapping from the last back to the first (focus trap).' },
						{ keys: ['shift', 'tab'], description: 'Moves focus to the previous focusable element inside the panel, wrapping from the first back to the last.' },
						{ keys: ['enter'], description: 'Activates the focused button (native behavior).' },
					]} />
				</div>
			),
		},
	],
	'side-panel': [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						SidePanel is deliberately non-modal: it&apos;s a portaled <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>{'<div>'}</code> (<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;dialog&quot;</code>, no <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-modal</code>), not a native <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>{'<dialog>'}</code>, so the rest of the page stays clickable, scrollable, and un-dimmed. Focus moves to the first focusable element on open, but Tab is never trapped — it moves natively past the panel&apos;s edges to the next page element, and the panel stays open. Escape closes it and returns focus to the trigger, unless another same-side panel is stacked in front of it, in which case Escape (and `SidePanelClose`) are no-ops until that one closes first.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['escape'], description: 'Closes the panel and returns focus to the trigger; no-op if a same-side panel is stacked in front of this one.' },
						{ keys: ['tab'], description: "Moves focus natively to the next focusable element; leaving the panel doesn't close it and isn't trapped." },
						{ keys: ['shift', 'tab'], description: 'Same as Tab, in reverse.' },
						{ keys: ['enter'], description: 'Activates the focused control (native behavior).' },
					]} />
				</div>
			),
		},
	],
	popover: [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						Popover is a non-modal floating panel (<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;dialog&quot;</code>, no <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-modal</code>) with no focus trap. On open, focus moves to the first focusable element inside the panel (or the panel itself if empty). Tab is never intercepted: it walks through the panel&apos;s own content, and once focus leaves the panel entirely (Tab, Shift+Tab, or an outside click) a blur/pointerdown handler closes it without pulling focus back. Escape is the one path that both closes it and returns focus to the trigger.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['escape'], description: 'Closes the popover and returns focus to the trigger.' },
						{ keys: ['tab'], description: "Moves through the panel's focusable content; once focus leaves the panel it closes without stealing focus back." },
						{ keys: ['shift', 'tab'], description: 'Same as Tab, in reverse.' },
						{ keys: ['enter'], description: 'Toggles the popover from the trigger button (native activation).' },
					]} />
				</div>
			),
		},
	],
	tooltip: [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						Tooltip never receives or manages focus itself — the trigger keeps native focus throughout, gains <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-describedby</code> pointing at the tooltip while it&apos;s shown, and the tooltip element carries <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;tooltip&quot;</code>. It shows on hover (after `delay`ms) and on keyboard focus (immediately, no delay), and must never contain interactive content.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['tab'], description: 'Moves native focus to the trigger, which shows the tooltip immediately (no delay).' },
						{ keys: ['shift', 'tab'], description: 'Moves focus off the trigger, which hides the tooltip on blur.' },
						{ keys: ['escape'], description: 'Dismisses the tooltip, whether it was shown by hover or focus.' },
					]} />
				</div>
			),
		},
	],
	'dropdown-menu': [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						DropdownMenu uses virtual focus, not roving tabindex: the menu list itself takes DOM focus (<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>tabIndex={'{-1}'}</code>) on open, and the highlighted item is tracked purely via <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-activedescendant</code> rather than moving real DOM focus between <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>{'<li role="menuitem">'}</code> items. It is a non-modal popup: Tab is never trapped, it closes the menu and continues to the next page element. The trigger carries <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-haspopup=&quot;menu&quot;</code>/<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-expanded</code>/<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-controls</code>; the list is <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;menu&quot;</code>; separators are <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;separator&quot;</code>.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['enter'], description: 'On trigger: opens the menu. In the menu: activates the active item and closes.' },
						{ keys: ['space'], description: 'Same as Enter.' },
						{ keys: ['down arrow'], description: 'On trigger: opens with the first item active. In the menu: moves to the next enabled item, wrapping.' },
						{ keys: ['up arrow'], description: 'On trigger: opens with the last item active. In the menu: moves to the previous enabled item, wrapping.' },
						{ keys: ['home'], description: 'Moves to the first enabled item.' },
						{ keys: ['end'], description: 'Moves to the last enabled item.' },
						{ keys: ['escape'], description: 'Closes the menu and returns focus to the trigger.' },
						{ keys: ['tab'], description: 'Closes the menu without intercepting the keypress, so focus continues to the next page element.' },
					]} />
				</div>
			),
		},
	],
	combobox: [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						Combobox keeps real DOM focus in the <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>{'<input role="combobox">'}</code> at all times; the highlighted option in the listbox is virtual focus only, communicated via <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-activedescendant</code> against a <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;listbox&quot;</code>/<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;option&quot;</code> list — never real roving tabindex on the options. It is non-modal and never trapped: Tab closes the dropdown and moves on naturally.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['down arrow'], description: 'Opens the dropdown if closed; otherwise moves to the next enabled option, wrapping.' },
						{ keys: ['up arrow'], description: 'Opens the dropdown if closed; otherwise moves to the previous enabled option, wrapping.' },
						{ keys: ['home'], description: 'Jumps to the first enabled option.' },
						{ keys: ['end'], description: 'Jumps to the last enabled option.' },
						{ keys: ['enter'], description: 'Selects the active option.' },
						{ keys: ['escape'], description: 'Closes the dropdown (focus stays in the input); clears the input if the dropdown is already closed.' },
						{ keys: ['tab'], description: 'Closes the dropdown without returning focus, letting Tab land on the next page element naturally.' },
						{ keys: ['backspace'], description: 'In multi-select mode, removes the last selected pill when the input is empty.' },
					]} />
				</div>
			),
		},
	],
	timeline: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Timeline is a display-only component with no interactive elements and no component-specific keyboard behavior. Indicator dots and connector lines are marked <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-hidden</code> since they&apos;re purely decorative, and each step&apos;s title renders as a plain paragraph. Consumers who need the sequence announced as an ordered list should wrap items in their own <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>ol</code>/<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>li</code> structure via <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>className</code>, since Timeline doesn&apos;t impose one itself.
				</p>
			),
		},
	],
	canvas: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Canvas has no custom focus management: every toolbar control (tool selector, color swatches, stroke width, undo/redo, clear, download) is a native button reachable with Tab and activated with Enter/Space, in plain document order. The color swatches expose <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;radio&quot;</code> inside a <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;radiogroup&quot;</code>, but there is no roving-tabindex or arrow-key handling wired up for that group, so in practice each swatch is its own ordinary tab stop rather than following the full ARIA radiogroup keyboard pattern. The drawing surface itself is pointer-only: it&apos;s exposed to assistive tech as a static <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;img&quot;</code> with <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label=&quot;Drawing canvas&quot;</code>, since there is no keyboard equivalent for freehand drawing.
				</p>
			),
		},
	],
	'function-plotter': [
		{
			heading: 'Accessibility',
			description: (
				<p>
					FunctionPlotter has no custom focus management beyond native tab order: the equation inputs, remove buttons, add button, and zoom controls are all individually-focusable native elements reachable with Tab and activated with Enter/Space. The plotted canvas itself is a static <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;img&quot;</code> with <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label=&quot;Function plot&quot;</code> — panning, wheel-zooming, selecting the active curve, and the hover tooltip are all pointer-only with no keyboard equivalent. The one exception is the extremum/intersection marker popup (<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;dialog&quot;</code>): once opened by a pointer click, its close button is keyboard-reachable and pressing Escape closes it, same as clicking the close button.
				</p>
			),
		},
	],
	carousel: [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						Carousel uses native tab order, not roving tabindex: the Previous button, Next button, each dot, and any focusable slide content are all individually reachable stops in plain document order. Left/Right arrow keys are handled at the carousel region and work as long as focus is anywhere inside it, regardless of which control currently has focus.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['right arrow'], description: 'Advances to the next slide, from anywhere focus is inside the carousel region.' },
						{ keys: ['left arrow'], description: 'Goes to the previous slide, from anywhere focus is inside the carousel region.' },
						{ keys: ['tab'], description: 'Moves focus to the next focusable element (Previous, Next, a dot, or slide content) in native document order.' },
						{ keys: ['shift', 'tab'], description: 'Moves focus to the previous focusable element in native document order.' },
						{ keys: ['enter'], description: 'Activates the focused Previous, Next, or dot button.' },
						{ keys: ['space'], description: 'Activates the focused Previous, Next, or dot button.' },
					]} />
				</div>
			),
		},
	],
	slider: [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						Slider has no custom keyboard handling of its own — it&apos;s a single native <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>input type=&quot;range&quot;</code>, so all keyboard interaction comes from the browser&apos;s built-in range-input behavior. Tab reaches it as one stop; the component mirrors the resulting value visually (fill width, thumb focus ring) rather than intercepting or reimplementing any of it.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['right arrow'], description: 'Increases the value by one step.' },
						{ keys: ['up arrow'], description: 'Increases the value by one step.' },
						{ keys: ['left arrow'], description: 'Decreases the value by one step.' },
						{ keys: ['down arrow'], description: 'Decreases the value by one step.' },
						{ keys: ['home'], description: 'Jumps to the minimum value.' },
						{ keys: ['end'], description: 'Jumps to the maximum value.' },
						{ keys: ['page up'], description: 'Increases the value by a larger increment (native browser behavior).' },
						{ keys: ['page down'], description: 'Decreases the value by a larger increment (native browser behavior).' },
					]} />
				</div>
			),
		},
	],
	'code-block': [
		{
			heading: 'Accessibility',
			description: (
				<p>
					CodeBlock has no custom focus management for its own controls: the copy button is a native button, reachable with Tab and activated with Enter/Space, and (in <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>variant=&quot;example&quot;</code>) the Preview/Code switcher reuses ToggleGroup&apos;s own roving-tabindex behavior rather than reimplementing it. The read-only code panel only joins the tab order when its content actually overflows horizontally, so keyboard users can scroll clipped code into view. When <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>editable</code> is true, the textarea intercepts every Tab keypress — including Shift+Tab — to insert two spaces instead of moving focus, so there is currently no keyboard-only way to tab out of an editable code block.
				</p>
			),
		},
	],
	formula: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Formula renders fully static output with no interactive elements and no component-specific keyboard behavior at all. KaTeX&apos;s <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>output: &apos;htmlAndMathml&apos;</code> option builds two parallel trees — a visual HTML layout that KaTeX itself marks <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-hidden</code>, and a MathML tree with a full plain-TeX annotation fallback for assistive tech — so accessibility comes entirely from that library-generated markup, with no additional ARIA wiring layered on top.
				</p>
			),
		},
	],
	'code-editor': [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						CodeMirror gives the editable surface its own <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;textbox&quot;</code> and <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-multiline=&quot;true&quot;</code> by default, plus whatever <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label</code> is passed in. This wrapper repurposes Tab for indentation instead of leaving it as the standard way to move focus off the editor, so Escape is the intentional way out: it blurs the editor and returns focus to the surrounding page, avoiding a WCAG 2.1.2 keyboard trap. Everything else (arrow-key caret movement, selection, undo/redo) is CodeMirror&apos;s own default keymap, unmodified by this component.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['tab'], description: 'Indents the current line, or accepts the selected autocomplete suggestion if a completion popup is open.' },
						{ keys: ['escape'], description: 'Blurs the editor, returning focus to the surrounding page.' },
					]} />
				</div>
			),
		},
	],
	graph: [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						Graph uses roving tabindex over a listbox: the SVG root is a single Tab stop (<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;application&quot;</code>), and only the selected node (<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;option&quot;</code> inside a <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;listbox&quot;</code>) carries <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>tabIndex=0</code>, with every other node at <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>tabIndex=-1</code>. Node/edge dragging, panning, and mouse-wheel zoom are pointer-only, with no keyboard equivalent for dragging or panning specifically; a hidden <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-live=&quot;polite&quot;</code> status region announces the initial node/edge count and every selection change.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['tab'], description: 'Moves focus into the graph container.' },
						{ keys: ['right arrow'], description: 'Moves selection to the next node, wrapping from the last node to the first.' },
						{ keys: ['down arrow'], description: 'Moves selection to the next node, wrapping from the last node to the first.' },
						{ keys: ['left arrow'], description: 'Moves selection to the previous node, wrapping from the first node to the last.' },
						{ keys: ['up arrow'], description: 'Moves selection to the previous node, wrapping from the first node to the last.' },
						{ keys: ['enter'], description: 'Selects the focused node and fires onNodeSelect.' },
						{ keys: ['space'], description: 'Selects the focused node and fires onNodeSelect.' },
						{ keys: ['escape'], description: 'Clears the selection and returns focus to the graph container.' },
						{ keys: ['+'], description: 'Zooms in.' },
						{ keys: ['-'], description: 'Zooms out.' },
						{ keys: ['0'], description: 'Resets zoom and pan.' },
					]} />
				</div>
			),
		},
	],
	tilt: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Tilt has no focus model of its own: the transform is driven entirely by <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>onMouseMove</code>/<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>onMouseLeave</code> on a plain wrapper div with no role or keyboard handling, so keyboard and touch users never trigger it, which is acceptable since the tilt is purely decorative and conveys no information. The component does <strong>not</strong> read <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>prefers-reduced-motion</code> internally — there is no media-query check anywhere in its source — so a consumer who wants to respect that preference must either skip rendering the <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>Tilt</code> wrapper or pass <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>max={0}</code> themselves.
				</p>
			),
		},
	],
	'theme-toggle': [
		{
			heading: 'Accessibility',
			description: (
				<p>
					ThemeToggle is a native <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;button type=&quot;button&quot;&gt;</code> with no custom focus handling, so it&apos;s reachable via Tab and activatable with Enter or Space with no extra wiring. It has no <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-pressed</code>: instead its <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label</code> always describes the action the next click performs (&quot;Switch to light mode&quot; / &quot;Switch to dark mode&quot;) rather than the current state, so the resulting theme is announced by what the control will do next; the sun/moon icon is <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-hidden</code> and carries no accessible information of its own.
				</p>
			),
		},
	],
	message: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>Message</code> itself is a non-interactive layout wrapper with no focus model. Its only focusable parts are <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>MessageReaction</code> chips, each rendered as a real <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;a&gt;</code> (when <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>href</code> is set) or <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;button type=&quot;button&quot;&gt;</code>, so each is an independent Tab stop in normal DOM order — reachable and activatable with native semantics (Enter for both, Space for buttons) — rather than a roving-tabindex composite, so no arrow-key navigation is implied between chips. The surrounding <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>MessageReactions</code> cluster is <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;group&quot;</code> with an <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label</code> (default &quot;Reactions&quot;), and the &quot;including yours&quot; active state is always backed by a computed <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label</code>, border, fill, and checkmark icon, never color alone.
				</p>
			),
		},
	],
	attachment: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>Attachment</code> has no custom focus management: its primary control is a real <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;a href&gt;</code> when <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>href</code> is set, or a real <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;button type=&quot;button&quot;&gt;</code> otherwise, so it&apos;s never left keyboard-unreachable just because no URL was given. When <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>onRemove</code> is supplied, the remove button is a second, independent Tab stop as a sibling of the primary control (never nested inside it), each with its own native activation and visible focus ring — no roving tabindex, no custom key handling. The thumbnail image, when shown, is <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>alt=&quot;&quot;</code> since it&apos;s redundant with the adjacent filename text, and <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>AttachmentGroup</code> renders a native <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;ul&gt;</code>/<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;li&gt;</code> list so assistive tech announces the attached-file count.
				</p>
			),
		},
	],
	toast: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Toast has no special focus management: it never moves focus or traps it. Each card renders with <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;status&quot;</code> and <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-live=&quot;polite&quot;</code> by default (<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;alert&quot;</code> and <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-live=&quot;assertive&quot;</code> for the danger variant) plus <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-atomic=&quot;true&quot;</code>, so screen readers announce it as soon as it mounts. The dismiss button and the optional action button sit in normal document tab order and are reached and activated with Tab and Enter/Space like any other button; there is no Escape-to-dismiss shortcut, dismissal is click/activation-driven only.
				</p>
			),
		},
	],
	collapsible: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Collapsible has no composite keyboard handling: the trigger is a single native button element reached and left via normal Tab order, so Enter and Space toggle it exactly the same way they would any other button, with no arrow-key or roving-tabindex behavior to document. The trigger carries <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-expanded</code> reflecting the open state, and the content panel carries <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;region&quot;</code> plus <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-hidden</code> (true when closed, false when open); the panel is never unmounted and never gets the native <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>hidden</code> attribute, it collapses to zero height via a CSS grid-height transition instead.
				</p>
			),
		},
	],
	accordion: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Accordion uses native tab order, not roving tabindex: every AccordionTrigger is its own native button and its own Tab stop, so Tab and Shift+Tab step through each trigger in document order and Enter/Space toggle whichever trigger is currently focused. Each trigger sets <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-expanded</code> to reflect its own item&apos;s open state, and each AccordionContent panel carries <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;region&quot;</code> plus <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-hidden</code> (true when closed, false when open); panels are never unmounted and never receive the native <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>hidden</code> attribute, they collapse to zero height via a CSS grid-height transition instead.
				</p>
			),
		},
	],
	tabs: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Tabs uses native tab order, not roving tabindex or arrow-key navigation: each TabsTrigger is an independently focusable button, so Tab and Shift+Tab move through every trigger in document order and Enter/Space activate whichever trigger is currently focused. TabsList carries <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;tablist&quot;</code>, each trigger carries <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;tab&quot;</code> with <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-selected</code> and <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-controls</code> pointing at its panel, and each TabsContent carries <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;tabpanel&quot;</code> with <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-labelledby</code> pointing back to its trigger; the inactive panel is unmounted entirely rather than merely hidden.
				</p>
			),
		},
	],
	'menu-bar': [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						MenuBarNav uses roving tabindex: only the active item (or the first enabled item, before anything is active) sits in the page&apos;s Tab order, so Tab moves into and out of the whole nav group in a single stop, the same mechanic as ToggleGroup. MenuBarNavItem sets <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-current=&quot;page&quot;</code> instead of <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-pressed</code> since this is a navigation landmark, not a toggle group, and MenuBarNavMore composes DropdownMenu unmodified, so its own overlay keyboard behavior (focus on open, Escape closes and returns focus to the trigger, arrow-key navigation, typeahead) applies once its dropdown is open.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['tab'], description: "Moves focus to the nav group's active item, or out to the next tabbable element if focus is already inside the group." },
						{ keys: ['shift', 'tab'], description: 'Moves focus out of the nav group to the previous tabbable element.' },
						{ keys: ['enter'], description: 'Activates the focused item, or opens the dropdown when focus is on MenuBarNavMore.' },
						{ keys: ['space'], description: 'Activates the focused item, or opens the dropdown when focus is on MenuBarNavMore.' },
						{ keys: ['right arrow'], description: 'Moves focus to the next item, wrapping from the last item to the first.' },
						{ keys: ['left arrow'], description: 'Moves focus to the previous item, wrapping from the first item to the last.' },
						{ keys: ['home'], description: 'Moves focus to the first enabled item.' },
						{ keys: ['end'], description: 'Moves focus to the last enabled item.' },
					]} />
				</div>
			),
		},
	],
	breadcrumb: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Breadcrumb has no composite keyboard handling: it renders a row of native links (or, for an item with an onClick handler, a native button) reached and left via normal Tab order, with no arrow-key navigation between crumbs. The list is a nav element labeled <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label=&quot;breadcrumb&quot;</code> wrapping an <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>ol</code>, the current page renders as a plain span with <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-current=&quot;page&quot;</code> rather than a link, and separators carry <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-hidden=&quot;true&quot;</code> so assistive technology skips over them.
				</p>
			),
		},
	],
	'table-of-contents': [
		{
			heading: 'Accessibility',
			description: (
				<p>
					TableOfContents has no composite keyboard handling: it renders a list of native anchor links reached and left via normal Tab order, with no arrow-key navigation between entries. It is a nav element labeled <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label=&quot;Table of contents&quot;</code>, and the section currently in view is communicated both visually (bold text) and via <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-current=&quot;location&quot;</code> on its link, not by color alone. Links are real <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>href=&quot;#...&quot;</code> targets, so they stay usable even if JavaScript fails to intercept the click.
				</p>
			),
		},
	],
	tree: [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						Tree does not use single-stop roving tabindex: every visible, enabled, collapsible TreeItem carries its own tabIndex of 0, so Tab and Shift+Tab step through each visible item individually in document order, the same way arrow keys do, rather than entering and exiting the whole tree in one stop. An item with <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>collapsible</code> set to false is excluded entirely: its tabIndex is -1, it is never registered with the tree, and arrow keys/Home/End skip over it. The root carries <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;tree&quot;</code>, each item carries <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;treeitem&quot;</code> with <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-expanded</code> on branches and <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-disabled</code> when disabled, and each children container carries <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;group&quot;</code>.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['down arrow'], description: 'Moves focus to the next visible item, wrapping from the last item to the first.' },
						{ keys: ['up arrow'], description: 'Moves focus to the previous visible item, wrapping from the first item to the last.' },
						{ keys: ['right arrow'], description: 'Expands a closed branch; if already open, moves focus to its first child.' },
						{ keys: ['left arrow'], description: 'Collapses an open branch; if already closed, moves focus to the parent item.' },
						{ keys: ['home'], description: 'Moves focus to the first visible item.' },
						{ keys: ['end'], description: 'Moves focus to the last visible item.' },
						{ keys: ['enter'], description: 'Toggles a branch open or closed.' },
						{ keys: ['space'], description: 'Toggles a branch open or closed.' },
						{ keys: ['tab'], description: 'Moves focus to the next visible, enabled item in document order.' },
						{ keys: ['shift', 'tab'], description: 'Moves focus to the previous visible, enabled item in document order.' },
					]} />
				</div>
			),
		},
	],
	'command-palette': [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						CommandPalette is a modal dialog (<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;dialog&quot;</code>, <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-modal=&quot;true&quot;</code>): focus moves to the search input the instant it opens, and Tab/Shift+Tab are intercepted to trap focus inside the dialog. Command items are plain <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;option&quot;</code> elements rather than real tab stops, so the search input is typically the only focusable element inside the trap; the &quot;active&quot; item is instead tracked virtually via <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-activedescendant</code> on the input. Escape closes the palette and returns focus to whatever triggered it.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['down arrow'], description: 'Moves the active item to the next visible, enabled option, wrapping from the last to the first.' },
						{ keys: ['up arrow'], description: 'Moves the active item to the previous visible, enabled option, wrapping from the first to the last.' },
						{ keys: ['home'], description: 'Moves the active item to the first visible, enabled option.' },
						{ keys: ['end'], description: 'Moves the active item to the last visible, enabled option.' },
						{ keys: ['enter'], description: 'Activates the active item: calls its onSelect, then closes the palette.' },
						{ keys: ['escape'], description: 'Closes the palette and returns focus to the trigger element.' },
						{ keys: ['tab'], description: 'Cycles forward within the dialog; does not escape to the page behind it.' },
						{ keys: ['shift', 'tab'], description: 'Cycles backward within the dialog; does not escape to the page behind it.' },
					]} />
				</div>
			),
		},
	],
	'command-input': [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						CommandInput is a non-modal combobox, not a dialog: focus never leaves the text input. Opening the menu doesn&apos;t move focus anywhere — the active match is tracked virtually via <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-activedescendant</code> on the <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;combobox&quot;</code> input, which also carries <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-expanded</code> and <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-controls</code> pointing at the <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;listbox&quot;</code> menu. There is no focus trap.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['down arrow'], description: 'Moves to the next matching command, wrapping from the last to the first.' },
						{ keys: ['up arrow'], description: 'Moves to the previous matching command, wrapping from the first to the last.' },
						{ keys: ['home'], description: 'Jumps to the first matching command.' },
						{ keys: ['end'], description: 'Jumps to the last matching command.' },
						{ keys: ['tab'], description: "Completes the active command's full name into the input and keeps the menu open, without running it; when nothing is active, Tab behaves natively and closes the menu." },
						{ keys: ['enter'], description: 'Runs the active command: calls onCommand, clears the input, and closes the menu.' },
						{ keys: ['escape'], description: 'Closes the menu; focus stays in the input.' },
					]} />
				</div>
			),
		},
	],
	'date-picker': [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						DatePicker&apos;s popup is a non-modal dialog (<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;dialog&quot;</code>, no <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-modal</code>): focus moves into the calendar grid (or straight to the Hours segment for a time-only picker) on open, but is never trapped — Tab either redirects focus (into the time row, for a date-and-time picker) or closes the popup and moves on natively, the same as Escape. The calendar grid uses roving tabindex: exactly one day button is a tab stop at a time, and arrow keys move that roving focus across month boundaries automatically. Time segments (Hours/Minutes/Seconds/AM-PM) deliberately break from roving tabindex — each is its own independent tab stop (<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;spinbutton&quot;</code>) and Arrow Up/Down change its value immediately rather than just moving focus, matching how a native time input behaves.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['arrow left'], description: 'Moves the focused day back one day, crossing into the previous month if needed.' },
						{ keys: ['arrow right'], description: 'Moves the focused day forward one day, crossing into the next month if needed.' },
						{ keys: ['arrow up'], description: 'Moves the focused day back one week.' },
						{ keys: ['arrow down'], description: 'Moves the focused day forward one week.' },
						{ keys: ['home'], description: "Jumps to the current week's Sunday." },
						{ keys: ['end'], description: "Jumps to the current week's Saturday." },
						{ keys: ['page up'], description: 'Navigates to the previous month.' },
						{ keys: ['page down'], description: 'Navigates to the next month.' },
						{ keys: ['enter'], description: 'Selects the focused day; closes the popup for a date-only picker, or advances to the time row for a date-and-time picker.' },
						{ keys: ['escape'], description: 'Closes whatever popup is open (calendar, time row, or time wheel) and returns focus to the button that opened it.' },
						{ keys: ['tab'], description: 'Closes the popup natively when there is no time row after the grid, or moves focus onward into the time segments for a date-and-time picker.' },
					]} />
				</div>
			),
		},
	],
	table: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Table has no component-specific keyboard behavior: every interactive piece is a native element in plain document order, with no roving tabindex and nothing to trap or escape. A sortable <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>TableHeader</code> wraps its label in a real button, so Tab reaches it like any other button and Enter/Space triggers the browser&apos;s own activation to cycle the sort; the header cell itself carries <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-sort</code> (ascending/descending/none) reflecting the current state. Non-sortable headers and body cells are plain header/data cells with no additional roles.
				</p>
			),
		},
	],
	'data-table': [
		{
			heading: 'Accessibility',
			description: (
				<p>
					DataTable adds no custom keyboard handling beyond the native elements it&apos;s built from: sortable column buttons (<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-sort</code>), header/row checkboxes, and the Prev/Next or numbered buttons rendered by the internal Paginator all sit in plain document tab order, with no roving tabindex or arrow-key navigation anywhere in the table. The header checkbox reflects a partial selection through the DOM <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>indeterminate</code> property, each row checkbox has an <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label</code> naming its row, and the numbered Paginator variant marks the current page with <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-current=&quot;page&quot;</code>. Disabled Prev/Next buttons use the native <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>disabled</code> attribute, so assistive tech skips them automatically.
				</p>
			),
		},
	],
	form: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Form is a layout primitive, not an interactive widget: it has no keyboard handling of its own. Focus order and activation come entirely from the native elements it composes — a plain form, a fieldset/legend pairing in FormSection, and a label with htmlFor in FormLabel. The only ARIA usage is FormMessage&apos;s <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;alert&quot;</code>, which announces a validation message to screen readers as soon as it renders (it renders nothing when there&apos;s no error). Consumers are responsible for pairing each FormLabel&apos;s <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>htmlFor</code> with its control&apos;s <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>id</code>, adding <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-required</code>/<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>required</code> to required inputs (the visual asterisk is <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-hidden</code>), and linking FormDescription via <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-describedby</code> so hint text is announced too.
				</p>
			),
		},
	],
	questionnaire: [
		{
			heading: 'Accessibility',
			description: (
				<p>
					Questionnaire has no keyboard handling of its own: each question type is a native or already-documented control (a native radio input per option via the peer pattern, or the Slider/Input/DatePicker components), so Tab, Space, and Enter behavior all comes from those controls. One real gap worth calling out: advancing to the next question never moves focus anywhere — the Next/Submit button isn&apos;t remounted between questions, so focus simply stays on it, and keyboard and screen reader users have to Tab forward manually to reach each newly rendered control. Once a multi-step sequence completes, the answered question block is marked <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-hidden</code> and <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>inert</code>, removing it from focus and the accessibility tree so only the recap remains reachable.
				</p>
			),
		},
	],
	resizable: [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						ResizableHandle is a real focusable widget, not a mouse-only drag affordance: the visible knob carries <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;separator&quot;</code>, <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-orientation</code>, and <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-valuenow</code>/<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-valuemin</code>/<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-valuemax</code> reflecting the sized panel&apos;s current size and bounds, and it is the single tab stop per handle regardless of the larger pointer-only hit-area around it. There is no focus trap and nothing to Escape out of — it participates in normal document tab order like any other in-page control.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['right arrow'], description: 'Grows or shrinks the sized panel by 16px, following whichever side of the handle is sized (mirrors drag behavior). Down arrow does the same in a vertical layout.' },
						{ keys: ['left arrow'], description: 'The opposite-direction step from Right arrow. Up arrow does the same in a vertical layout.' },
						{ keys: ['shift', 'right arrow'], description: 'Same as Right/Down arrow, but with a larger 64px step.' },
						{ keys: ['home'], description: 'Jumps the sized panel straight to its minSize.' },
						{ keys: ['end'], description: "Jumps the sized panel straight to its maxSize; no-op if maxSize isn't set." },
					]} />
				</div>
			),
		},
	],
	'line-chart': [
		{
			heading: 'Accessibility',
			description: (
				<p>
					LineChart&apos;s SVG root is focusable through Recharts&apos; accessibility layer (enabled by default here): Tab moves focus onto the chart, then ArrowLeft/ArrowRight step through the x-axis&apos;s data points to move a shared tooltip between each line&apos;s dots, and Enter pins the active tooltip in place. The wrapping div carries <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;img&quot;</code> and <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label=&quot;Line chart&quot;</code> for its own accessible name. Hovering a point shows the same tooltip via the mouse; the legend renders static labels only and is not clickable to hide a line.
				</p>
			),
		},
	],
	'bar-chart': [
		{
			heading: 'Accessibility',
			description: (
				<p>
					BarChart shares the same Recharts accessibility layer as the other charts: Tab focuses the SVG, ArrowLeft/ArrowRight step a shared tooltip across each category&apos;s bar group, and Enter pins it. Unlike the other four charts here, BarChart doesn&apos;t wrap its container in <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;img&quot;</code>/<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label</code> — its accessible name instead comes from a <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>title</code> prop passed straight into Recharts, which renders it as the SVG&apos;s own <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>&lt;title&gt;</code> element (&quot;Bar chart&quot;). Hovering or keyboard-focusing a category also slightly darkens its bars; the legend is static, not clickable.
				</p>
			),
		},
	],
	'area-chart': [
		{
			heading: 'Accessibility',
			description: (
				<p>
					AreaChart behaves like LineChart: the SVG root is Tab-focusable, ArrowLeft/ArrowRight step a shared tooltip across the x-axis, and Enter pins it; the wrapping div carries <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;img&quot;</code> and <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label=&quot;Area chart&quot;</code>. Because it supports <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>stacked</code>, the stepped tooltip lists every series&apos; value at that x-axis index at once, not just the one nearest the pointer; the legend renders static labels only.
				</p>
			),
		},
	],
	'donut-chart': [
		{
			heading: 'Accessibility',
			description: (
				<p>
					DonutChart&apos;s SVG root is Tab-focusable, and ArrowLeft/ArrowRight step Recharts&apos; shared tooltip between slices, Enter pins it; the wrapping div carries <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;img&quot;</code> and <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label=&quot;Donut chart&quot;</code>. The enlarged-slice hover effect, however, is driven by this component&apos;s own <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>onMouseEnter</code>/<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>onMouseLeave</code> state rather than Recharts&apos; keyboard-driven active index, so keyboard users get the stepped tooltip but not the enlarged slice. The legend renders static labels only, not a click-to-toggle control.
				</p>
			),
		},
	],
	'radar-chart': [
		{
			heading: 'Accessibility',
			description: (
				<p>
					RadarChart uses the same accessibility layer as the rest of the polar chart family: Tab focuses the SVG, ArrowLeft/ArrowRight step a shared tooltip across the category (angle) axis, and Enter pins it; the wrapping div carries <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;img&quot;</code> and <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label=&quot;Radar chart&quot;</code>. Each series&apos; polygon differs by stroke/fill color and legend label, not color alone; the legend itself renders static labels only.
				</p>
			),
		},
	],
	mosaic: [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						Mosaic doesn&apos;t use roving tabindex. The grid container is <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;grid&quot;</code> <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label=&quot;Mosaic&quot;</code>, and each tile&apos;s repositioning affordance — a small drag-handle div carrying dnd-kit&apos;s own <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;button&quot;</code>, <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>tabIndex={0}</code>, and <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-roledescription=&quot;draggable&quot;</code> — sits in normal document tab order. Repositioning is fully keyboard-operable via dnd-kit&apos;s <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>KeyboardSensor</code>. Resizing by dragging a tile&apos;s edge is pointer/touch-only (those handles are <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-hidden</code>), but the same resize is available from the keyboard via the &quot;Resize&quot; corner button, which opens a picker of real, focusable buttons offering the same size choices.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['tab'], description: "Moves focus to a tile's drag handle, following normal document order." },
						{ keys: ['space'], description: 'Picks up the focused tile to start a keyboard-driven move; press again to drop it at the current cell.' },
						{ keys: ['enter'], description: 'Picks up the focused tile to start a keyboard-driven move; press again to drop it at the current cell.' },
						{ keys: ['up arrow'], description: 'While picked up, moves the tile toward the row above.' },
						{ keys: ['down arrow'], description: 'While picked up, moves the tile toward the row below.' },
						{ keys: ['left arrow'], description: 'While picked up, moves the tile toward the previous column.' },
						{ keys: ['right arrow'], description: 'While picked up, moves the tile toward the next column.' },
						{ keys: ['escape'], description: 'Cancels an in-progress keyboard move, returning the tile to its original cell.' },
					]} />
				</div>
			),
		},
	],
	kanban: [
		{
			heading: 'Accessibility',
			description: (
				<div className='flex flex-col gap-4'>
					<p>
						KanbanBoard uses dnd-kit&apos;s <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>KeyboardSensor</code> (<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>sortableKeyboardCoordinates</code>) alongside its pointer sensor, so every card is genuinely keyboard-draggable: KanbanCard&apos;s root element is the same one carrying <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>useSortable</code>&apos;s <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>attributes</code>/<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>listeners</code>, giving it <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>role=&quot;button&quot;</code>, <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>tabIndex={0}</code>, and an <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>aria-label</code> instructing how to start a drag — there&apos;s no separate grip handle and no roving tabindex; cards just sit in normal tab order. When <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>renderCardDetails</code> is provided, viewing details moves to an independently focusable info button (Space/Enter on the card itself stay claimed for dragging), and the details Modal it opens follows the standard focus-trap / Escape-closes / return-focus-to-trigger overlay contract.
					</p>
					<KeyboardShortcutsTable rows={[
						{ keys: ['tab'], description: 'Moves focus to the next card (or its info button, if present), following normal document order.' },
						{ keys: ['space'], description: 'Starts dragging the focused card; press again to drop it at its current position.' },
						{ keys: ['enter'], description: 'Starts dragging the focused card; press again to drop it at its current position.' },
						{ keys: ['up arrow'], description: 'While dragging, moves the card up within or across columns.' },
						{ keys: ['down arrow'], description: 'While dragging, moves the card down within or across columns.' },
						{ keys: ['left arrow'], description: 'While dragging, moves the card toward the previous column.' },
						{ keys: ['right arrow'], description: 'While dragging, moves the card toward the next column.' },
						{ keys: ['escape'], description: 'Cancels an in-progress drag, returning the card to its original position.' },
					]} />
				</div>
			),
		},
	],
};
