import { Component, computed, input, model, signal } from '@angular/core';
import { AppUser } from '../../../core/models/user-profile';
import { Avatar } from '../../../shared/components/avatar/avatar';

@Component({
  selector: 'app-people-picker',
  imports: [Avatar],
  templateUrl: './people-picker.html',
  styleUrl: './people-picker.scss',
})
export class PeoplePicker {
  readonly candidates = input.required<AppUser[]>();
  readonly picked = model<AppUser[]>([]);

  query = signal('');

  suggestions = computed(() => {
    const term = this.query().trim().toLowerCase();
    const pickedIds = this.picked().map((u) => u.uid);
    if (!term) return [];
    return this.candidates().filter((u) => !pickedIds.includes(u.uid) && u.name.toLowerCase().includes(term));
  });


  /** Adds a person to the selection. */
  pick(user: AppUser): void {
    this.picked.update((list) => [...list, user]);
    this.query.set('');
  }


  /** Removes a person from the selection. */
  unpick(user: AppUser): void {
    this.picked.update((list) => list.filter((u) => u.uid !== user.uid));
  }
}
