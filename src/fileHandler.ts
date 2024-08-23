// Path: src/fileHandler.ts
import * as vscode from "vscode";
import * as path from "path";
import { isFileExcluded, isSupportedLanguage } from "./utils";

export async function handleWillSaveTextDocument(
  event: vscode.TextDocumentWillSaveEvent
) {
  const document = event.document;
  const fileName = path.basename(document.uri.fsPath);
  const fileExtension = path.extname(document.uri.fsPath).toLowerCase();

  if (
    isFileExcluded(fileName, fileExtension) ||
    !isSupportedLanguage(document.languageId)
  ) {
    return;
  }

  console.log("Supported file about to be saved:", document.uri.fsPath);

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
  if (workspaceFolder) {
    const relativePath = path.relative(
      workspaceFolder.uri.fsPath,
      document.uri.fsPath
    );
    console.log("Relative path:", relativePath);

    const edit = createOrUpdatePathEdit(document, relativePath);
    if (edit) {
      event.waitUntil(Promise.resolve([edit]));
      console.log("Path insertion or update queued");
    }
  } else {
    console.log("File is not part of a workspace");
  }
}

function createOrUpdatePathEdit(
  document: vscode.TextDocument,
  relativePath: string
): vscode.TextEdit | undefined {
  const firstLine = document.lineAt(0);
  const firstLineText = firstLine.text.trim();

  if (firstLineText.startsWith("// Path:")) {
    const currentPath = firstLineText.substring("// Path:".length).trim();
    if (currentPath !== relativePath) {
      return new vscode.TextEdit(
        new vscode.Range(0, 0, 1, 0),
        `// Path: ${relativePath}\n`
      );
    } else {
      console.log("Path is up to date");
      return undefined;
    }
  } else if (firstLineText.startsWith("//")) {
    return new vscode.TextEdit(
      new vscode.Range(0, 0, 1, 0),
      `// Path: ${relativePath}\n`
    );
  } else {
    return new vscode.TextEdit(
      new vscode.Range(0, 0, 0, 0),
      `// Path: ${relativePath}\n`
    );
  }
}
