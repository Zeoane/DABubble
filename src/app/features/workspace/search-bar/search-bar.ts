import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ChannelService } from '../../../core/services/channel.service';
import { ProfileViewService } from '../../../core/services/profile-view.service';
import { SearchHit, SearchService } from '../../../core/services/search.service';
import { UserService } from '../../../core/services/user.service';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { MentionList, MentionOption } from '../mention-list/mention-list';

@Component({
  selector: 'app-search-bar',
  imports: [Avatar, MentionList],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
  host: { '(document:keydown.escape)': 'open.set(false)' },
})
export class SearchBar {
  private search = inject(SearchService);
  private users = inject(UserService);
  private channels = inject(ChannelService);
  private profiles = inject(ProfileViewService);
  private router = inject(Router);

  readonly placeholder = input('Devspace durchsuchen');
  readonly compact = input(false);

  query = signal('');
  open = signal(false);

  private term = computed(() => this.query().trim());
  tag = computed(() => (/^[@#]/.test(this.term()) ? this.term()[0] : null));
  private word = computed(() => this.term().replace(/^[@#]/, '').trim().toLowerCase());

  people = computed<MentionOption[]>(() => {
    if (this.tag() === '#' || (!this.tag() && !this.word())) return [];
    const me = this.users.uid();
    return this.users
      .contacts()
      .filter((user) => user.name.toLowerCase().includes(this.word()))
      .map((user) => ({ id: user.uid, value: user.name, label: user.uid === me ? user.name + ' (Du)' : user.name, avatar: user.avatar }));
  });

  channelHits = computed<MentionOption[]>(() => {
    if (this.tag() === '@' || (!this.tag() && !this.word())) return [];
    return this.channels
      .mine()
      .filter((channel) => channel.name.toLowerCase().includes(this.word()))
      .map((channel) => ({ id: channel.id, value: channel.name, label: channel.name }));
  });

  messageHits = computed(() => (this.tag() ? [] : this.search.find(this.term())));

  showList = computed(() => this.open() && this.term().length > 0);


  /** Starts loading the messages and shows the results. */
  onFocus(): void {
    this.search.active.set(true);
    this.open.set(true);
  }


  /** Takes over the typed text. */
  onInput(value: string): void {
    this.query.set(value);
    this.open.set(true);
  }


  /** Opens the profile card of the person. */
  openPerson(option: MentionOption): void {
    this.profiles.open(option.id);
    this.reset();
  }


  /** Opens the channel. */
  openChannel(option: MentionOption): void {
    this.router.navigate(['/workspace/channel', option.id]);
    this.reset();
  }


  /** Opens the chat of the found message. */
  openMessage(hit: SearchHit): void {
    this.router.navigate(hit.chat.route);
    this.reset();
  }


  /** Name of the author of a found message. */
  authorName(hit: SearchHit): string {
    return this.users.users().find((user) => user.uid === hit.message.authorId)?.name ?? 'Unbekannt';
  }


  /** "07.11.26, 14:25" */
  when(hit: SearchHit): string {
    const date = hit.message.createdAt?.toDate();
    if (!date) return '';
    const day = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
    return day + ', ' + date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }


  /** Empties the field and closes the results. */
  private reset(): void {
    this.query.set('');
    this.open.set(false);
  }
}
