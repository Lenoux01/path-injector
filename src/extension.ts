import * as vscode from "vscode";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log("Extension activated");

  let disposable = vscode.workspace.onDidSaveTextDocument(
    async (document: vscode.TextDocument) => {
      if (
        !["plaintext", "javascript", "typescript", "python"].includes(
          document.languageId
        )
      ) {
        return;
      }

      console.log("Supported file saved:", document.uri.fsPath);
      console.log("File saved:", document.uri.fsPath);

      const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
      if (workspaceFolder) {
        const relativePath = path.relative(
          workspaceFolder.uri.fsPath,
          document.uri.fsPath
        );
        console.log("Relative path:", relativePath);

        const firstLine = document.lineAt(0);
        if (!firstLine.text.startsWith("// Path:")) {
          const edit = new vscode.WorkspaceEdit();
          edit.insert(
            document.uri,
            new vscode.Position(0, 0),
            `// Path: ${relativePath}\n`
          );

          try {
            const success = await vscode.workspace.applyEdit(edit);
            if (success) {
              console.log("Path inserted successfully");
            } else {
              console.log("Failed to insert path");
            }
          } catch (error) {
            console.error("Error applying edit:", error);
          }
        } else {
          console.log("Path already exists at the top of the file");
        }
      } else {
        console.log("File is not part of a workspace");
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
