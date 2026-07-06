'use client';

import SidePanel, {
	SidePanelClose,
	SidePanelContent,
	SidePanelFooter,
	SidePanelHeader,
	SidePanelTitle,
	useSidePanelBlocked,
} from '@/src/components/SidePanel/SidePanel';
import Button from '@/src/components/Button/Button';
import { useState } from 'react';

interface FiltersFooterProps {
	onRefine: () => void;
	onClose:  () => void;
}

const FiltersFooter = ({ onRefine, onClose }: FiltersFooterProps) => {
	const isBlocked = useSidePanelBlocked();

	return (
		<SidePanelFooter>
			<Button variant='secondary' onClick={onRefine}>Refine further</Button>
			<Button variant='secondary' disabled={isBlocked} onClick={onClose}>Close</Button>
		</SidePanelFooter>
	);
};

export const StackedSidePanelDemo = () => {
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [advancedOpen, setAdvancedOpen] = useState(false);

	return (
		<div className='flex flex-wrap gap-2 justify-center'>
			<Button variant='secondary' onClick={() => setFiltersOpen(true)}>Open filters</Button>

			<SidePanel open={filtersOpen} onOpenChange={setFiltersOpen} side='right'>
				<SidePanelClose />
				<SidePanelHeader>
					<SidePanelTitle>Filters</SidePanelTitle>
				</SidePanelHeader>
				<SidePanelContent>
					A trigger inside this panel opens a second one on the same side —
					watch this panel automatically shift toward the center, and its own
					close controls disable until Advanced filters closes.
				</SidePanelContent>
				<FiltersFooter
					onRefine={() => setAdvancedOpen(true)}
					onClose={() => setFiltersOpen(false)}
				/>
			</SidePanel>

			<SidePanel open={advancedOpen} onOpenChange={setAdvancedOpen} side='right'>
				<SidePanelClose />
				<SidePanelHeader>
					<SidePanelTitle>Advanced filters</SidePanelTitle>
				</SidePanelHeader>
				<SidePanelContent>
					Independent panel — closing this one returns the Filters panel to
					its original position. Both panels stay interactive the whole time.
				</SidePanelContent>
				<SidePanelFooter>
					<Button variant='secondary' onClick={() => setAdvancedOpen(false)}>Close</Button>
				</SidePanelFooter>
			</SidePanel>
		</div>
	);
};

export default StackedSidePanelDemo;
