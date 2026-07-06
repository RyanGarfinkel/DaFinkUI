export interface BlockRegistryEntry
{
	name: string;
	slug: string;
	files: string[];
	deps: string[];
	registryDependencies: string[];
}

export const BLOCKS_REGISTRY: BlockRegistryEntry[] = [
	{ name: 'Dashboard',           slug: 'dashboard',             files: ['Dashboard/Dashboard.tsx'],                     deps: ['recharts'], registryDependencies: ['mosaic', 'dropdown-menu', 'charts', 'badge', 'avatar', 'data-table', 'count-up'] },
	{ name: 'ChartCard',           slug: 'chart-card',            files: ['ChartCard/ChartCard.tsx'],                     deps: [],           registryDependencies: ['card', 'charts', 'count-up', 'badge'] },
	{ name: 'AuthForm',            slug: 'auth-form',             files: ['AuthForm/AuthForm.tsx'],                       deps: [],           registryDependencies: ['card', 'form', 'toggle-group', 'checkbox', 'otp-input', 'progress', 'button', 'badge', 'input'] },
	{ name: 'OnboardingChecklist', slug: 'onboarding-checklist',  files: ['OnboardingChecklist/OnboardingChecklist.tsx'], deps: [],           registryDependencies: ['card', 'checkbox', 'progress', 'button'] },
	{ name: 'SettingsForm',        slug: 'settings-form',         files: ['SettingsForm/SettingsForm.tsx'],               deps: [],           registryDependencies: ['card', 'form', 'input', 'textarea', 'switch', 'select', 'button', 'badge'] },
	{ name: 'CheckoutForm',        slug: 'checkout-form',         files: ['CheckoutForm/CheckoutForm.tsx'],               deps: [],           registryDependencies: ['card', 'form', 'radio', 'button', 'input'] },
	{ name: 'PricingSection',      slug: 'pricing-section',       files: ['PricingSection/PricingSection.tsx'],           deps: [],           registryDependencies: ['accordion', 'toggle-group', 'card', 'button', 'badge'] },
	{ name: 'AiChat',              slug: 'ai-chat',               files: ['AiChat/AiChat.tsx'],                           deps: [],           registryDependencies: ['card', 'scroll-fade', 'message', 'avatar', 'button', 'badge', 'input'] },
	{ name: 'NotificationsPanel',  slug: 'notifications-panel',   files: ['NotificationsPanel/NotificationsPanel.tsx'],   deps: [],           registryDependencies: ['card', 'scroll-fade', 'avatar', 'button'] },
	{ name: 'TeamGrid',            slug: 'team-grid',             files: ['TeamGrid/TeamGrid.tsx'],                       deps: [],           registryDependencies: ['badge', 'card', 'avatar'] },
	{ name: 'TeamManagement',      slug: 'team-management',       files: ['TeamManagement/TeamManagement.tsx'],           deps: [],           registryDependencies: ['modal', 'card', 'select', 'badge', 'avatar', 'button', 'input'] },
];

export function findBlockBySlug(slug: string): BlockRegistryEntry | undefined
{
	return BLOCKS_REGISTRY.find(e => e.slug === slug);
}

export function findBlockByName(name: string): BlockRegistryEntry | undefined
{
	return BLOCKS_REGISTRY.find(e => e.name.toLowerCase() === name.toLowerCase());
}

export function resolveBlock(input: string): BlockRegistryEntry | undefined
{
	return findBlockBySlug(input) ?? findBlockByName(input);
}
