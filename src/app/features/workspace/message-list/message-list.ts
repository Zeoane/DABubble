import { Component, ElementRef, computed, effect, inject, input, viewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { Message } from '../../../core/models/message';
import { MessageService } from '../../../core/services/message.service';
import { UserService } from '../../../core/services/user.service';
import { dayLabel } from '../../../core/utils/dates';
import { MessageItem } from '../message-item/message-item';

interface Day {
  label: string;
  messages: Message[];
}

@Component({
  selector: 'app-message-list',
  imports: [MessageItem],
  templateUrl: './message-list.html',
  styleUrl: './message-list.scss',
})
export class MessageList {
  private messageService = inject(MessageService);
  users = inject(UserService);

  readonly path = input.required<string>();
  private scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');

  messages = toSignal(toObservable(this.path).pipe(switchMap((path) => this.messageService.watch(path + '/messages'))), {
    initialValue: [] as Message[],
  });

  days = computed(() => groupByDay(this.messages()));

  /** Scrolls to the newest message whenever the list changes. */
  constructor() {
    effect(() => {
      this.messages();
      const element = this.scroller().nativeElement;
      setTimeout(() => (element.scrollTop = element.scrollHeight));
    });
  }


  /** Profile of the message author. */
  author(message: Message) {
    return this.users.users().find((user) => user.uid === message.authorId);
  }
}


/** Groups the messages by day for the date separators. */
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

