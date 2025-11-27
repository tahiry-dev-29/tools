import { Injectable } from '@angular/core';
import { editor, languages, Position } from 'monaco-editor';

@Injectable({
  providedIn: 'root'
})
export class MarkdownCompletionService {
  private emojiSuggestions = ['+1', '-1', 'smile', 'tada', 'thinking_face', 'heart'];

  constructor() { }

  registerCompletionProvider(): void {
    languages.registerCompletionItemProvider('markdown', {
      provideCompletionItems: (model: editor.ITextModel, position: Position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });

        const triggerIndex = textUntilPosition.lastIndexOf(':');
        if (triggerIndex === -1) {
          return { suggestions: [] };
        }

        const query = textUntilPosition.substring(triggerIndex + 1);
        if (query.includes(' ')) {
          return { suggestions: [] };
        }

        const suggestions: languages.CompletionItem[] = this.emojiSuggestions
          .filter(emoji => emoji.startsWith(query))
          .map(emoji => ({
            label: `:${emoji}:`,
            kind: languages.CompletionItemKind.Keyword,
            insertText: `${emoji}: `,
            range: {
              startLineNumber: position.lineNumber,
              startColumn: triggerIndex + 1,
              endLineNumber: position.lineNumber,
              endColumn: position.column
            }
          }));

        return { suggestions };
      }
    });
  }
}
