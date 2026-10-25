'use client';

import Modal, { ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose } from '../../components/Modal/Modal';
import { FileIcon, CloseIcon, FilesIcon, GitIcon, PlayIcon, SettingsIcon, TerminalIcon } from './icons';
import { Resizable, ResizablePanel, ResizableHandle } from '../../components/Resizable/Resizable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/Tabs/Tabs';
import { RunPanel, FILE_PLACEHOLDER, canRunScript } from './RunPanel';
import { fetchTree, fetchFile, fetchGitStatus } from './terminalApi';
import type { GitStatus, TerminalFile, TerminalNode } from './types';
import CodeEditor from '../../components/CodeEditor/CodeEditor';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import Tree, { TreeItem } from '../../components/Tree/Tree';
import Spinner from '../../components/Spinner/Spinner';
import Switch from '../../components/Switch/Switch';
import Button from '../../components/Button/Button';
import { useEffect, useRef, useState } from 'react';
import { useShell } from './useShell';
import { GitPanel } from './GitPanel';
import { Shell } from './Shell';

type LoadStatus = 'loading' | 'ready' | 'error';
type SidebarView = 'files' | 'git' | 'run';

const SIDEBAR_TITLES: Record<SidebarView, string> = { files: 'Explorer', git: 'Source control', run: 'Run' };

const fileName = (path: string) => path.split('/').pop() ?? path;

interface NodeListProps {
	nodes: TerminalNode[];
	activeId: string | null;
	onOpen: (id: string) => void;
}

const NodeList = ({ nodes, activeId, onOpen }: NodeListProps) => nodes.map((node) =>
{
	if(node.type === 'folder')
	{
		return (
			<TreeItem key={node.id} label={node.name} defaultOpen>
				<NodeList nodes={node.children ?? []} activeId={activeId} onOpen={onOpen} />
			</TreeItem>
		);
	}

	return (
		<TreeItem
			key={node.id}
			label={node.name}
			icon={<FileIcon />}
			className={activeId === node.id ? 'bg-surface-active' : ''}
			onSelect={() => onOpen(node.id)}
		/>
	);
});

