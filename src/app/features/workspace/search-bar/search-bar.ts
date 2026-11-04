import { Component, input } from '@angular/core';

/**
 * Search field of the workspace (Figma "Search bar"). The search itself follows later.
 */
@Component({
  selector: 'app-search-bar',
  template: `
    <label class="search" [class.compact]="compact()">
      <input type="text" [placeholder]="placeholder()" [attr.aria-label]="placeholder()" />
      <span class="icon" aria-hidden="true"></span>
    </label>
  `,
  styleUrl: './search-bar.scss',
})
export class SearchBar {
  readonly placeholder = input('Devspace durchsuchen');
  readonly compact = input(false);
}
