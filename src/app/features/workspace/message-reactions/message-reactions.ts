import { Component, computed, inject, input, output, signal } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { EmojiPicker } from '../emoji-picker/emoji-picker';
import { EMOJIS } from '../../../core/services/recent-emojis.service';

const MAX_DESKTOP = 20;

interface Reaction {
  emoji: string;
  count: number;
  mine: boolean;
  names: string;
  verb: string;
}

@Component({
  selector: 'app-message-reactions',
  imports: [EmojiPicker],
  templateUrl: './message-reactions.html',
  styleUrl: './message-reactions.scss',
})
export class MessageReactions {
  private users = inject(UserService);

  readonly reactions = input<Record<string, string[]>>({});
  readonly toggled = output<string>();

  picking = signal(false);
  expanded = signal(false);

  list = computed<Reaction[]>(() =>
    Object.entries(this.reactions())
      .filter(([, ids]) => ids.length > 0)
      .sort(([a], [b]) => order(a) - order(b))
      .map(([emoji, ids]) => this.describe(emoji, ids))
      .slice(0, MAX_DESKTOP),
  );


  /** Closes the picker and adds the chosen reaction. */
  pick(emoji: string): void {
    this.picking.set(false);
    this.toggled.emit(emoji);
  }


  /** Reaction with count and the names of everyone who reacted. */
  private describe(emoji: string, ids: string[]): Reaction {
    const me = this.users.uid();
    const others = ids.filter((id) => id !== me).map((id) => this.nameOf(id));
    const mine = ids.includes(me ?? '');
    const names = [...others, ...(mine ? ['Du'] : [])];
    const verb = names.length > 1 ? 'haben' : mine ? 'hast' : 'hat';
    return { emoji, count: ids.length, mine, names: joinNames(names), verb };
  }


  /** Name of a member, or "Unbekannt". */
  private nameOf(uid: string): string {
    return this.users.users().find((user) => user.uid === uid)?.name ?? 'Unbekannt';
  }
}


/** Fixed order, because Firestore map keys come back in any order. */
function order(emoji: string): number {
  const index = EMOJIS.indexOf(emoji);
  return index < 0 ? EMOJIS.length : index;
}


/** "Sofia Müller", "Noah Braun und Du", "A, B und C" */
function joinNames(names: string[]): string {
  if (names.length < 2) return names[0] ?? '';
  return names.slice(0, -1).join(', ') + ' und ' + names.at(-1);
}
