import { Component, ElementRef, output, viewChild } from '@angular/core';

const HOLD_MS = 2500;
const EXIT_MS = 500;

/**
 * Splash screen before the login: the logo moves aside, the name slides out
 * of it, then both fly to the logo in the page header.
 */
@Component({
  selector: 'app-intro',
  templateUrl: './intro.html',
  styleUrl: './intro.scss',
})
export class Intro {
  readonly done = output<void>();

  private intro = viewChild.required<ElementRef<HTMLElement>>('intro');
  private icon = viewChild.required<ElementRef<HTMLElement>>('icon');
  private name = viewChild.required<ElementRef<HTMLElement>>('name');


  constructor() {
    setTimeout(() => this.exit(), HOLD_MS);
  }


  /**
   * Pins both parts where they are and lets them glide to the header logo.
   */
  private exit(): void {
    const targets = document.querySelectorAll<HTMLElement>('.header .logo img');
    if (targets.length < 2) {
      this.done.emit();
      return;
    }
    this.pin(this.icon().nativeElement, this.icon().nativeElement.getBoundingClientRect());
    this.pin(this.name().nativeElement, this.name().nativeElement.getBoundingClientRect());
    this.intro().nativeElement.classList.add('pinned');
    requestAnimationFrame(() => requestAnimationFrame(() => this.moveTo(targets)));
  }


  /**
   * The transition starts with the class, so the jump to "fixed" is not animated.
   */
  private moveTo(targets: NodeListOf<HTMLElement>): void {
    this.intro().nativeElement.classList.add('moving');
    this.pin(this.icon().nativeElement, targets[0].getBoundingClientRect());
    this.pin(this.name().nativeElement, targets[1].getBoundingClientRect());
    setTimeout(() => this.done.emit(), EXIT_MS);
  }


  private pin(element: HTMLElement, rect: DOMRect): void {
    Object.assign(element.style, {
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
  }
}
