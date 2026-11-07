import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ChannelService } from '../../../core/services/channel.service';
import { PresenceService } from '../../../core/services/presence.service';
import { UserService } from '../../../core/services/user.service';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { CreateChannel } from '../create-channel/create-channel';
import { SearchBar } from '../search-bar/search-bar';

@Component({
  selector: 'app-workspace-menu',
  imports: [Avatar, SearchBar, CreateChannel, RouterLink, RouterLinkActive],
  templateUrl: './workspace-menu.html',
  styleUrl: './workspace-menu.scss',
})
export class WorkspaceMenu {
  users = inject(UserService);
  presence = inject(PresenceService);
  channels = inject(ChannelService);

  creating = signal(false);

  channelsOpen = signal(true);
  contactsOpen = signal(true);


  /** Opens or closes the channel list. */
  toggleChannels(): void {
    this.channelsOpen.update((open) => !open);
  }


  /** Opens or closes the list of direct messages. */
  toggleContacts(): void {
    this.contactsOpen.update((open) => !open);
  }
}
