import SidePanel, { SidePanelHeader, SidePanelTitle, SidePanelContent, SidePanelFooter, SidePanelClose } from '@/src/components/SidePanel/SidePanel';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselDots } from '@/src/components/Carousel/Carousel';
import { Sidebar, SidebarHeader, SidebarFooter, SidebarSection, SidebarLink, SidebarDivider } from '@/src/components/Sidebar/Sidebar';
import Drawer, { DrawerHeader, DrawerTitle, DrawerContent, DrawerFooter, DrawerClose } from '@/src/components/Drawer/Drawer';
import Modal, { ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose } from '@/src/components/Modal/Modal';
import Accordion, { AccordionContent, AccordionItem, AccordionTrigger } from '@/src/components/Accordion/Accordion';
import Collapsible, { CollapsibleTrigger, CollapsibleContent } from '@/src/components/Collapsible/Collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/Table/Table';
import { CommandPalette, CommandGroup, CommandItem } from '@/src/components/CommandPalette/CommandPalette';
import { AreaChart, BarChart, DonutChart, LineChart, RadarChart } from '@/src/components/Charts/Charts';
import { FormDescription, FormField, FormLabel, FormSection } from '@/src/components/Form/Form';
import { Message, MessageReactions, MessageReaction } from '@/src/components/Message/Message';
import { Skeleton, SkeletonCard, SkeletonImage } from '@/src/components/Skeleton/Skeleton';
import ToggleGroup, { ToggleGroupItem } from '@/src/components/ToggleGroup/ToggleGroup';
import { Card, CardContent, CardHeader, CardFooter } from '@/src/components/Card/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/Tabs/Tabs';
import { Attachment, AttachmentGroup } from '@/src/components/Attachment/Attachment';
import { TopNav, TopNavBrand, TopNavActions } from '@/src/components/TopNav/TopNav';
import FunctionPlotter from '@/src/components/FunctionPlotter/FunctionPlotter';
import WorkflowBuilder from '@/src/components/WorkflowBuilder/WorkflowBuilder';
import { Timeline, TimelineItem } from '@/src/components/Timeline/Timeline';
import { ToastProvider, useToast } from '@/src/components/Toast/Toast';
import DropdownMenu from '@/src/components/DropdownMenu/DropdownMenu';
import Avatar, { AvatarGroup } from '@/src/components/Avatar/Avatar';
import Reveal, { RevealGroup } from '@/src/components/Reveal/Reveal';
import { RadioGroup, RadioItem } from '@/src/components/Radio/Radio';
import Mosaic, { MosaicTile } from '@/src/components/Mosaic/Mosaic';
import { ScrollFade } from '@/src/components/ScrollFade/ScrollFade';
import { DatePicker } from '@/src/components/DatePicker/DatePicker';
import TextShimmer from '@/src/components/TextShimmer/TextShimmer';
import AudioPlayer from '@/src/components/AudioPlayer/AudioPlayer';
import { CodeBlock } from '@/src/components/CodeBlock/CodeBlock';
import Typewriter from '@/src/components/Typewriter/Typewriter';
import Breadcrumb from '@/src/components/Breadcrumb/Breadcrumb';
import PopoverComponent from '@/src/components/Popover/Popover';
import TooltipComponent from '@/src/components/Tooltip/Tooltip';
import { Combobox } from '@/src/components/Combobox/Combobox';
import { Progress } from '@/src/components/Progress/Progress';
import { Checkbox } from '@/src/components/Checkbox/Checkbox';
import DataTable from '@/src/components/DataTable/DataTable';
import { KanbanBoard } from '@/src/components/Kanban/Kanban';
import Tree, { TreeItem } from '@/src/components/Tree/Tree';
import { Spinner } from '@/src/components/Spinner/Spinner';
import Textarea from '@/src/components/Textarea/Textarea';
import OTPInput from '@/src/components/OTPInput/OTPInput';
import { Select } from '@/src/components/Select/Select';
import { Canvas } from '@/src/components/Canvas/Canvas';
import CountUp from '@/src/components/CountUp/CountUp';
import { Alert } from '@/src/components/Alert/Alert';
import { Badge } from '@/src/components/Badge/Badge';
import Switch from '@/src/components/Switch/Switch';
import Slider from '@/src/components/Slider/Slider';
import Button from '@/src/components/Button/Button';
import { useEffect, useRef, useState } from 'react';
import Graph from '@/src/components/Graph/Graph';
import Input from '@/src/components/Input/Input';
import Tilt from '@/src/components/Tilt/Tilt';

