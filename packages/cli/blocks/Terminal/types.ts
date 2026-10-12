export interface TerminalNode {
	id:        string;
	name:      string;
	type:      'file' | 'folder';
	children?: TerminalNode[];
}

export interface TerminalFile {
	id:       string;
	path:     string;
	language: string;
	content:  string;
}

export interface GitChange {
	path:   string;
	status: 'M' | 'A' | 'U';
}

export interface GitStatus {
	branch:  string;
	changes: GitChange[];
}

export interface ShellResult {
	output: string;
	error?: boolean;
}

export interface ShellEntry {
	id:      number;
	command: string;
	output:  string;
	error:   boolean;
}
