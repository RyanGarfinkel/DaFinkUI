import type { AiChatReply, ChatArtifact } from '@/src/blocks/AiChat/AiChat';

// Docs-only scripted "agent" replies that produce artifacts for the ai-chat demo. With a real
// model, a tool call that writes a file would return these ChatArtifact objects instead.

const MARKDOWN_REPORT = `# Q3 review

## Highlights

- Signups grew **18%** month over month, led by the new onboarding flow.
- Retention at day 30 held at 42%.
- Support tickets per active user fell for the third quarter in a row.

## Numbers

| Month | Signups | Retention |
| --- | --- | --- |
| July | 1,240 | 41% |
| August | 1,510 | 42% |
| September | 1,780 | 42% |

## Next quarter

1. Ship the team-invite flow.
2. Cut time to first project below two minutes.
3. Start the annual-plan pricing test.
`;

const DOCUMENT_HTML = '<h1>Q3 review</h1><p>Signups grew <strong>18%</strong> month over month, led by the new onboarding flow. Retention at day 30 held at <strong>42%</strong>.</p><h2>Highlights</h2><ul><li><p>Support tickets per active user fell for the third quarter in a row</p></li><li><p>The team-invite flow is ready to ship</p></li></ul><h2>Next quarter</h2><ol><li><p>Ship the team-invite flow</p></li><li><p>Cut time to first project below two minutes</p></li><li><p>Start the annual-plan pricing test</p></li></ol><blockquote><p>Edit anything here, then download it as a Word file.</p></blockquote>';

const HTML_PAGE = `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title>Q3 review</title>
</head>
<body>
	<main>
		<h1>Q3 review</h1>
		<p>Signups grew 18% month over month.</p>
	</main>
</body>
</html>
`;

const REPORT_LINES = [
	'Q3 review',
	'',
	'Signups grew 18% month over month.',
	'Retention at day 30 held at 42%.',
	'Support tickets per active user fell again.',
	'',
	'Next quarter: team invites, faster first project,',
	'and an annual-plan pricing test.',
];

const escapePdfText = (text: string) => text.replace(/[\\()]/g, '\\$&');

const buildPdf = (lines: string[]) => {
	const stream = `BT /F1 16 Tf 72 720 Td 24 TL ${lines.map((line) => `(${escapePdfText(line)}) Tj T*`).join(' ')} ET`;
	const objects = [
		'<< /Type /Catalog /Pages 2 0 R >>',
		'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
		'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
		`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
		'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
	];

	let body = '%PDF-1.4\n';
	const offsets: number[] = [];
	objects.forEach((object, index) => {
		offsets.push(body.length);
		body += `${index + 1} 0 obj\n${object}\nendobj\n`;
	});

	const xrefOffset = body.length;
	body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
	body += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
	body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
	return body;
};

const SIGNUPS_CHART_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 280" role="img" aria-label="Signups by month">
	<rect width="480" height="280" fill="#ffffff" />
	<g fill="#18181b">
		<rect x="70" y="140" width="80" height="100" rx="6" />
		<rect x="200" y="100" width="80" height="140" rx="6" />
		<rect x="330" y="50" width="80" height="190" rx="6" />
	</g>
	<g font-family="sans-serif" font-size="14" fill="#52525b" text-anchor="middle">
		<text x="110" y="262">Jul</text>
		<text x="240" y="262">Aug</text>
		<text x="370" y="262">Sep</text>
	</g>
</svg>`;

const ARTIFACT_REPLIES: { words: RegExp; reply: AiChatReply }[] = [
	{
		words: /\bpdf\b/i,
		reply: {
			text:      'I put the Q3 review in a PDF. It’s saved to this chat’s artifacts, so you can open it again later.',
			artifacts: [{
				id:       'q3-review-pdf',
				kind:     'pdf',
				title:    'Q3 review.pdf',
				filename: 'q3-review.pdf',
				content:  `data:application/pdf;base64,${Buffer.from(buildPdf(REPORT_LINES), 'latin1').toString('base64')}`,
			}],
		},
	},
	{
		words: /\b(image|diagram|illustration|picture|graphic)\b/i,
		reply: {
			text:      'Here’s a quick bar chart of signups by month, saved to this chat’s artifacts.',
			artifacts: [{
				id:       'signups-chart',
				kind:     'image',
				title:    'Signups by month',
				filename: 'signups.svg',
				content:  `data:image/svg+xml;utf8,${encodeURIComponent(SIGNUPS_CHART_SVG)}`,
			}],
		},
	},
	{
		words: /\b(html|webpage|web page|code file)\b/i,
		reply: {
			text:      'I wrote a minimal HTML page for the review. It’s in this chat’s artifacts.',
			artifacts: [{ id: 'q3-review-html', kind: 'code', title: 'q3-review.html', filename: 'q3-review.html', content: HTML_PAGE }],
		},
	},
	{
		words: /\b(document|doc|docx|word|letter|proposal)\b/i,
		reply: {
			text:      'I drafted the Q3 review as a document. Open it from the card below to edit it here, and download it as a Word file when you’re done.',
			artifacts: [{ id: 'q3-review-word', kind: 'document', title: 'Q3 review', filename: 'q3-review.docx', content: DOCUMENT_HTML } satisfies ChatArtifact],
		},
	},
	{
		words: /\b(report|summary|write-?up|memo)\b/i,
		reply: {
			text:      'I wrote up the Q3 review as a document. It’s saved to this chat’s artifacts: open it from the card below or from the Artifacts button.',
			artifacts: [{ id: 'q3-review-doc', kind: 'markdown', title: 'Q3 review', filename: 'q3-review.md', content: MARKDOWN_REPORT } satisfies ChatArtifact],
		},
	},
];

/** A scripted reply that produces an artifact, or null for an ordinary canned reply. */
export const artifactReply = (message: string): AiChatReply | null =>
	ARTIFACT_REPLIES.find(({ words }) => words.test(message))?.reply ?? null;
