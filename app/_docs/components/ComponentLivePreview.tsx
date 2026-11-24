'use client';

import { CodeBlockPreview, FormulaPreview, CardPreview, TablePreview, SkeletonPreview, TypographyPreview, BadgePreview, AlertPreview, ProgressPreview, SpinnerPreview, HeatmapPreview,TreePreview, TimelinePreview, CarouselPreview, AvatarPreview, AttachmentPreview, MessagePreview, GraphPreview, AudioPlayerPreview, TiltPreview, SeparatorPreview, ChartsPreview, LineChartPreview, BarChartPreview, AreaChartPreview, DonutChartPreview, RadarChartPreview } from './previews/Display';
import { ButtonPreview, InputPreview, RadioPreview, SwitchPreview, SliderPreview, ToggleGroupPreview, CheckboxPreview, ColorPickerPreview, DatePickerPreview } from './previews/Inputs';
import { CollapsiblePreview, AccordionPreview, ToolCallTracePreview, CommandPalettePreview, TooltipPreview, PopoverPreview, MenuPreview, ContextMenuPreview } from './previews/Overlay';
import { OTPInputPreview, ComboboxPreview, CommandInputPreview, DataTablePreview, ModalPreview, DrawerPreview, SidePanelPreview, SelectDemo, FormDemo, ToastDemo } from './Demos';
import { TabsPreview, MenuBarPreview, TableOfContentsPreview, BreadcrumbPreview, ResizablePreview } from './previews/Layout';
import { SlideCanvasPreview, CodeEditorPreview, DocEditorPreview } from './previews/Editors';
import { SheetEditorDemo } from '@/app/_docs/components/examples/SheetEditorDemo';
import { DeckEditorDemo } from '@/app/_docs/components/examples/DeckEditorDemo';
import FunctionPlotter from '@/src/components/FunctionPlotter/FunctionPlotter';
import WorkflowBuilder from '@/src/components/WorkflowBuilder/WorkflowBuilder';
import { MosaicPreview, KanbanBoardPreview } from './previews/DragDrop';
import ThemeToggle from '@/src/components/ThemeToggle/ThemeToggle';
import { PdfViewer } from '@/src/components/PdfViewer/PdfViewer';
import Textarea from '@/src/components/Textarea/Textarea';
import { QuestionnairePreview } from './previews/Forms';
import { Canvas } from '@/src/components/Canvas/Canvas';
import { SidebarPreview } from './previews/Navigation';
import { Link } from '@/src/components/Link/Link';

interface ComponentLivePreviewProps {
  slug: string;
}

