import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Installation',
	description: 'Set up DaFink UI in a Next.js or React project. Run the initialiser, then add only the components you need, each one copied as source code directly into your project.',
};

const InstallationLayout = ({ children }: { children: React.ReactNode }) =>
{
	return <>{children}</>;
};

export default InstallationLayout;
