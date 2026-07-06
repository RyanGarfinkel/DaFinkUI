import { OnboardingChecklist } from '@/src/blocks/OnboardingChecklist/OnboardingChecklist';
import { NotificationsPanel } from '@/src/blocks/NotificationsPanel/NotificationsPanel';
import { TeamManagement } from '@/src/blocks/TeamManagement/TeamManagement';
import { PricingSection } from '@/src/blocks/PricingSection/PricingSection';
import { SettingsForm } from '@/src/blocks/SettingsForm/SettingsForm';
import { CheckoutForm } from '@/src/blocks/CheckoutForm/CheckoutForm';
import { ChartCard } from '@/src/blocks/ChartCard/ChartCard';
import { Dashboard } from '@/src/blocks/Dashboard/Dashboard';
import { AuthForm } from '@/src/blocks/AuthForm/AuthForm';
import { TeamGrid } from '@/src/blocks/TeamGrid/TeamGrid';
import { AiChat } from '@/src/blocks/AiChat/AiChat';

export const blockPreviews: Record<string, React.ReactNode> = {
	dashboard: <Dashboard />,
	'chart-card': <ChartCard />,
	'auth-form': <AuthForm />,
	'onboarding-checklist': <OnboardingChecklist />,
	'settings-form': <SettingsForm />,
	'checkout-form': <CheckoutForm />,
	'pricing-section': <PricingSection />,
	'ai-chat': <AiChat />,
	'notifications-panel': <NotificationsPanel />,
	'team-grid': <TeamGrid />,
	'team-management': <TeamManagement />,
};
