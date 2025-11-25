import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideMarkdown, MARKED_OPTIONS, CLIPBOARD_OPTIONS } from 'ngx-markdown';
import { NGX_MONACO_EDITOR_CONFIG } from 'ngx-monaco-editor-v2';
import { ClipboardButtonComponent } from './features/editor/clipboard-button/clipboard-button';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideMarkdown({
      markedOptions: {
        provide: MARKED_OPTIONS,
        useValue: {
          gfm: true,
          breaks: true,
          pedantic: false,
        },
      },
      clipboardOptions: {
        provide: CLIPBOARD_OPTIONS,
        useValue: {
          buttonComponent: ClipboardButtonComponent,
        },
      },
    }),
    {
      provide: NGX_MONACO_EDITOR_CONFIG,
      useValue: {
        baseUrl: 'vs',
        defaultOptions: { scrollBeyondLastLine: false },
        onMonacoLoad: () => { console.log((window as any).monaco); }
      }
    },
  ]
};
