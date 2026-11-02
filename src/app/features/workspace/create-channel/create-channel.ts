import { Component, computed, inject, output, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppUser } from '../../../core/models/user-profile';
import { ChannelService, normalizeName } from '../../../core/services/channel.service';
import { UserService } from '../../../core/services/user.service';
import { Avatar } from '../../../shared/components/avatar/avatar';

const NAME_MAX = 30;

/**
 * "Channel erstellen" (Figma 37) followed by "Leute hinzufügen" (Figma 38).
 */
@Component({
  selector: 'app-create-channel',
  imports: [ReactiveFormsModule, Avatar],
  templateUrl: './create-channel.html',
  styleUrl: './create-channel.scss',
  host: { '(document:keydown.escape)': 'close()' },
})
export class CreateChannel {
  private channels = inject(ChannelService);
  private users = inject(UserService);
  private router = inject(Router);

  readonly closed = output<void>();
  readonly nameMax = NAME_MAX;

  step = signal<'details' | 'members'>('details');
  addAll = signal(true);
  picked = signal<AppUser[]>([]);
  query = signal('');
  saving = signal(false);
  failed = signal(false);

  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(NAME_MAX), (c) => this.uniqueName(c)],
    }),
    description: new FormControl('', { nonNullable: true }),
  });

  /** Everyone who could join: all members except me and guests. */
  private others = computed(() => this.users.contacts().filter((u) => u.uid !== this.users.uid()));

  suggestions = computed(() => {
    const term = this.query().trim().toLowerCase();
    const pickedIds = this.picked().map((u) => u.uid);
    if (!term) return [];
    return this.others().filter((u) => !pickedIds.includes(u.uid) && u.name.toLowerCase().includes(term));
  });

  canCreate = computed(() => !this.saving() && (this.addAll() || this.picked().length > 0));


  close(): void {
    this.closed.emit();
  }


  nameError(): string | null {
    const name = this.form.controls.name;
    if (!name.invalid || !(name.touched || name.dirty)) return null;
    if (name.hasError('taken')) return '*Diesen Channel-Namen gibt es schon. Bitte wähle einen anderen.';
    if (name.hasError('maxlength')) return `*Der Name darf höchstens ${NAME_MAX} Zeichen lang sein.`;
    return '*Bitte gib einen Channel-Namen ein.';
  }


  /** Step 1 → step 2, only with a valid, free name. */
  next(): void {
    this.form.markAllAsTouched();
    this.form.controls.name.updateValueAndValidity();
    if (this.form.valid) this.step.set('members');
  }


  pick(user: AppUser): void {
    this.picked.update((list) => [...list, user]);
    this.query.set('');
  }


  unpick(user: AppUser): void {
    this.picked.update((list) => list.filter((u) => u.uid !== user.uid));
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


  private uniqueName(control: AbstractControl): ValidationErrors | null {
    const name = normalizeName(control.value ?? '');
    if (!name) return { required: true };
    return this.channels.isNameTaken(name) ? { taken: true } : null;
  }
}
