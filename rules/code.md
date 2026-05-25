# Rule: Code Style

General code style rules that apply to all files in this repo.

## Import Order

Imports must be ordered by statement length — longest import statement at the top, shortest at the bottom. No grouping by type (third-party vs local).

```ts
// Correct
import { createContext, useContext, useRef, useState, useEffect } from 'react';
import { something } from '../utils';
import type { Foo } from './types';

// Wrong — shorter imports above longer ones
import type { Foo } from './types';
import { createContext, useContext } from 'react';
```

In Next.js / React files with `'use client'`:
- `'use client';` on line 1
- One blank line
- Then imports (longest → shortest)
