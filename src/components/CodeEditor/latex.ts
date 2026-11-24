import type { Extension } from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { latexComplete } from './latexComplete';

interface LatexState {
	math: boolean;
}

const latexLanguage = StreamLanguage.define<LatexState>({
	name:         'latex',
	startState:   () => ({ math: false }),
	languageData: { commentTokens: { line: '%' } },
	token:        (stream, state) => {
		if(stream.eatSpace()) return null;

		if(stream.eat('%'))
		{
			stream.skipToEnd();
			return 'comment';
		}

		if(stream.eat('\\'))
		{
			if(!stream.eatWhile(/[a-zA-Z@]/)) stream.next();
			return 'keyword';
		}

		if(stream.eat('$'))
		{
			stream.eat('$');
			state.math = !state.math;
			return 'string';
		}

		if(stream.eat(/[{}[\]]/)) return 'bracket';

		stream.eatWhile(/[^\\$%{}[\]\s]/);
		return state.math ? 'string' : null;
	},
});

export const latex: Extension = [latexLanguage, latexLanguage.data.of({ autocomplete: latexComplete })];
