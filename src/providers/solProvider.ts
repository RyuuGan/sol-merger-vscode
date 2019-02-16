import vscode from 'vscode';

export const solProvider = new class implements vscode.TextDocumentContentProvider {

  // emitter and its event
  onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
  onDidChange = this.onDidChangeEmitter.event;

  provideTextDocumentContent(uri: vscode.Uri): string {
    return uri.query || '';
  }
}