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

  // Find all Path comments in the first few lines
  let pathCommentLines: number[] = [];
  for (let i = 0; i < Math.min(5, document.lineCount); i++) {
    const line = document.lineAt(i).text.trim();
    if (line.startsWith("// Path:")) {
      pathCommentLines.push(i);
    }
  }

  // Handle Next.js directive cases
  const isUseClient =
    firstLineText === "'use client'" || firstLineText === '"use client"';
  const isUseServer =
    firstLineText === "'use server'" || firstLineText === '"use server"';
  const hasNextDirective = isUseClient || isUseServer;

  // If there are multiple Path comments, we need to remove all but one
  if (pathCommentLines.length > 1) {
    // Create a composite edit that removes all Path comments
    const edit = new vscode.TextEdit(
      new vscode.Range(0, 0, Math.max(...pathCommentLines) + 1, 0),
      hasNextDirective
        ? `${firstLineText}\n// Path: ${relativePath}\n`
        : `// Path: ${relativePath}\n`
    );
    return edit;
  }

  // Handle Next.js directive cases
  if (hasNextDirective) {
    const secondLine =
      document.lineCount > 1 ? document.lineAt(1).text.trim() : "";
    if (secondLine.startsWith("// Path:")) {
      const currentPath = secondLine.substring("// Path:".length).trim();
      if (currentPath !== relativePath) {
        return new vscode.TextEdit(
          new vscode.Range(1, 0, 2, 0),
          `// Path: ${relativePath}\n`
        );
      }
      return undefined;
    } else {
      return new vscode.TextEdit(
        new vscode.Range(1, 0, 1, 0),
        `// Path: ${relativePath}\n`
      );
    }
  }

  // If first line is a Path comment
  if (firstLineText.startsWith("// Path:")) {
    const currentPath = firstLineText.substring("// Path:".length).trim();
    if (currentPath !== relativePath) {
      return new vscode.TextEdit(
        new vscode.Range(0, 0, 1, 0),
        `// Path: ${relativePath}\n`
      );
    }
    return undefined;
  }

  // Default case: add path comment at the top
  return new vscode.TextEdit(
    new vscode.Range(0, 0, 0, 0),
    `// Path: ${relativePath}\n`
  );
}
