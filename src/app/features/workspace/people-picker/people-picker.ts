import { Component, computed, input, model, signal } from '@angular/core';
import { AppUser } from '../../../core/models/user-profile';
import { Avatar } from '../../../shared/components/avatar/avatar';

/**
 * Name field with chips and a suggestion list (Figma 38 / 41: "Name eingeben").
 */
@Component({
  selector: 'app-people-picker',
  imports: [Avatar],
  templateUrl: './people-picker.html',
  styleUrl: './people-picker.scss',
})
export class PeoplePicker {
  /** Everyone who may be picked. */
  readonly candidates = input.required<AppUser[]>();
  readonly picked = model<AppUser[]>([]);

  query = signal('');

  suggestions = computed(() => {
    const term = this.query().trim().toLowerCase();
    const pickedIds = this.picked().map((u) => u.uid);
    if (!term) return [];
    return this.candidates().filter((u) => !pickedIds.includes(u.uid) && u.name.toLowerCase().includes(term));
  });


  pick(user: AppUser): void {
    this.picked.update((list) => [...list, user]);
    this.query.set('');
  }


  unpick(user: AppUser): void {
    this.picked.update((list) => list.filter((u) => u.uid !== user.uid));
  }
}
