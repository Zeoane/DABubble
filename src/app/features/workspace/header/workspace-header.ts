import { Component } from '@angular/core';
import { Logo } from '../../../shared/components/logo/logo';
import { ProfileMenu } from '../profile-menu/profile-menu';
import { SearchBar } from '../search-bar/search-bar';

/**
 * Top bar: logo, search and profile menu (Figma 14., Search bar, 65.).
 */
@Component({
  selector: 'app-workspace-header',
  imports: [Logo, SearchBar, ProfileMenu],
  template: `
    <app-logo class="desktop-logo" link="/workspace" />
    <app-logo class="mobile-logo" link="/workspace" [compact]="true" />
    <app-search-bar class="search" />
    <app-profile-menu />
  `,
  styleUrl: './workspace-header.scss',
})
export class WorkspaceHeader {}
