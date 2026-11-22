import { JobApplicationTracker } from '@/src/blocks/JobApplicationTracker/JobApplicationTracker';
import { OnboardingChecklist } from '@/src/blocks/OnboardingChecklist/OnboardingChecklist';
import { PricingSectionUsage } from '@/src/blocks/PricingSectionUsage/PricingSectionUsage';
import { AuthFormMagicLink } from '@/src/blocks/AuthFormMagicLink/AuthFormMagicLink';
import { TeamManagement } from '@/src/blocks/TeamManagement/TeamManagement';
import { PricingSection } from '@/src/blocks/PricingSection/PricingSection';
import { AuthFormSocial } from '@/src/blocks/AuthFormSocial/AuthFormSocial';
import { SettingsForm } from '@/src/blocks/SettingsForm/SettingsForm';
import { CheckoutForm } from '@/src/blocks/CheckoutForm/CheckoutForm';
import { SlideEditor } from '@/src/blocks/SlideEditor/SlideEditor';
import { ProjectHub } from '@/src/blocks/ProjectHub/ProjectHub';
import { Dashboard } from '@/src/blocks/Dashboard/Dashboard';
import { AuthForm } from '@/src/blocks/AuthForm/AuthForm';
import { Terminal } from '@/src/blocks/Terminal/Terminal';
import { AiChat } from '@/src/blocks/AiChat/AiChat';

export const blockPreviews: Record<string, React.ReactNode> = {
	dashboard: <Dashboard />,
	'auth-form': <AuthForm />,
	'auth-form-social': <AuthFormSocial />,
	'auth-form-magic-link': <AuthFormMagicLink />,
	'onboarding-checklist': <OnboardingChecklist />,
	'settings-form': <SettingsForm />,
	'checkout-form': <CheckoutForm />,
	'pricing-section': <PricingSection />,
	'pricing-section-usage': <PricingSectionUsage />,
	'ai-chat': <AiChat />,
	'team-management': <TeamManagement />,
	'project-hub': <ProjectHub />,
	'job-application-tracker': <JobApplicationTracker />,
	terminal: <Terminal />,
	'slide-editor': <SlideEditor />,
};
