import * as vscode from "vscode";
import { handleWillSaveTextDocument } from "./fileHandler";

export function activate(context: vscode.ExtensionContext) {
  console.log("Extension activated");

  let disposable = vscode.workspace.onWillSaveTextDocument(
    handleWillSaveTextDocument
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
