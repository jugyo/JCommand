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

const getLineNumber = () => {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    return editor.selection.active.line;
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

const createCommand = (template: string, params: { [key: string]: string }) => {
  let command = template;
  for (const key in params) {
    const value = params[key];
    if (value !== undefined && value !== null) {
      command = command.replace(key, value);
    } else {
      command = command.replace(key, "");
    }
  }
  return command;
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

    let template = await vscode.window.showQuickPick(items);

    if (template) {
      const activeFile = await getActiveFilePath();
      const lineNumber = getLineNumber();
      const selectedText = getSelectedText();

      const command = createCommand(template, {
        "%f": activeFile || "",
        "%l": lineNumber ? lineNumber.toString() : "",
        "%s": selectedText || "",
      });

      runInTerminal(command);
      updateHistory(template);
    }
  },
};

export default jcommand;
