// Path: src/extension.ts
import * as vscode from "vscode";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log("Extension activated");

  let disposable = vscode.workspace.onWillSaveTextDocument(
    async (event: vscode.TextDocumentWillSaveEvent) => {
      const document = event.document;
      const supportedLanguages = [
        "plaintext",
        "javascript",
        "typescript",
        "python",
        "typescriptreact",
        "javascriptreact",
        "prisma",
        "csharp",
        "java",
        "cpp",
        "c",
        "go",
        "ruby",
        "php",
        "swift",
        "rust",
        "kotlin",
        "dart",
        "html",
        "css",
        "scss",
        "less",
        "json",
        "yaml",
        "markdown",
      ];

      if (!supportedLanguages.includes(document.languageId)) {
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

        const firstLine = document.lineAt(0);
        const firstLineText = firstLine.text.trim();

        let edit: vscode.TextEdit;

        if (
          firstLineText.startsWith("//") &&
          !firstLineText.startsWith("// Path:")
        ) {
          // Remove the existing comment
          edit = new vscode.TextEdit(
            new vscode.Range(0, 0, 1, 0),
            `// Path: ${relativePath}\n`
          );
        } else if (!firstLineText.startsWith("// Path:")) {
          // Insert the new path comment
          edit = new vscode.TextEdit(
            new vscode.Range(0, 0, 0, 0),
            `// Path: ${relativePath}\n`
          );
        } else {
          console.log("Path already exists at the top of the file");
          return;
        }

        event.waitUntil(Promise.resolve([edit]));
        console.log("Path insertion or update queued");
      } else {
        console.log("File is not part of a workspace");
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