/** Every component in the registry, bound as a free variable a hand-written JSX snippet can
 * reference directly — this is what the live preview evaluates arbitrary editor code against. */
export const PLAYGROUND_SCOPE: Record<string, unknown> = {
	Drawer, DrawerHeader, DrawerTitle, DrawerContent, DrawerFooter, DrawerClose,
	SidePanel, SidePanelHeader, SidePanelTitle, SidePanelContent, SidePanelFooter, SidePanelClose,
	Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselDots,
	Sidebar, SidebarHeader, SidebarFooter, SidebarSection, SidebarLink, SidebarDivider,
	Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose,
	Accordion, AccordionContent, AccordionItem, AccordionTrigger,
	Collapsible, CollapsibleTrigger, CollapsibleContent,
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
	CommandPalette, CommandGroup, CommandItem,
	DataTable,
	FormDescription, FormField, FormLabel, FormSection,
	Message, MessageReactions, MessageReaction,
	AreaChart, BarChart, DonutChart, LineChart, RadarChart,
	Mosaic, MosaicTile,
	Skeleton, SkeletonCard, SkeletonImage,
	ToggleGroup, ToggleGroupItem,
	Tabs, TabsContent, TabsList, TabsTrigger,
	Graph,
	Attachment, AttachmentGroup,
	TopNav, TopNavBrand, TopNavActions,
	FunctionPlotter,
	WorkflowBuilder,
	Timeline, TimelineItem,
	Card, CardContent, CardHeader, CardFooter,
	ToastProvider, useToast,
	DropdownMenu,
	Avatar, AvatarGroup,
	Reveal, RevealGroup,
	RadioGroup, RadioItem,
	ScrollFade,
	DatePicker,
	TextShimmer,
	AudioPlayer,
	CodeBlock,
	Typewriter,
	Breadcrumb,
	Combobox,
	Progress,
	Checkbox,
	KanbanBoard,
	Tree, TreeItem,
	Spinner,
	Textarea,
	OTPInput,
	Select,
	Canvas,
	Popover: PopoverComponent,
	Tooltip: TooltipComponent,
	CountUp,
	Alert,
	Badge,
	Switch,
	Slider,
	Button,
	Input,
	Tilt,
	useState,
	useEffect,
	useRef,
};

const HOOK_IMPORTS: Record<string, string> = {
	useState: 'useState',
	useEffect: 'useEffect',
	useRef: 'useRef',
};

/** Scans `code` for every registry component referenced as a JSX tag (or hook call), and
 * returns the import lines needed to make that code runnable — pulled straight out of each
 * matched component's own `usage` field so they never drift from the real install path. */
export const deriveImports = (
	code: string,
	registryEntries: { name: string; usage: string }[]
): string[] => {
	const importSet = new Set<string>();

	const hookNames = Object.keys(HOOK_IMPORTS).filter((hook) => new RegExp(`\\b${hook}\\s*\\(`).test(code));
	if (hookNames.length > 0) importSet.add(`import { ${hookNames.join(', ')} } from 'react';`);

	registryEntries.forEach((entry) => {
		const tagPattern = new RegExp(`<${entry.name}[\\s/>]`);
		if (!tagPattern.test(code)) return;

		const importLines = entry.usage.match(/^import .+;$/gm) ?? [];
		importLines.forEach((line) => importSet.add(line));
	});

	return [...importSet].sort((a, b) => b.length - a.length);
};
