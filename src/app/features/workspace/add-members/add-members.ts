import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Channel } from '../../../core/models/channel';
import { AppUser } from '../../../core/models/user-profile';
import { ChannelService } from '../../../core/services/channel.service';
import { UserService } from '../../../core/services/user.service';
import { PeoplePicker } from '../people-picker/people-picker';

/**
 * "Leute hinzufügen" to an existing channel (Figma 41 / 41b).
 */
@Component({
  selector: 'app-add-members',
  imports: [PeoplePicker],
  templateUrl: './add-members.html',
  styleUrl: './add-members.scss',
  host: { '(document:keydown.escape)': 'close()' },
})
export class AddMembers {
  private channels = inject(ChannelService);
  private users = inject(UserService);

  readonly channel = input.required<Channel>();
  readonly closed = output<void>();

  picked = signal<AppUser[]>([]);
  saving = signal(false);
  failed = signal(false);

  /** Everyone with an account who is not in the channel yet. */
  candidates = computed(() => this.users.contacts().filter((user) => !this.channel().members.includes(user.uid)));


  close(): void {
    this.closed.emit();
  }


  async add(): Promise<void> {
    if (!this.picked().length || this.saving()) return;
    this.saving.set(true);
    this.failed.set(false);
    try {
      await this.channels.addMembers(this.channel().id, this.picked().map((user) => user.uid));
      this.close();
    } catch {
      this.failed.set(true);
      this.saving.set(false);
    }
  }
}
