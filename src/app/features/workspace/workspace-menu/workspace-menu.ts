import { Component, inject, signal } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { SearchBar } from '../search-bar/search-bar';

/**
 * Left menu with Devspace, channels and direct messages
 * (Figma 32. Final menu UX). Channels are added in the next step.
 */
@Component({
  selector: 'app-workspace-menu',
  imports: [Avatar, SearchBar],
  templateUrl: './workspace-menu.html',
  styleUrl: './workspace-menu.scss',
})
export class WorkspaceMenu {
  users = inject(UserService);

  channelsOpen = signal(true);
  contactsOpen = signal(true);


  toggleChannels(): void {
    this.channelsOpen.update((open) => !open);
  }


  toggleContacts(): void {
    this.contactsOpen.update((open) => !open);
  }
}
