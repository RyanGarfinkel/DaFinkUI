#!/bin/sh
# PostToolUse hook: runs `eslint --fix` on a .ts/.tsx/.mjs file Claude just wrote or edited.
# Exit 2 sends any remaining lint errors back to Claude on stderr.

root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
file=$(jq -r '.tool_response.filePath // .tool_input.file_path')

case "$file" in
	"$root"/packages/*|"$root"/.claude/*|"$root"/node_modules/*|"$root"/.next/*) exit 0 ;;
	"$root"/*.ts|"$root"/*.tsx|"$root"/*.mjs) ;;
	*) exit 0 ;;
esac

[ -f "$file" ] || exit 0

cd "$root" || exit 0

output=$(npx eslint --fix "$file" 2>&1) || {
	printf 'ESLint errors remain in %s after --fix. Fix them:\n%s\n' "$file" "$output" >&2
	exit 2
}
