import { Component } from '@angular/core';
import { LegalPage } from '../legal-page/legal-page';

const CONTACT_EMAIL = 'gabriele-lerch@outlook.de';

@Component({
  selector: 'app-imprint',
  imports: [LegalPage],
  templateUrl: './imprint.html',
})
export class Imprint {
  readonly email = CONTACT_EMAIL;
}
