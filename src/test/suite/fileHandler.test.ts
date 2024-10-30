// Path: src/test/suite/fileHandler.test.ts
import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import { handleWillSaveTextDocument } from "../../fileHandler";
import { isFileExcluded, isSupportedLanguage } from "../../utils";

suite("File Handler Test Suite", () => {
  test("isFileExcluded should correctly identify excluded files", () => {
    assert.strictEqual(isFileExcluded("test.config.js", ".js"), true);
    assert.strictEqual(isFileExcluded("test.ts", ".ts"), false);
  });

  test("isSupportedLanguage should correctly identify supported languages", () => {
    assert.strictEqual(isSupportedLanguage("javascript"), true);
    assert.strictEqual(isSupportedLanguage("plaintext"), true);
    assert.strictEqual(isSupportedLanguage("unsupported"), false);
  });

  test("handleWillSaveTextDocument should not modify excluded files", async () => {
    const document = {
      uri: vscode.Uri.file("/test/test.config.js"),
      languageId: "javascript",
      getText: () => 'console.log("Hello");',
      lineAt: (line: number) => ({ text: 'console.log("Hello");' }),
    };

    const event = {
      document: document as any,
      waitUntil: (promise: Thenable<any>) => {},
    };

    await handleWillSaveTextDocument(event as any);
    // Assert that no changes were made (you might need to modify the function to return a boolean indicating if changes were made)
  });

  test("handleWillSaveTextDocument should add Path comment to supported files", async () => {
    const document = {
      uri: vscode.Uri.file("/workspace/test/test.js"),
      languageId: "javascript",
      getText: () => 'console.log("Hello");',
      lineAt: (line: number) => ({ text: 'console.log("Hello");' }),
    };

    const workspaceFolder = {
      uri: vscode.Uri.file("/workspace"),
      name: "test",
      index: 0,
    };

    // Mock vscode.workspace.getWorkspaceFolder
    const originalGetWorkspaceFolder = vscode.workspace.getWorkspaceFolder;
    vscode.workspace.getWorkspaceFolder = (uri: vscode.Uri) => workspaceFolder;

    let editsMade: vscode.TextEdit[] | undefined;

    const event = {
      document: document as any,
      waitUntil: (promise: Thenable<vscode.TextEdit[]>) => {
        promise.then((edits) => {
          editsMade = edits;
        });
      },
    };

    await handleWillSaveTextDocument(event as any);

    // Restore original function
    vscode.workspace.getWorkspaceFolder = originalGetWorkspaceFolder;

    assert.strictEqual(editsMade?.length, 1);
    assert.strictEqual(editsMade?.[0].newText, "// Path: test/test.js\n");
  });

  test("handleWillSaveTextDocument should not modify files with existing Path comment", async () => {
    const document = {
      uri: vscode.Uri.file("/workspace/test/test.js"),
      languageId: "javascript",
      getText: () => '// Path: test/test.js\nconsole.log("Hello");',
      lineAt: (line: number) => ({ text: "// Path: test/test.js" }),
    };

    const workspaceFolder = {
      uri: vscode.Uri.file("/workspace"),
      name: "test",
      index: 0,
    };

    // Mock vscode.workspace.getWorkspaceFolder
    const originalGetWorkspaceFolder = vscode.workspace.getWorkspaceFolder;
    vscode.workspace.getWorkspaceFolder = (uri: vscode.Uri) => workspaceFolder;

    let editsMade: vscode.TextEdit[] | undefined;

    const event = {
      document: document as any,
      waitUntil: (promise: Thenable<vscode.TextEdit[]>) => {
        promise.then((edits) => {
          editsMade = edits;
        });
      },
    };

    await handleWillSaveTextDocument(event as any);

    // Restore original function
    vscode.workspace.getWorkspaceFolder = originalGetWorkspaceFolder;

    assert.strictEqual(editsMade, undefined);
  });

  test("handleWillSaveTextDocument should handle Next.js directives correctly", async () => {
    const document = {
      uri: vscode.Uri.file("/workspace/test/component.tsx"),
      languageId: "typescriptreact",
      getText: () => "'use client'\nconsole.log('Hello');",
      lineAt: (line: number) => {
        if (line === 0) {
          return { text: "'use client'" };
        }
        return { text: "console.log('Hello');" };
      },
    };

    const workspaceFolder = {
      uri: vscode.Uri.file("/workspace"),
      name: "test",
      index: 0,
    };

    // Mock vscode.workspace.getWorkspaceFolder
    const originalGetWorkspaceFolder = vscode.workspace.getWorkspaceFolder;
    vscode.workspace.getWorkspaceFolder = (uri: vscode.Uri) => workspaceFolder;

    let editsMade: vscode.TextEdit[] | undefined;

    const event = {
      document: document as any,
      waitUntil: (promise: Thenable<vscode.TextEdit[]>) => {
        promise.then((edits) => {
          editsMade = edits;
        });
      },
    };

    await handleWillSaveTextDocument(event as any);

    // Restore original function
    vscode.workspace.getWorkspaceFolder = originalGetWorkspaceFolder;

    assert.strictEqual(editsMade?.length, 1);
    assert.strictEqual(editsMade?.[0].newText, "// Path: test/component.tsx\n");
  });

  test("isSupportedLanguage should support PHP and Vue files", () => {
    assert.strictEqual(isSupportedLanguage("php"), true);
    assert.strictEqual(isSupportedLanguage("vue"), true);
  });
});
