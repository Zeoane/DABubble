import { Component, computed, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppUser } from '../../../core/models/user-profile';
import { ChannelService } from '../../../core/services/channel.service';
import { UserService } from '../../../core/services/user.service';
import { channelNameError, channelNameValidators } from '../channel-name';
import { PeoplePicker } from '../people-picker/people-picker';

/**
 * "Channel erstellen" (Figma 37) followed by "Leute hinzufügen" (Figma 38).
 */
@Component({
  selector: 'app-create-channel',
  imports: [ReactiveFormsModule, PeoplePicker],
  templateUrl: './create-channel.html',
  styleUrl: './create-channel.scss',
  host: { '(document:keydown.escape)': 'close()' },
})
export class CreateChannel {
  private channels = inject(ChannelService);
  private users = inject(UserService);
  private router = inject(Router);

  readonly closed = output<void>();

  step = signal<'details' | 'members'>('details');
  addAll = signal(true);
  picked = signal<AppUser[]>([]);
  saving = signal(false);
  failed = signal(false);

  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: channelNameValidators(this.channels),
    }),
    description: new FormControl('', { nonNullable: true }),
  });

  /** Everyone who could join: all members except me and guests. */
  others = computed(() => this.users.contacts().filter((u) => u.uid !== this.users.uid()));

  canCreate = computed(() => !this.saving() && (this.addAll() || this.picked().length > 0));


  close(): void {
    this.closed.emit();
  }


  nameError(): string | null {
    return channelNameError(this.form.controls.name);
  }


  /** Step 1 → step 2, only with a valid, free name. */
  next(): void {
    this.form.markAllAsTouched();
    this.form.controls.name.updateValueAndValidity();
    if (this.form.valid) this.step.set('members');
  }


  /**
   * Creates the channel and opens it.
   */
  async create(): Promise<void> {
    if (!this.canCreate()) return;
    this.saving.set(true);
    this.failed.set(false);
    try {
      const id = await this.channels.create(this.form.value.name ?? '', this.form.value.description ?? '', this.memberIds());
      this.close();
      this.router.navigate(['/workspace/channel', id]);
    } catch {
      this.failed.set(true);
      this.saving.set(false);
    }
  }


  private memberIds(): string[] {
    return (this.addAll() ? this.others() : this.picked()).map((user) => user.uid);
  }
}
