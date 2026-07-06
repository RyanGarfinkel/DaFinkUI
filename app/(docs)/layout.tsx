import { DocsShell } from '@/app/_docs/components/DocsShell';

const DocsLayout = (
  {
    children,
  }: {
    children: React.ReactNode;
  }
) => {
  return <DocsShell>{children}</DocsShell>;
};

export default DocsLayout;
