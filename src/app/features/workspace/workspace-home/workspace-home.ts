import { Component } from '@angular/core';

@Component({
  selector: 'app-workspace-home',
  template: `<p>Wähle links einen Channel oder eine Direktnachricht aus.</p>`,
  styles: `
    :host {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: center;
      padding: 32px;
    }

    p {
      margin: 0;
      font-size: 20px;
      color: #686868;
      text-align: center;
    }
  `,
})
export class WorkspaceHome {}
