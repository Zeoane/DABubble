import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from '../../../shared/components/logo/logo';
import { ProfileMenu } from '../profile-menu/profile-menu';
import { SearchBar } from '../search-bar/search-bar';

@Component({
  selector: 'app-workspace-header',
  imports: [Logo, SearchBar, ProfileMenu, RouterLink],
  template: `
    <app-logo class="desktop-logo" link="/workspace" />
    @if (chatOpen()) {
      <a class="mobile-back" routerLink="/workspace" aria-label="Zurück zum Menü">
        <span class="back-icon" aria-hidden="true"></span>
        <img class="devspace-logo" src="img/workspace-logo.svg" alt="" />
        <span class="devspace-name">Devspace</span>
      </a>
    } @else {
      <app-logo class="mobile-logo" link="/workspace" [compact]="true" />
    }
    <app-search-bar class="search" />
    <app-profile-menu />
  `,
  styleUrl: './workspace-header.scss',
})
export class WorkspaceHeader {
  readonly chatOpen = input(false);
}
