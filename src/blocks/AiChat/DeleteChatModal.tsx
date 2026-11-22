'use client';

import Modal, { ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose } from '../../components/Modal/Modal';
import Button from '../../components/Button/Button';
import type { ChatEntry } from './types';

export interface DeleteChatModalProps {
	/** The chat awaiting confirmation; null keeps the dialog closed. */
	chat:      ChatEntry | null;
	onCancel:  () => void;
	onConfirm: (chat: ChatEntry) => void;
}

export const DeleteChatModal = ({ chat, onCancel, onConfirm }: DeleteChatModalProps) => (
	<Modal open={chat !== null} onOpenChange={(open) => !open && onCancel()}>
		<ModalClose />
		<ModalHeader>
			<ModalTitle>Delete chat</ModalTitle>
		</ModalHeader>
		<ModalContent>
			{`Delete "${chat?.title}"? This can't be undone.`}
		</ModalContent>
		<ModalFooter>
			<Button variant='secondary' onClick={onCancel}>Cancel</Button>
			<Button variant='destructive' onClick={() => chat && onConfirm(chat)}>Delete</Button>
		</ModalFooter>
	</Modal>
);

export default DeleteChatModal;
