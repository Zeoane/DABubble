import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Channel } from '../../../core/models/channel';
import { AppUser } from '../../../core/models/user-profile';
import { ChannelService } from '../../../core/services/channel.service';
import { UserService } from '../../../core/services/user.service';
import { channelNameError, channelNameValidators } from '../channel-name';
import { MemberList } from '../member-list/member-list';

@Component({
  selector: 'app-channel-edit',
  imports: [ReactiveFormsModule, MemberList],
  templateUrl: './channel-edit.html',
  styleUrl: './channel-edit.scss',
  host: { '(document:keydown.escape)': 'close()' },
})
export class ChannelEdit {
  private channels = inject(ChannelService);
  private users = inject(UserService);
  private router = inject(Router);

  readonly channel = input.required<Channel>();
  readonly members = input.required<AppUser[]>();
  readonly closed = output<void>();
  readonly addMembers = output<void>();

  editingName = signal(false);
  editingDescription = signal(false);
  failed = signal(false);

  name = new FormControl('', { nonNullable: true, validators: channelNameValidators(this.channels, () => this.channel().id) });
  description = new FormControl('', { nonNullable: true });

  creator = computed(() => this.users.users().find((user) => user.uid === this.channel().createdBy)?.name ?? 'Unbekannt');


  /** Closes the channel details. */
  close(): void {
    this.closed.emit();
  }


  /** Error text for the channel name, or null. */
  nameError(): string | null {
    return channelNameError(this.name);
  }


  /** Opens the name for editing. */
  editName(): void {
    this.name.reset(this.channel().name);
    this.editingName.set(true);
  }


  /** Opens the description for editing. */
  editDescription(): void {
    this.description.reset(this.channel().description);
    this.editingDescription.set(true);
  }


  /** Saves the new name if it is valid and not taken. */
  async saveName(): Promise<void> {
    this.name.markAsTouched();
    this.name.updateValueAndValidity();
    if (this.name.invalid) return;
    if (await this.run(() => this.channels.rename(this.channel().id, this.name.value))) this.editingName.set(false);
  }


  /** Saves the new description. */
  async saveDescription(): Promise<void> {
    if (await this.run(() => this.channels.describe(this.channel().id, this.description.value))) {
      this.editingDescription.set(false);
    }
  }


  /** Leaves the channel and goes back to the workspace. */
  async leave(): Promise<void> {
    if (!(await this.run(() => this.channels.leave(this.channel().id)))) return;
    this.close();
    this.router.navigate(['/workspace']);
  }


  /** Runs a Firestore change; false (and an error text) when it failed. */
  private async run(change: () => Promise<void>): Promise<boolean> {
    this.failed.set(false);
    try {
      await change();
      return true;
    } catch {
      this.failed.set(true);
      return false;
    }
  }
}
