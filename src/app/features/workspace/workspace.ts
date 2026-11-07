import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { WorkspaceHeader } from './header/workspace-header';
import { MemberProfile } from './member-profile/member-profile';
import { PresenceService } from '../../core/services/presence.service';
import { ThreadTarget, ThreadView } from './thread-view/thread-view';
import { WorkspaceMenu } from './workspace-menu/workspace-menu';

@Component({
  selector: 'app-workspace',
  imports: [WorkspaceHeader, WorkspaceMenu, RouterOutlet, ThreadView, MemberProfile],
  templateUrl: './workspace.html',
  styleUrl: './workspace.scss',
})
export class Workspace {
  private router = inject(Router);

  /** Starts reporting the own online status. */
  constructor() {
    inject(PresenceService).start();
  }


  menuOpen = signal(true);

  private url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  chatOpen = computed(() => this.url().split('?')[0] !== '/workspace');
  thread = computed(() => this.threadOf(this.url()));


  /** Opens or closes the workspace menu. */
  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }


  /** "/workspace/channel/abc?thread=m1" → channel abc, message m1. */
  private threadOf(url: string): ThreadTarget | null {
    const tree = this.router.parseUrl(url);
    const messageId = tree.queryParamMap.get('thread');
    const segments = tree.root.children['primary']?.segments.map((segment) => segment.path) ?? [];
    const [, kind, chatId] = segments;
    if (!messageId || !chatId) return null;
    if (kind === 'channel') return { kind: 'channel', chatId, messageId };
    return kind === 'dm' ? { kind: 'dm', chatId, messageId } : null;
  }
}
