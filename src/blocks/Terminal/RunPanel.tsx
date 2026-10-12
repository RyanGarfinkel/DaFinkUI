'use client';

import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { PlayIcon } from './icons';

interface RunPanelProps {
	script:    string;
	activeId:  string | null;
	running:   boolean;
	onChange:  (script: string) => void;
	onRun:     () => void;
}

export const FILE_PLACEHOLDER = '{file}';

const needsOpenFile = (script: string, activeId: string | null) => script.includes(FILE_PLACEHOLDER) && activeId === null;

export const canRunScript = (script: string, activeId: string | null, running: boolean) =>
	script.trim() !== '' && !needsOpenFile(script, activeId) && !running;

export const RunPanel = ({ script, activeId, running, onChange, onRun }: RunPanelProps) => {
	const needsFile = needsOpenFile(script, activeId);
	const canRun = canRunScript(script, activeId, running);

	return (
		<div className='flex flex-col gap-3 p-3'>
			<Input
				label='Run script'
				value={script}
				onChange={(e) => onChange(e.target.value)}
				placeholder='npm run dev'
				spellCheck={false}
				hint={`Use ${FILE_PLACEHOLDER} for the open file, e.g. node ${FILE_PLACEHOLDER}.`}
			/>

			<Button size='sm' onClick={onRun} disabled={!canRun}>
				<PlayIcon />
				Run
			</Button>

			{needsFile && <p className='text-xs text-text-muted'>Open a file to run a script that uses {FILE_PLACEHOLDER}.</p>}
			{script.trim() === '' && <p className='text-xs text-text-muted'>Add a script to enable running.</p>}
		</div>
	);
};

export default RunPanel;
