import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { WorkspaceHeader } from './header/workspace-header';
import { WorkspaceMenu } from './workspace-menu/workspace-menu';

/**
 * Workspace layout: header, menu with channels and direct messages, chat area.
 * On mobile only one of menu and chat is shown at a time.
 */
@Component({
  selector: 'app-workspace',
  imports: [WorkspaceHeader, WorkspaceMenu, RouterOutlet],
  templateUrl: './workspace.html',
  styleUrl: './workspace.scss',
})
export class Workspace {
  private router = inject(Router);

  menuOpen = signal(true);

  /** True while a channel or chat is open (decides the mobile view). */
  chatOpen = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.isChatUrl()),
    ),
    { initialValue: this.isChatUrl() },
  );


  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }


  private isChatUrl(): boolean {
    return this.router.url !== '/workspace';
  }
}
