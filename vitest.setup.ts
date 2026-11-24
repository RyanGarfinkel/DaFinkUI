import '@testing-library/jest-dom';

Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
Range.prototype.getBoundingClientRect = () => new DOMRect();

global.ResizeObserver = class ResizeObserver
{
	observe()   {}
	unobserve() {}
	disconnect() {}
};