export const Terminal = () => {
	const [tree, setTree] = useState<TerminalNode[]>([]);
	const [treeStatus, setTreeStatus] = useState<LoadStatus>('loading');
	const [git, setGit] = useState<GitStatus | null>(null);
	const [gitStatus, setGitStatus] = useState<LoadStatus>('loading');
	const [files, setFiles] = useState<Record<string, TerminalFile>>({});
	const [openIds, setOpenIds] = useState<string[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [loadingId, setLoadingId] = useState<string | null>(null);
	const [fileError, setFileError] = useState(false);
	const [view, setView] = useState<SidebarView>('files');
	const [shellOpen, setShellOpen] = useState(true);
	const [runScript, setRunScript] = useState('npm run dev');
	const [openOnRun, setOpenOnRun] = useState(true);
	const [clearOnRun, setClearOnRun] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const shell = useShell();
	const mountedRef = useRef(true);

	useEffect(() =>
	{
		mountedRef.current = true;
		let cancelled = false;

		fetchTree()
			.then((nodes) =>
			{
				if(cancelled) return;
				setTree(nodes);
				setTreeStatus('ready');
			})
			.catch(() =>
			{
				if(!cancelled) setTreeStatus('error');
			});

		fetchGitStatus()
			.then((status) =>
			{
				if(cancelled) return;
				setGit(status);
				setGitStatus('ready');
			})
			.catch(() =>
			{
				if(!cancelled) setGitStatus('error');
			});

		return () =>
		{
			cancelled = true;
			mountedRef.current = false;
		};
	}, []);

	const openFile = async (id: string) => {
		setFileError(false);
		setActiveId(id);
		setOpenIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
		if(files[id]) return;

		setLoadingId(id);
		try
		{
			const file = await fetchFile(id);
			if(mountedRef.current) setFiles((prev) => ({ ...prev, [id]: file }));
		}
		catch
		{
			if(mountedRef.current) setFileError(true);
		}
		finally
		{
			if(mountedRef.current) setLoadingId((current) => (current === id ? null : current));
		}
	};

	const closeFile = (id: string) => {
		const remaining = openIds.filter((openId) => openId !== id);
		setOpenIds(remaining);
		setFileError(false);
		if(activeId !== id) return;

		const closedIndex = openIds.indexOf(id);
		setActiveId(remaining[Math.min(closedIndex, remaining.length - 1)] ?? null);
	};

	const editFile = (id: string, content: string) => setFiles((prev) => ({ ...prev, [id]: { ...prev[id], content } }));

	const activeFile = activeId ? files[activeId] : undefined;
	const isLoadingActive = activeId !== null && loadingId === activeId;
	const changeCount = git?.changes.length ?? 0;
	const runnable = canRunScript(runScript, activeId, shell.running);

	const handleRun = () => {
		if(!runnable) return;
		if(openOnRun) setShellOpen(true);
		if(clearOnRun) shell.clear();
		shell.run(runScript.replaceAll(FILE_PLACEHOLDER, activeId ?? '').trim());
	};

	const activityButtonClass = (active: boolean) => (active ? 'bg-surface-active text-text' : 'text-text-muted');

	return (
		<div className='flex h-[600px] w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface'>
			<div className='flex min-h-0 flex-1'>
				<div className='flex w-11 shrink-0 flex-col items-center gap-1 border-r-[length:var(--border-width)] border-surface-border py-2'>
					<Button
						variant='ghost'
						size='icon'
						aria-label='Explorer'
						aria-pressed={view === 'files'}
						onClick={() => setView('files')}
						className={activityButtonClass(view === 'files')}
					>
						<FilesIcon />
					</Button>

					<Button
						variant='ghost'
						size='icon'
						aria-label={changeCount > 0 ? `Source control, ${changeCount} changes` : 'Source control'}
						aria-pressed={view === 'git'}
						onClick={() => setView('git')}
						className={activityButtonClass(view === 'git')}
					>
						<GitIcon />
					</Button>

					<Button
						variant='ghost'
						size='icon'
						aria-label='Run'
						aria-pressed={view === 'run'}
						onClick={() => setView('run')}
						className={activityButtonClass(view === 'run')}
					>
						<PlayIcon />
					</Button>

					<Button
						variant='ghost'
						size='icon'
						aria-label='Settings'
						onClick={() => setSettingsOpen(true)}
						className='mt-auto text-text-muted'
					>
						<SettingsIcon />
					</Button>
				</div>

				<Resizable direction='horizontal' className='min-h-0 min-w-0 flex-1'>
					<ResizablePanel defaultSize={240} minSize={160} maxSize={400} className='flex flex-col border-r-[length:var(--border-width)] border-surface-border'>
						<div className='flex h-10 shrink-0 items-center px-3 text-xs font-semibold uppercase tracking-wide text-text-muted'>
							{SIDEBAR_TITLES[view]}
						</div>

						<div className='min-h-0 flex-1 overflow-y-auto px-1 pb-2'>
							{view === 'git' && <GitPanel git={git} status={gitStatus} onOpen={openFile} />}

							{view === 'run' && (
								<RunPanel script={runScript} activeId={activeId} running={shell.running} onChange={setRunScript} onRun={handleRun} />
							)}

							{view === 'files' && treeStatus === 'loading' && (
								<div className='flex flex-col gap-2 p-2'>
									<Skeleton height='16px' width='70%' />
									<Skeleton height='16px' width='50%' />
									<Skeleton height='16px' width='60%' />
									<Skeleton height='16px' width='40%' />
								</div>
							)}

							{view === 'files' && treeStatus === 'error' && (
								<p role='alert' className='p-3 text-sm text-danger'>Couldn’t load files. Check your connection and refresh.</p>
							)}

							{view === 'files' && treeStatus === 'ready' && (
								<Tree>
									<NodeList nodes={tree} activeId={activeId} onOpen={openFile} />
								</Tree>
							)}
						</div>
					</ResizablePanel>

					<ResizableHandle aria-label='Resize sidebar' />

					<ResizablePanel className='flex min-w-0 flex-col'>
						<Resizable direction='vertical' className='min-h-0 flex-1'>
							<ResizablePanel className='flex flex-col'>
								{activeId === null ? (
									<div className='flex flex-1 flex-col items-center justify-center gap-1 p-6 text-center'>
										<p className='text-sm font-medium text-text'>No file open</p>
										<p className='text-sm text-text-muted'>Pick a file from the explorer to start editing.</p>
									</div>
								) : (
									<Tabs value={activeId} onValueChange={setActiveId} className='flex min-h-0 flex-1 flex-col'>
										<div className='flex shrink-0'>
											<TabsList className='min-w-0 flex-1 overflow-x-auto'>
												{openIds.map((id) => (
													<TabsTrigger
														key={id}
														value={id}
														className='group inline-flex shrink-0 items-center gap-2'
														onKeyDown={(e) =>
														{
															if(e.key !== 'Delete') return;
															e.preventDefault();
															closeFile(id);
														}}
													>
														{fileName(id)}
														<span
															aria-hidden='true'
															onClick={(e) =>
															{
																e.stopPropagation();
																closeFile(id);
															}}
															className='flex h-4 w-4 items-center justify-center rounded-[var(--radius)] opacity-0 transition-opacity hover:bg-surface-hover group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100'
														>
															<CloseIcon />
														</span>
													</TabsTrigger>
												))}
											</TabsList>

											{runScript.trim() !== '' && (
												<div className='flex shrink-0 items-center border-b-[length:var(--border-width)] border-surface-border px-2'>
													<Button size='sm' onClick={handleRun} disabled={!runnable}>
														<PlayIcon />
														Run
													</Button>
												</div>
											)}
										</div>

										<TabsContent value={activeId} className='min-h-0 flex-1 overflow-auto pt-0'>
											{isLoadingActive && (
												<div className='flex h-full items-center justify-center'>
													<Spinner label={`Loading ${fileName(activeId)}`} />
												</div>
											)}

											{fileError && !isLoadingActive && !activeFile && (
												<p role='alert' className='p-4 text-sm text-danger'>Couldn’t load {fileName(activeId)}.</p>
											)}

											{activeFile && (
												<CodeEditor
													key={activeFile.id}
													value={activeFile.content}
													onChange={(content) => editFile(activeFile.id, content)}
													aria-label={`Editing ${activeFile.path}`}
													className='min-h-full rounded-none border-0'
												/>
											)}
										</TabsContent>
									</Tabs>
								)}
							</ResizablePanel>

							{shellOpen && (
								<>
									<ResizableHandle aria-label='Resize terminal' />
									<ResizablePanel defaultSize={180} minSize={96} className='border-t-[length:var(--border-width)] border-surface-border'>
										<Shell
											entries={shell.entries}
											running={shell.running}
											onRun={shell.run}
											onClear={shell.clear}
											onClose={() => setShellOpen(false)}
										/>
									</ResizablePanel>
								</>
							)}
						</Resizable>
					</ResizablePanel>
				</Resizable>
			</div>

			<div className='flex h-7 shrink-0 items-center justify-between border-t-[length:var(--border-width)] border-surface-border bg-surface-active px-3 text-xs text-text-muted'>
				<span>{activeFile ? activeFile.path : 'Ready'}</span>

				<div className='flex items-center gap-3'>
					<span>{activeFile ? activeFile.language : ''}</span>

					<Button
						variant='ghost'
						size='sm'
						aria-pressed={shellOpen}
						onClick={() => setShellOpen((open) => !open)}
						className='h-5 gap-1 px-1.5 text-xs'
					>
						<TerminalIcon />
						Terminal
					</Button>
				</div>
			</div>

			<Modal open={settingsOpen} onOpenChange={setSettingsOpen}>
				<ModalClose />
				<ModalHeader>
					<ModalTitle>Settings</ModalTitle>
				</ModalHeader>
				<ModalContent>
					<div className='flex flex-col gap-4'>
						<Switch
							checked={openOnRun}
							onCheckedChange={setOpenOnRun}
							label='Open terminal on run'
							hint='Shows the terminal panel whenever a script starts.'
						/>
						<Switch
							checked={clearOnRun}
							onCheckedChange={setClearOnRun}
							label='Clear terminal before run'
							hint='Wipes earlier output so each run starts fresh.'
						/>
					</div>
				</ModalContent>
				<ModalFooter>
					<Button variant='secondary' onClick={() => setSettingsOpen(false)}>Done</Button>
				</ModalFooter>
			</Modal>
		</div>
	);
};

export default Terminal;
