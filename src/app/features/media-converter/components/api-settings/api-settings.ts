import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudConvertService } from '../../../../core/services/converters/cloudconvert-service';

@Component({
  selector: 'app-api-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="api-settings mb-4 p-2 bg-black/20 rounded text-xs">
      <details>
        <summary class="cursor-pointer text-gray-400 hover:text-white flex items-center gap-2">
          <span>⚙️ Paramètres API (CloudConvert)</span>
          @if(apiConfigured()) { <span class="text-green-400">✓ Actif</span> }
        </summary>
        <div class="mt-2">
          <input 
            #apiKeyInput
            type="password" 
            placeholder="Clé API CloudConvert"
            class="w-full p-1 bg-gray-800 border border-gray-700 rounded text-white mb-1"
            (change)="setApiKey(apiKeyInput.value)"
          >
          <p class="text-gray-500">Nécessaire pour PDF vers DOCX haute fidélité.</p>
          @if(apiQuota()) {
            <p class="text-gray-400">Crédits restants : {{ apiQuota() }}</p>
          }
        </div>
      </details>
    </div>
  `
})
export class ApiSettingsComponent {
  private cloudConvert = inject(CloudConvertService);
  
  apiConfigured = this.cloudConvert.isConfigured;
  apiQuota = this.cloudConvert.quotaRemaining;

  setApiKey(key: string) {
    this.cloudConvert.setApiKey(key);
  }
}
