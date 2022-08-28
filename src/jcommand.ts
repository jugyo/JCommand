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
    vscode.window.terminals.find((t) => t.name === terminalName) ||
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

const getSelectedText = () => {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    if (selectedText.length > 0) {
      return selectedText;
    }
  }
};

const history: string[] = [];
const historyLimit = 10;
const updateHistory = (command: string) => {
  history.splice(historyLimit, history.length - historyLimit);
  history.unshift(command);
};

const getIndex = (command: string) => {
  const index = history.indexOf(command);
  return index >= 0 ? index : Number.POSITIVE_INFINITY;
};

const jcommand = {
  edit: async () => {
    if (!fs.pathExistsSync(commandFilePath)) {
      await fs.outputFile(commandFilePath, template);
    }

    const doc = await vscode.workspace.openTextDocument(
      vscode.Uri.file(commandFilePath)
    );
    vscode.window.showTextDocument(doc);
  },

  run: async () => {
    const data = await fs.readFile(commandFilePath, "utf8");
    const commands = JSON.parse(data) as string[];
    const items = commands.sort((a, b) => getIndex(a) - getIndex(b));

    let command = await vscode.window.showQuickPick(items);

    if (command) {
      const activeFile = await getActiveFilePath();
      let commandWithActiveFile = activeFile
        ? command.replace("%f", activeFile)
        : command.replace("%f", "");

      const selectedText = getSelectedText();
      commandWithActiveFile = selectedText
        ? commandWithActiveFile.replace("%s", selectedText)
        : commandWithActiveFile.replace("%s", "");

      runInTerminal(commandWithActiveFile);
      updateHistory(command);
    }
  },
};

export default jcommand;