export const ComponentLivePreview = ({ slug }: ComponentLivePreviewProps) => {
  switch (slug) {
    case 'button':
      return <ButtonPreview />;

    case 'input':
      return <InputPreview />;

    case 'otp-input':
      return <OTPInputPreview />;

    case 'textarea':
      return (
        <div className='w-full max-w-sm'>
          <Textarea label='Message' placeholder='Write your message here…' hint='Max 500 characters.' rows={4} />
        </div>
      );

    case 'radio':
      return <RadioPreview />;

    case 'switch':
      return <SwitchPreview />;

    case 'theme-toggle':
      return <ThemeToggle />;

    case 'slider':
      return <SliderPreview />;

    case 'toggle-group':
      return <ToggleGroupPreview />;

    case 'code-block':
      return <CodeBlockPreview />;

    case 'formula':
      return <FormulaPreview />;

    case 'code-editor':
      return <CodeEditorPreview />;

    case 'card':
      return <CardPreview />;

    case 'table':
      return <TablePreview />;

    case 'skeleton':
      return <SkeletonPreview />;

    case 'typography':
      return <TypographyPreview />;

    case 'form':
      return <FormDemo />;

    case 'questionnaire':
      return <QuestionnairePreview />;

    case 'collapsible':
      return <CollapsiblePreview />;

    case 'accordion':
      return <AccordionPreview />;

    case 'tool-call-trace':
      return <ToolCallTracePreview />;

    case 'tabs':
      return <TabsPreview />;

    case 'sidebar':
      return <SidebarPreview />;

    case 'menu-bar':
      return <MenuBarPreview />;

    case 'table-of-contents':
      return <TableOfContentsPreview />;

    case 'breadcrumb':
      return <BreadcrumbPreview />;

    case 'charts':
      return <ChartsPreview />;

    case 'line-chart':
      return <LineChartPreview />;

    case 'bar-chart':
      return <BarChartPreview />;

    case 'area-chart':
      return <AreaChartPreview />;

    case 'donut-chart':
      return <DonutChartPreview />;

    case 'radar-chart':
      return <RadarChartPreview />;

    case 'mosaic':
      return <MosaicPreview />;

    case 'kanban':
      return <KanbanBoardPreview />;

    case 'timeline':
      return <TimelinePreview />;

    case 'canvas':
      return (
        <div className='w-full'>
          <Canvas height={320} />
        </div>
      );

    case 'badge':
      return <BadgePreview />;

    case 'select':
      return <SelectDemo />;

    case 'checkbox':
      return <CheckboxPreview />;

    case 'alert':
      return <AlertPreview />;

    case 'progress':
      return <ProgressPreview />;

    case 'spinner':
      return <SpinnerPreview />;

    case 'toast':
      return <ToastDemo />;

    case 'tree':
      return <TreePreview />;

    case 'carousel':
      return <CarouselPreview />;

    case 'function-plotter':
      return <FunctionPlotter initialEquations={['x^2 - 2', 'sin(x)', '0.5*x + 3']} layout='side' />;

    case 'command-palette':
      return <CommandPalettePreview />;

    case 'tooltip':
      return <TooltipPreview />;

    case 'popover':
      return <PopoverPreview />;

    case 'menu':
      return <MenuPreview />;

    case 'combobox':
      return <ComboboxPreview />;

    case 'command-input':
      return <CommandInputPreview />;

    case 'date-picker':
      return <DatePickerPreview />;

    case 'data-table':
      return <DataTablePreview />;

    case 'avatar':
      return <AvatarPreview />;

    case 'attachment':
      return <AttachmentPreview />;

    case 'message':
      return <MessagePreview />;

    case 'modal':
      return <ModalPreview />;

    case 'drawer':
      return <DrawerPreview />;

    case 'side-panel':
      return <SidePanelPreview />;

    case 'graph':
      return <GraphPreview />;

    case 'audioplayer':
      return <AudioPlayerPreview />;

    case 'tilt':
      return <TiltPreview />;

    case 'separator':
      return <SeparatorPreview />;

    case 'workflow-builder':
      return (
        <div className='w-full'>
          <WorkflowBuilder height={420} />
        </div>
      );

    case 'resizable':
      return <ResizablePreview />;

    case 'link':
      return (
        <p className='text-sm text-text'>
          Read the <Link href='/components'>component docs</Link> to get started.
        </p>
      );

    case 'color-picker':
      return <ColorPickerPreview />;

    case 'slide-canvas':
      return <SlideCanvasPreview />;

    case 'context-menu':
      return <ContextMenuPreview />;

    case 'deck-editor':
      return <DeckEditorDemo />;

    case 'sheet-editor':
      return <SheetEditorDemo />;

    case 'heatmap':
      return <HeatmapPreview />;

    case 'icons':
      return <p className='text-sm text-text-muted'>Shared icons. Nothing renders on its own.</p>;

    case 'models':
      return <p className='text-sm text-text-muted'>Types only. Nothing renders.</p>;

    case 'pdfviewer':
      return <PdfViewer src='/sample.pdf' title='Quarterly Report' height='28rem' />;

    case 'doc-editor':
      return <DocEditorPreview />;

    default:
      return (
        <div className='text-sm text-text-muted'>
          No preview available for this component.
        </div>
      );
  }
};
