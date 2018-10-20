import * as vscode from "vscode";
import jcommand from "./jcommand";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.jcommand.edit", () => {
      jcommand.edit();
    }),
    vscode.commands.registerCommand("extension.jcommand.run", () => {
      jcommand.run();
    })
  );
}

export function deactivate() {}
