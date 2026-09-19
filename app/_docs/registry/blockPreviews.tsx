import { NotificationsPanelActionable } from '@/src/blocks/NotificationsPanelActionable/NotificationsPanelActionable';
import { JobApplicationTracker } from '@/src/blocks/JobApplicationTracker/JobApplicationTracker';
import { OnboardingChecklist } from '@/src/blocks/OnboardingChecklist/OnboardingChecklist';
import { PricingSectionUsage } from '@/src/blocks/PricingSectionUsage/PricingSectionUsage';
import { NotificationsPanel } from '@/src/blocks/NotificationsPanel/NotificationsPanel';
import { AuthFormMagicLink } from '@/src/blocks/AuthFormMagicLink/AuthFormMagicLink';
import { TeamManagement } from '@/src/blocks/TeamManagement/TeamManagement';
import { PricingSection } from '@/src/blocks/PricingSection/PricingSection';
import { AuthFormSocial } from '@/src/blocks/AuthFormSocial/AuthFormSocial';
import { ChartCardRadar } from '@/src/blocks/ChartCardRadar/ChartCardRadar';
import { SettingsForm } from '@/src/blocks/SettingsForm/SettingsForm';
import { CheckoutForm } from '@/src/blocks/CheckoutForm/CheckoutForm';
import { ChartCardBar } from '@/src/blocks/ChartCardBar/ChartCardBar';
import { ProjectHub } from '@/src/blocks/ProjectHub/ProjectHub';
import { ChartCard } from '@/src/blocks/ChartCard/ChartCard';
import { Dashboard } from '@/src/blocks/Dashboard/Dashboard';
import { AuthForm } from '@/src/blocks/AuthForm/AuthForm';
import { TeamGrid } from '@/src/blocks/TeamGrid/TeamGrid';
import { AiChat } from '@/src/blocks/AiChat/AiChat';

export const blockPreviews: Record<string, React.ReactNode> = {
	dashboard: <Dashboard />,
	'chart-card': <ChartCard />,
	'chart-card-bar': <ChartCardBar />,
	'chart-card-radar': <ChartCardRadar />,
	'auth-form': <AuthForm />,
	'auth-form-social': <AuthFormSocial />,
	'auth-form-magic-link': <AuthFormMagicLink />,
	'onboarding-checklist': <OnboardingChecklist />,
	'settings-form': <SettingsForm />,
	'checkout-form': <CheckoutForm />,
	'pricing-section': <PricingSection />,
	'pricing-section-usage': <PricingSectionUsage />,
	'ai-chat': <AiChat />,
	'notifications-panel': <NotificationsPanel />,
	'notifications-panel-actionable': <NotificationsPanelActionable />,
	'team-grid': <TeamGrid />,
	'team-management': <TeamManagement />,
	'project-hub': <ProjectHub />,
	'job-application-tracker': <JobApplicationTracker />,
};
