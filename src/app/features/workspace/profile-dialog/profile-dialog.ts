import { Component, computed, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppUser } from '../../../core/models/user-profile';
import { AuthService } from '../../../core/services/auth.service';
import { RegistrationService } from '../../../core/services/registration.service';
import { UserService } from '../../../core/services/user.service';
import { NAME_PATTERN } from '../../../core/validators/patterns';

/**
 * Own profile: view (Figma "Profile view main") and edit name and avatar
 * ("Dein Profil bearbeiten").
 */
@Component({
  selector: 'app-profile-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './profile-dialog.html',
  styleUrl: './profile-dialog.scss',
  host: { '(document:keydown.escape)': 'close()' },
})
export class ProfileDialog {
  private auth = inject(AuthService);
  private users = inject(UserService);
  private avatarList = inject(RegistrationService).avatars;

  readonly closed = output<void>();

  me = this.users.currentUser;
  editing = signal(false);
  saving = signal(false);
  failed = signal(false);
  avatar = signal('');
  name = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(NAME_PATTERN)],
  });
  form = new FormGroup({ name: this.name });

  /** The fixed avatars, plus the current picture if it is a Google photo. */
  avatars = computed(() => withCurrent(this.avatarList, this.me()?.avatar));


  startEditing(user: AppUser): void {
    this.name.reset(user.name);
    this.avatar.set(user.avatar);
    this.failed.set(false);
    this.editing.set(true);
  }


  cancel(): void {
    this.editing.set(false);
  }


  close(): void {
    this.closed.emit();
  }


  showNameError(): boolean {
    return this.name.invalid && (this.name.touched || this.name.dirty);
  }


  /**
   * Saves name and avatar; the header and menu update live from Firestore.
   */
  async save(): Promise<void> {
    this.name.markAsTouched();
    if (this.name.invalid || this.saving()) return;
    this.saving.set(true);
    try {
      await this.auth.updateOwnProfile(this.name.value.trim(), this.avatar());
      this.editing.set(false);
    } catch {
      this.failed.set(true);
    }
    this.saving.set(false);
  }
}


function withCurrent(avatars: string[], current?: string): string[] {
  return current && !avatars.includes(current) ? [current, ...avatars] : avatars;
}
