import { Component, input } from '@angular/core';

/**
 * Short confirmation that slides in from the right, e.g. "Konto erfolgreich erstellt!".
 */
@Component({
  selector: 'app-toast',
  template: `
    <div class="backdrop">
      <p class="toast" role="status">{{ message() }}</p>
    </div>
  `,
  styleUrl: './toast.scss',
})
export class Toast {
  readonly message = input.required<string>();
}
