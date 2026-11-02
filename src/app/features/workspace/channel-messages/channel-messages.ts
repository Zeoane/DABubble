import { Component, ElementRef, computed, effect, inject, input, viewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { Channel } from '../../../core/models/channel';
import { Message } from '../../../core/models/message';
import { MessageService } from '../../../core/services/message.service';
import { UserService } from '../../../core/services/user.service';
import { MessageItem } from '../message-item/message-item';

interface Day {
  label: string;
  messages: Message[];
}

/**
 * Start of the channel followed by its messages, grouped by day
 * (Figma "Time separator"). Scrolls to the newest message.
 */
@Component({
  selector: 'app-channel-messages',
  imports: [MessageItem],
  templateUrl: './channel-messages.html',
  styleUrl: './channel-messages.scss',
})
export class ChannelMessages {
  private messageService = inject(MessageService);
  users = inject(UserService);

  readonly channel = input.required<Channel>();
  private scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');

  private channelId = computed(() => this.channel().id);
  messages = toSignal(toObservable(this.channelId).pipe(switchMap((id) => this.messageService.watch(id))), {
    initialValue: [] as Message[],
  });

  days = computed(() => groupByDay(this.messages()));

  constructor() {
    effect(() => {
      this.messages();
      const element = this.scroller().nativeElement;
      setTimeout(() => (element.scrollTop = element.scrollHeight));
    });
  }


  author(message: Message) {
    return this.users.users().find((user) => user.uid === message.authorId);
  }


  /** "Du hast diesen Channel heute erstellt." or "Noah Braun hat … am 14. Januar 2026 erstellt." */
  createdText(): string {
    const channel = this.channel();
    const creator = channel.createdBy === this.users.uid() ? 'Du hast' : `${this.creatorName()} hat`;
    const date = channel.createdAt?.toDate() ?? new Date();
    const when = isSameDay(date, new Date()) ? 'heute' : 'am ' + formatDate(date, false);
    return `${creator} diesen Channel ${when} erstellt. Das ist der Anfang des Channels`;
  }


  private creatorName(): string {
    return this.users.users().find((user) => user.uid === this.channel().createdBy)?.name ?? 'Jemand';
  }
}


function groupByDay(messages: Message[]): Day[] {
  const days: Day[] = [];
  for (const message of messages) {
    const label = dayLabel(message.createdAt?.toDate() ?? new Date());
    const last = days.at(-1);
    if (last?.label === label) last.messages.push(message);
    else days.push({ label, messages: [message] });
  }
  return days;
}


/** "Heute", "Gestern" or "Dienstag, 14. Januar" */
function dayLabel(date: Date): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, new Date())) return 'Heute';
  if (isSameDay(date, yesterday)) return 'Gestern';
  return formatDate(date, true);
}


function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}


function formatDate(date: Date, withWeekday: boolean): string {
  const year = date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric';
  const weekday = withWeekday ? 'long' : undefined;
  return date.toLocaleDateString('de-DE', { weekday, day: 'numeric', month: 'long', year });
}
