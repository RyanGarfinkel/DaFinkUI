'use client';

import Modal, { ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose } from '../../components/Modal/Modal';
import { MODEL_OPTIONS, CONNECTORS } from './constants';
import Switch from '../../components/Switch/Switch';
import Select from '../../components/Select/Select';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import type { ChatSettings } from './types';

export interface SettingsModalProps {
	open:         boolean;
	onOpenChange: (open: boolean) => void;
	settings:     ChatSettings;
	onChange:     (settings: ChatSettings) => void;
}

export const SettingsModal = ({ open, onOpenChange, settings, onChange }: SettingsModalProps) => {
	const toggleConnector = (id: string, enabled: boolean) =>
		onChange({ ...settings, enabledConnectors: enabled ? [...settings.enabledConnectors, id] : settings.enabledConnectors.filter((existing) => existing !== id) });

	return (
		<Modal size='lg' open={open} onOpenChange={onOpenChange}>
			<ModalClose />
			<ModalHeader>
				<ModalTitle>AI chat settings</ModalTitle>
			</ModalHeader>
			<ModalContent>
				<div className='grid grid-cols-2 gap-x-8 gap-y-5'>
					<Input
						label='Display name'
						value={settings.displayName}
						onChange={(e) => onChange({ ...settings, displayName: e.target.value })}
					/>
					<Select
						label='Model'
						options={MODEL_OPTIONS}
						value={settings.model}
						onChange={(model) => onChange({ ...settings, model })}
					/>
					<div className='col-span-2 flex flex-col gap-3'>
						<p className='text-sm font-medium text-text'>Connectors</p>
						{CONNECTORS.map((connector) => (
							<Switch
								key={connector.id}
								checked={settings.enabledConnectors.includes(connector.id)}
								onCheckedChange={(checked) => toggleConnector(connector.id, checked)}
								label={connector.label}
								hint={connector.description}
							/>
						))}
					</div>
					<div className='col-span-2'>
						<Switch
							checked={settings.autoTitleEnabled}
							onCheckedChange={(autoTitleEnabled) => onChange({ ...settings, autoTitleEnabled })}
							label='Auto-title new chats'
							hint='Names a new chat after its first message instead of leaving it as "New chat".'
						/>
					</div>
				</div>
			</ModalContent>
			<ModalFooter>
				<Button onClick={() => onOpenChange(false)}>Done</Button>
			</ModalFooter>
		</Modal>
	);
};

export default SettingsModal;
