import { Component, signal } from '@angular/core';
import { WorkspaceHeader } from './header/workspace-header';
import { WorkspaceMenu } from './workspace-menu/workspace-menu';

/**
 * Workspace layout: header, menu with channels and direct messages, chat area.
 */
@Component({
  selector: 'app-workspace',
  imports: [WorkspaceHeader, WorkspaceMenu],
  templateUrl: './workspace.html',
  styleUrl: './workspace.scss',
})
export class Workspace {
  menuOpen = signal(true);


  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }
}
