import {
	Disposable,
	Range,
	languages,
	TextDocument,
	Uri,
	workspace,
	FileType,
	DocumentLinkProvider,
	DocumentLink,
	CancellationToken,
} from "vscode";
import { DOCUMENT_SELECTOR } from "./utils";

export class NginxDocumentLinkProvider implements DocumentLinkProvider {
	constructor(disposables: Disposable[]) {
		disposables.push(languages.registerDocumentLinkProvider(DOCUMENT_SELECTOR, this));
	}

	async provideDocumentLinks(document: TextDocument, token: CancellationToken) {
		const INCLUDE_REGEXP = /(include\s+['"]?)(\S+)(?:$|['";])/g;
		const code: string = document.getText();
		const result: DocumentLink[] = [];

		try {
			while (!token.isCancellationRequested) {
				const matched = INCLUDE_REGEXP.exec(code);
				if (!matched) break;

				const p = matched[2];
				const uri = Uri.joinPath(document.uri, "..", p);
				try {
					const stat = await workspace.fs.stat(uri);
					if (stat.type !== FileType.File && stat.type !== FileType.SymbolicLink) continue;
				} catch (error) {
					continue;
				}

				const offset1 = matched.index + matched[1].length;
				const offset2 = offset1 + matched[2].length;
				const range = new Range(document.positionAt(offset1), document.positionAt(offset2));

				result.push(new DocumentLink(range, uri));
			}
		} catch (ex) {
			console.error(ex);
		}
		return result;
	}

	resolveDocumentLink(link: DocumentLink) {
		return link;
	}
}

export class OpenRestyLuaFileLink implements DocumentLinkProvider {
	constructor(disposables: Disposable[]) {
		disposables.push(languages.registerDocumentLinkProvider(DOCUMENT_SELECTOR, this));
	}

	async provideDocumentLinks(document: TextDocument, token: CancellationToken) {
		const LUAFILE_REGEXP = /(by_lua_file\s+['"]?)(\S+)(?:$|['";])/g;
		const code: string = document.getText();
		const result: DocumentLink[] = [];

		try {
			while (!token.isCancellationRequested) {
				const matched = LUAFILE_REGEXP.exec(code);
				if (!matched) break;

				const p = matched[2];
				const uri = Uri.joinPath(document.uri, "..", "..", p);
				try {
					const stat = await workspace.fs.stat(uri);
					if (stat.type !== FileType.File && stat.type !== FileType.SymbolicLink) continue;
				} catch (error) {
					continue;
				}

				const offset1 = matched.index + matched[1].length;
				const offset2 = offset1 + matched[2].length;
				const range = new Range(document.positionAt(offset1), document.positionAt(offset2));

				result.push(new DocumentLink(range, uri));
			}
		} catch (ex) {
			console.error(ex);
		}
		return result;
	}

	resolveDocumentLink(link: DocumentLink) {
		return link;
	}
}
