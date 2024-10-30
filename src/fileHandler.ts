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
  const secondLine =
    document.lineCount > 1 ? document.lineAt(1).text.trim() : "";

  // Handle Next.js directive cases
  const isUseClient =
    firstLineText === "'use client'" || firstLineText === '"use client"';
  const isUseServer =
    firstLineText === "'use server'" || firstLineText === '"use server"';
  const hasNextDirective = isUseClient || isUseServer;

  // If first line is a Next.js directive
  if (hasNextDirective) {
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

  // If first line is a Path comment and we need to add Next.js directive
  if (firstLineText.startsWith("// Path:")) {
    const nextLine = document.lineCount > 1 ? document.lineAt(1).text : "";
    const hasNextDirectiveBelow =
      nextLine.includes("'use client'") ||
      nextLine.includes('"use client"') ||
      nextLine.includes("'use server'") ||
      nextLine.includes('"use server"');

    if (hasNextDirectiveBelow) {
      // Rearrange: Move directive to top and update path
      const directive = nextLine.trim();
      return new vscode.TextEdit(
        new vscode.Range(0, 0, 2, 0),
        `${directive}\n// Path: ${relativePath}\n`
      );
    }

    // Just update path if needed
    const currentPath = firstLineText.substring("// Path:".length).trim();
    if (currentPath !== relativePath) {
      return new vscode.TextEdit(
        new vscode.Range(0, 0, 1, 0),
        `// Path: ${relativePath}\n`
      );
    }
    return undefined;
  }

  // If first line starts with any comment
  if (firstLineText.startsWith("//")) {
    return new vscode.TextEdit(
      new vscode.Range(0, 0, 1, 0),
      `// Path: ${relativePath}\n`
    );
  }

  // Default case: add path comment at the top
  return new vscode.TextEdit(
    new vscode.Range(0, 0, 0, 0),
    `// Path: ${relativePath}\n`
  );
}
