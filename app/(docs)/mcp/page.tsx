import { CodeBlock } from '@/src/docs/components/CodeBlock';

const McpPage = () => {
  return (
    <div className='flex flex-col gap-12'>

      {/* Header */}
      <section className='flex flex-col gap-3'>
        <h1 className='text-3xl font-semibold tracking-tight text-text'>
          MCP Server
        </h1>
        <p className='text-base text-text-muted leading-relaxed max-w-2xl'>
          Obi UI ships a built-in{' '}
          <a
            href='https://modelcontextprotocol.io'
            target='_blank'
            rel='noopener noreferrer'
            className='text-text underline underline-offset-4 hover:text-text-muted transition-colors'
          >
            Model Context Protocol
          </a>{' '}
          server. Connect it to Claude or any MCP-compatible AI tool and it
          will have live access to every component spec, design token, and
          pattern — so it uses the actual Obi UI API instead of guessing.
        </p>
      </section>

      {/* What it does */}
      <section className='flex flex-col gap-4'>
        <h2 className='text-xl font-semibold text-text'>What the server exposes</h2>
        <p className='text-sm text-text-muted leading-relaxed'>
          The MCP server runs as a stdio process and exposes three resources
          and two tools. All data is read from the source files at request
          time — it is always current, never stale.
        </p>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <div className='rounded-lg border border-surface-border bg-surface p-4 flex flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <span className='text-xs font-mono font-medium text-brand bg-brand/10 px-2 py-0.5 rounded'>resource</span>
              <code className='text-sm font-mono text-text'>obi://components</code>
            </div>
            <p className='text-sm text-text-muted leading-relaxed'>
              The full component registry — every slug, name, category,
              description, props, and dependency list.
            </p>
          </div>

          <div className='rounded-lg border border-surface-border bg-surface p-4 flex flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <span className='text-xs font-mono font-medium text-brand bg-brand/10 px-2 py-0.5 rounded'>resource</span>
              <code className='text-sm font-mono text-text'>obi://tokens</code>
            </div>
            <p className='text-sm text-text-muted leading-relaxed'>
              Every design token — colors, spacing, motion, typography — as a
              structured JSON object.
            </p>
          </div>

          <div className='rounded-lg border border-surface-border bg-surface p-4 flex flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <span className='text-xs font-mono font-medium text-brand bg-brand/10 px-2 py-0.5 rounded'>resource</span>
              <code className='text-sm font-mono text-text'>obi://patterns</code>
            </div>
            <p className='text-sm text-text-muted leading-relaxed'>
              The list of design pattern documents: accessibility guidelines,
              interactive state rules, and the visual design philosophy.
            </p>
          </div>

          <div className='rounded-lg border border-surface-border bg-surface p-4 flex flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <span className='text-xs font-mono font-medium text-text-muted bg-surface-active px-2 py-0.5 rounded'>tool</span>
              <code className='text-sm font-mono text-text'>get_component_spec</code>
            </div>
            <p className='text-sm text-text-muted leading-relaxed'>
              Returns the full <code className='font-mono text-xs'>spec.md</code> for a
              named component — props, variants, accessibility notes, and usage
              guidance.
            </p>
          </div>

          <div className='rounded-lg border border-surface-border bg-surface p-4 flex flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <span className='text-xs font-mono font-medium text-text-muted bg-surface-active px-2 py-0.5 rounded'>tool</span>
              <code className='text-sm font-mono text-text'>get_pattern</code>
            </div>
            <p className='text-sm text-text-muted leading-relaxed'>
              Returns a named pattern document by slug — e.g.{' '}
              <code className='font-mono text-xs'>&quot;accessibility&quot;</code> or{' '}
              <code className='font-mono text-xs'>&quot;design&quot;</code>.
            </p>
          </div>
        </div>
      </section>

      {/* Setup */}
      <section className='flex flex-col gap-5'>
        <h2 className='text-xl font-semibold text-text'>Connecting to Claude</h2>
        <p className='text-sm text-text-muted leading-relaxed'>
          The MCP server runs as a local stdio process. To connect it to the
          Claude desktop app, add an entry to your{' '}
          <code className='font-mono text-xs'>claude_desktop_config.json</code>.
          On macOS this file lives at{' '}
          <code className='font-mono text-xs'>
            ~/Library/Application Support/Claude/claude_desktop_config.json
          </code>
          .
        </p>

        <div className='flex flex-col gap-2'>
          <p className='text-sm font-medium text-text'>1. Build the server</p>
          <CodeBlock code={'cd /path/to/your/design-system\nnpx tsx mcp/server.ts'} />
        </div>

        <div className='flex flex-col gap-2'>
          <p className='text-sm font-medium text-text'>
            2. Add to <code className='font-mono text-xs'>claude_desktop_config.json</code>
          </p>
          <CodeBlock
            code={`{
  "mcpServers": {
    "obi-ui": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/your/design-system/mcp/server.ts"]
    }
  }
}`}
          />
          <p className='text-xs text-text-muted'>
            Replace <code className='font-mono text-xs'>/absolute/path/to/your/design-system</code> with the
            actual path to this repo on your machine.
          </p>
        </div>

        <div className='flex flex-col gap-2'>
          <p className='text-sm font-medium text-text'>3. Restart Claude</p>
          <p className='text-sm text-text-muted leading-relaxed'>
            Quit and reopen the Claude desktop app. You should see{' '}
            <strong className='font-medium text-text'>obi-ui</strong> listed
            under connected MCP servers in the bottom-left of the chat window.
          </p>
        </div>
      </section>

      {/* Other MCP clients */}
      <section className='flex flex-col gap-4'>
        <h2 className='text-xl font-semibold text-text'>Other MCP clients</h2>
        <p className='text-sm text-text-muted leading-relaxed'>
          Any MCP-compatible client can connect to the server the same way.
          The server speaks the standard stdio transport, so it works with
          Claude Code, Cursor, Windsurf, or any other tool that supports MCP.
        </p>
        <p className='text-sm text-text-muted leading-relaxed'>
          For Claude Code, add the server to your{' '}
          <code className='font-mono text-xs'>.claude/settings.json</code> using
          the same <code className='font-mono text-xs'>mcpServers</code> format
          as above.
        </p>
      </section>

      {/* How it helps */}
      <section className='flex flex-col gap-4'>
        <h2 className='text-xl font-semibold text-text'>How it changes your workflow</h2>
        <p className='text-sm text-text-muted leading-relaxed'>
          Without the MCP server, asking an AI to &quot;build a form using Obi
          UI&quot; is a gamble — it may hallucinate prop names, invent variants that
          don&apos;t exist, or use an old API it saw in training data.
        </p>
        <p className='text-sm text-text-muted leading-relaxed'>
          With the server connected, Claude can call{' '}
          <code className='font-mono text-xs'>get_component_spec(&quot;Form&quot;)</code> before
          writing any code. It gets the exact prop table, the correct import
          path, the variants that actually exist, and the accessibility guidance
          for that component. The result is code that works the first time.
        </p>
        <p className='text-sm text-text-muted leading-relaxed'>
          The server also exposes the full accessibility and design pattern
          documents, so Claude understands the visual philosophy, token
          naming conventions, and overlay interaction rules — not just individual
          component APIs.
        </p>
      </section>

      {/* Spec format */}
      <section className='flex flex-col gap-4'>
        <h2 className='text-xl font-semibold text-text'>Keeping specs current</h2>
        <p className='text-sm text-text-muted leading-relaxed'>
          Each component has a <code className='font-mono text-xs'>spec.md</code> file
          alongside its source code. The MCP server reads these files at request
          time — there is no build step and no cache to invalidate. When you
          update a component and update its spec, the server immediately returns
          the new information.
        </p>
        <p className='text-sm text-text-muted leading-relaxed'>
          The spec format is documented in{' '}
          <code className='font-mono text-xs'>rules/new-component.md</code>. Every
          spec must include: a one-line description, a props table, an
          interactive states section, accessibility notes, and the install
          command.
        </p>
      </section>

    </div>
  );
};

export default McpPage;
