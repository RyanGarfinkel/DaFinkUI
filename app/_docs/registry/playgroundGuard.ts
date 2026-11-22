import type * as BabelTypes from '@babel/types';

const BLOCKED_KEYS = new Set(['constructor', '__proto__', 'prototype']);

const RESOURCE_ATTRIBUTES = new Set(['src', 'srcSet', 'srcset', 'poster', 'background', 'ping', 'manifest']);

const RESOURCE_ELEMENTS = new Set(['img', 'image', 'video', 'audio', 'source', 'track', 'iframe', 'object', 'embed', 'link', 'script', 'picture', 'use', 'form', 'feImage']);

const REMOTE_URL = /\b(?:https?|wss?|ftp):\/\/|^\s*\/\/|\burl\(|^\s*javascript:/i;

const INLINE_URL = /^\s*(?:data|blob|#)/i;

const ALLOWED_GLOBALS = [
	'Math', 'Date', 'JSON', 'Number', 'String', 'Boolean', 'Array', 'Set', 'Map', 'WeakMap', 'WeakSet', 'Promise', 'Symbol', 'RegExp', 'Error', 'BigInt', 'Intl',
	'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'Infinity', 'NaN', 'undefined', 'console', 'clearTimeout', 'clearInterval',
] as const;

const SAFE_OBJECT = Object.freeze({
	keys: Object.keys,
	values: Object.values,
	entries: Object.entries,
	assign: Object.assign,
	fromEntries: Object.fromEntries,
	freeze: Object.freeze,
	is: Object.is,
});

const blockedKey = (key: unknown) => BLOCKED_KEYS.has(String(key)) || String(key).startsWith('__');

const guardKey = (key: unknown) => {
	if (blockedKey(key)) throw new Error(`Accessing "${String(key)}" is not allowed in the playground.`);
	return key;
};

const onlyCallbacks = (timer: (handler: () => void, delay?: number) => number) => (handler: unknown, delay?: number) =>
{
	if (typeof handler !== 'function') throw new Error('Timers need a function; string handlers are not allowed in the playground.');
	return timer(handler as () => void, delay);
};

const reject = (message: string): never => {
	throw new Error(`${message} The playground has no network access.`);
};

const checkResource = (name: string, value: BabelTypes.Node | null | undefined) => {
	if (value?.type === 'JSXExpressionContainer') return checkResource(name, value.expression);
	if (value?.type === 'StringLiteral' && INLINE_URL.test(value.value)) return;
	if (value?.type === 'StringLiteral' && value.value === '') return;
	reject(`"${name}" can only be an inline data: URI.`);
};

/** Babel plugin run on playground code before it is evaluated. It rejects constructs that could
 * reach the network (network APIs, remote URLs, resource-loading elements and attributes) and
 * routes every computed property key through `__key` so `fn['constr' + 'uctor']` cannot reach
 * the `Function` constructor at runtime. */
export const networkGuardPlugin = ({ types: t }: { types: typeof BabelTypes }) => ({
	visitor: {
		ThisExpression(path: { replaceWith: (node: BabelTypes.Node) => void }) {
			path.replaceWith(t.identifier('undefined'));
		},
		Import() {
			reject('Dynamic import is not allowed.');
		},
		Identifier(path: { node: BabelTypes.Identifier; parent: BabelTypes.Node; isReferencedIdentifier: () => boolean }) {
			if (path.node.name === 'arguments' && path.isReferencedIdentifier()) reject('"arguments" is not allowed.');
			if (path.parent.type === 'MemberExpression' && !path.parent.computed && path.parent.property === path.node && blockedKey(path.node.name)) reject(`Accessing "${path.node.name}" is not allowed.`);
			if (path.parent.type === 'ObjectProperty' && !path.parent.computed && path.parent.key === path.node && blockedKey(path.node.name)) reject(`The key "${path.node.name}" is not allowed.`);
		},
		StringLiteral(path: { node: BabelTypes.StringLiteral }) {
			if (REMOTE_URL.test(path.node.value)) reject('Remote URLs are not allowed.');
			if (blockedKey(path.node.value)) reject(`"${path.node.value}" is not allowed.`);
		},
		TemplateElement(path: { node: BabelTypes.TemplateElement }) {
			if (REMOTE_URL.test(path.node.value.raw)) reject('Remote URLs are not allowed.');
		},
		MemberExpression(path: { node: BabelTypes.MemberExpression }) {
			if (path.node.computed && path.node.property.type !== 'NumericLiteral') path.node.property = t.callExpression(t.identifier('__key'), [path.node.property as BabelTypes.Expression]);
		},
		ObjectProperty(path: { node: BabelTypes.ObjectProperty }) {
			if (path.node.computed) path.node.key = t.callExpression(t.identifier('__key'), [path.node.key as BabelTypes.Expression]);
			if (path.node.key.type === 'Identifier' && !path.node.computed && RESOURCE_ATTRIBUTES.has(path.node.key.name)) checkResource(path.node.key.name, path.node.value);
		},
		JSXOpeningElement(path: { node: BabelTypes.JSXOpeningElement }) {
			const { name } = path.node;
			if (name.type === 'JSXIdentifier' && RESOURCE_ELEMENTS.has(name.name)) reject(`<${name.name}> can load remote resources.`);
		},
		JSXAttribute(path: { node: BabelTypes.JSXAttribute }) {
			const { name, value } = path.node;
			if (name.type === 'JSXIdentifier' && RESOURCE_ATTRIBUTES.has(name.name)) checkResource(name.name, value);		},
	},
});

/** The only names playground code can resolve. Everything else, including `window`, `fetch`,
 * `XMLHttpRequest`, `WebSocket` and `globalThis`, throws a ReferenceError when looked up. */
export const createSandbox = (scope: Record<string, unknown>, react: unknown) => {
	const allowed: Record<string, unknown> = { ...scope, React: react, Object: SAFE_OBJECT, __key: guardKey };

	for (const name of ALLOWED_GLOBALS) allowed[name] = (globalThis as Record<string, unknown>)[name];
	allowed.setTimeout = onlyCallbacks(globalThis.setTimeout as never);
	allowed.setInterval = onlyCallbacks(globalThis.setInterval as never);

	return new Proxy(allowed, {
		has: () => true,
		get(target, key)
		{
			if (typeof key === 'symbol') return undefined;
			if (key in target) return target[key];
			throw new ReferenceError(`${key} is not available in the playground, which has no network access.`);
		},
		set: () => false,
	});
};
