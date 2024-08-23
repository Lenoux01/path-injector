// Path: src/extension.ts
import * as vscode from "vscode";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log("Extension activated");

  let disposable = vscode.workspace.onWillSaveTextDocument(
    async (event: vscode.TextDocumentWillSaveEvent) => {
      const document = event.document;
      const supportedLanguages = [
        "c",
        "cpp",
        "csharp",
        "css",
        "dart",
        "go",
        "html",
        "java",
        "javascript",
        "javascriptreact",
        "kotlin",
        "less",
        "php",
        "plaintext",
        "prisma",
        "python",
        "ruby",
        "rust",
        "scss",
        "swift",
        "typescript",
        "typescriptreact",
      ];

      const excludedExtensions = [
        ".config.js",
        ".config.ts",
        ".css",
        ".env",
        ".gif",
        ".gitignore",
        ".jpeg",
        ".jpg",
        ".json",
        ".lock",
        ".md",
        ".png",
        ".rc",
        ".sh",
        ".svg",
        ".yaml",
        ".yml",
      ];

      const fileName = path.basename(document.uri.fsPath);
      const fileExtension = path.extname(document.uri.fsPath).toLowerCase();

      // Check if the file should be excluded
      if (
        excludedExtensions.some(
          (ext) => fileName.endsWith(ext) || fileExtension === ext
        )
      ) {
        console.log("File excluded:", document.uri.fsPath);
        return;
      }

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
