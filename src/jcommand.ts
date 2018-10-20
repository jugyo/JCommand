import * as vscode from "vscode";
import * as fs from "fs-extra";

const commandFilePath = `${process.env.HOME}/.vscode/jcommand.json`;
const template = `
[
  "pwd",
  "ls"
]
`;

const terminalName = "JCommand";
const runInTerminal = (command: string) => {
  const terminal =
    vscode.window.terminals.find(t => t.name === terminalName) ||
    vscode.window.createTerminal(terminalName);

  terminal.show();
  terminal.sendText(command);
};

const getActiveFilePath = () => {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    return vscode.workspace.asRelativePath(editor.document.fileName, false);
  }
};

const jcommand = {
  edit: async () => {
    if (!fs.existsSync(commandFilePath)) {
      await fs.outputFile(commandFilePath, template);
    }

    const doc = await vscode.workspace.openTextDocument(
      vscode.Uri.file(commandFilePath)
    );
    vscode.window.showTextDocument(doc);
  },

  run: async () => {
    const data = await fs.readFile(commandFilePath, "utf8");
    const commands = JSON.parse(data);
    console.log(commands);
    let command = await vscode.window.showQuickPick(commands);

    if (command) {
      const activeFile = await getActiveFilePath();
      if (activeFile) {
        command = command.replace("%", activeFile);
      } else {
        command = command.replace("%", "");
      }
      runInTerminal(command);
    }
  }
};

export default jcommand;
