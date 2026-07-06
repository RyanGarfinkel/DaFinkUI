import { deriveImports } from './playgroundScope';
import { describe, it, expect } from 'vitest';

const FAKE_REGISTRY = [
	{ name: 'Button', usage: 'import Button from \'@/src/components/Button/Button\';\n\nexport default function Example() {\n  return <Button>Click me</Button>;\n}' },
	{ name: 'Badge', usage: 'import { Badge } from \'@/src/components/Badge/Badge\';\n\nexport default function Example() {\n  return <Badge>New</Badge>;\n}' },
];

describe('deriveImports', () =>
{
	it('includes the import line for a component referenced as a JSX tag', () =>
	{
		const imports = deriveImports('<Button variant="primary">Click me</Button>', FAKE_REGISTRY);
		expect(imports).toContain("import Button from '@/src/components/Button/Button';");
	});

	it('includes imports for multiple referenced components and excludes unrelated ones', () =>
	{
		const imports = deriveImports('<Button>Go</Button><Badge>New</Badge>', FAKE_REGISTRY);
		expect(imports).toContain("import Button from '@/src/components/Button/Button';");
		expect(imports).toContain("import { Badge } from '@/src/components/Badge/Badge';");
		expect(imports).toHaveLength(2);
	});

	it('does not match a component name that only appears as plain text, not a JSX tag', () =>
	{
		const imports = deriveImports('const label = "Button";', FAKE_REGISTRY);
		expect(imports).toHaveLength(0);
	});

	it('does not false-positive on a component name that is a prefix of another tag', () =>
	{
		const imports = deriveImports('<ButtonGroup>Go</ButtonGroup>', FAKE_REGISTRY);
		expect(imports).toHaveLength(0);
	});

	it('adds a react hooks import when the code calls useState/useEffect/useRef', () =>
	{
		const imports = deriveImports('const [x, setX] = useState(0);', FAKE_REGISTRY);
		expect(imports.some((line) => line.includes("from 'react'") && line.includes('useState'))).toBe(true);
	});

	it('returns no imports for code that references nothing from the registry', () =>
	{
		const imports = deriveImports('<div className="flex">Just plain markup</div>', FAKE_REGISTRY);
		expect(imports).toHaveLength(0);
	});
});
