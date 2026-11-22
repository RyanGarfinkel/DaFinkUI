import Accordion, { AccordionItem, AccordionTrigger, AccordionContent } from './components/Accordion/Accordion';
import Collapsible, { CollapsibleTrigger, CollapsibleContent } from './components/Collapsible/Collapsible';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from './components/Table/Table';
import { ToggleGroup, ToggleGroupItem } from './components/ToggleGroup/ToggleGroup';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/Tabs/Tabs';
import { RadioGroup, RadioItem } from './components/Radio/Radio';
import Breadcrumb from './components/Breadcrumb/Breadcrumb';
import { ChatMessageRow } from './blocks/AiChat/MessageRow';
import { Combobox } from './components/Combobox/Combobox';
import Tree, { TreeItem } from './components/Tree/Tree';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Heatmap } from './components/Heatmap/Heatmap';
import Progress from './components/Progress/Progress';
import Textarea from './components/Textarea/Textarea';
import Checkbox from './components/Checkbox/Checkbox';
import { ChatList } from './blocks/AiChat/ChatList';
import { Composer } from './blocks/AiChat/Composer';
import { Select } from './components/Select/Select';
import { expectNoViolations } from '../test/axe';
import Slider from './components/Slider/Slider';
import Switch from './components/Switch/Switch';
import Button from './components/Button/Button';
import Avatar from './components/Avatar/Avatar';
import { render } from '@testing-library/react';
import Alert from './components/Alert/Alert';
import Badge from './components/Badge/Badge';
import Input from './components/Input/Input';
import type { ReactElement } from 'react';
import { describe, it } from 'vitest';

const noop = () => {};

const OPTIONS = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }];

const COMPONENTS: Record<string, ReactElement> = {
	'Button':      <Button>Save</Button>,
	'Button icon': <Button size='icon' aria-label='Close'>x</Button>,
	'Input':       <Input label='Email' hint='We never share it.' />,
	'Input error': <Input label='Email' error='Enter a valid email.' />,
	'Textarea':    <Textarea label='Message' />,
	'Checkbox':    <Checkbox aria-label='Accept terms' />,
	'Switch':      <Switch checked={false} onCheckedChange={noop} aria-label='Notifications' />,
	'Slider':      <Slider value={40} onValueChange={noop} label='Volume' />,
	'Select':      <Select label='Letter' options={OPTIONS} value='a' onChange={noop} />,
	'Combobox':    <Combobox label='Letter' options={OPTIONS} onChange={noop} />,
	'Alert':       <Alert variant='danger' title='Heads up'>Something needs attention.</Alert>,
	'Badge':       <Badge variant='success'>Active</Badge>,
	'Progress':    <Progress value={50} aria-label='Upload' />,
	'Avatar':      <Avatar name='Ada Lovelace' />,
	'Heatmap':     <Heatmap data={[[1, 2], [3, null]]} rowLabels={['Mon', 'Tue']} columnLabels={['AM', 'PM']} label='Activity' />,
	'Breadcrumb':  <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Docs', href: '/docs' }, { label: 'Page' }]} />,
	'Radio group': (
		<RadioGroup name='letters' value='a' onValueChange={noop}>
			<RadioItem value='a' label='Option A' />
			<RadioItem value='b' label='Option B' hint='A hint' />
		</RadioGroup>
	),
	'Toggle group': (
		<ToggleGroup type='single' value='a' onValueChange={noop} aria-label='View'>
			<ToggleGroupItem value='a'>List</ToggleGroupItem>
			<ToggleGroupItem value='b'>Grid</ToggleGroupItem>
		</ToggleGroup>
	),
	'Tabs': (
		<Tabs value='one' onValueChange={noop}>
			<TabsList aria-label='Sections'>
				<TabsTrigger value='one'>One</TabsTrigger>
				<TabsTrigger value='two'>Two</TabsTrigger>
			</TabsList>
			<TabsContent value='one'>First</TabsContent>
			<TabsContent value='two'>Second</TabsContent>
		</Tabs>
	),
	'Accordion': (
		<Accordion type='single' defaultValue='a'>
			<AccordionItem value='a'>
				<AccordionTrigger>Question</AccordionTrigger>
				<AccordionContent>Answer</AccordionContent>
			</AccordionItem>
		</Accordion>
	),
	'Collapsible': (
		<Collapsible defaultOpen>
			<CollapsibleTrigger>Details</CollapsibleTrigger>
			<CollapsibleContent>More</CollapsibleContent>
		</Collapsible>
	),
	'Table': (
		<Table>
			<TableHead>
				<TableRow header>
					<TableHeader>Name</TableHeader>
					<TableHeader>Role</TableHeader>
				</TableRow>
			</TableHead>
			<TableBody>
				<TableRow>
					<TableCell>Alice</TableCell>
					<TableCell>Engineer</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	),
	'Tree': (
		<Tree aria-label='Files'>
			<TreeItem label='src' defaultOpen>
				<TreeItem label='index.ts' />
			</TreeItem>
		</Tree>
	),
};

const AICHAT: Record<string, ReactElement> = {
	'AiChat Composer': (
		<Composer
			draft='Hello'
			onDraftChange={noop}
			onSubmit={noop}
			isGenerating={false}
			onStop={noop}
			attachedFiles={[]}
			onAttach={noop}
			commands={[]}
			onCommand={noop}
			placeholder='Message'
			inputLabel='Message'
			sendLabel='Send message'
		/>
	),
	'AiChat ChatList': (
		<Sidebar>
			<ChatList
				chats={[{ id: '1', title: 'Budget review', messages: [], threadRefs: [] }]}
				status='ready'
				activeId='1'
				editingId={null}
				onEditingChange={noop}
				onSelect={noop}
				onRename={noop}
				onDelete={noop}
			/>
		</Sidebar>
	),
	'AiChat messages': (
		<div role='log' aria-label='Conversation'>
			<ChatMessageRow message={{ id: 1, kind: 'message', sender: 'user', text: 'Plan the launch' }} onStreamComplete={noop} onQuestionnaireAnswer={noop} />
			<ChatMessageRow message={{ id: 2, kind: 'message', sender: 'ai', text: 'Here is a plan.' }} onStreamComplete={noop} onQuestionnaireAnswer={noop} />
		</div>
	),
};

describe('accessibility (axe)', () =>
{
	it.each(Object.entries({ ...COMPONENTS, ...AICHAT }))('%s has no violations', async (_name, element) =>
	{
		const { container } = render(element);

		await expectNoViolations(container);
	});
});
