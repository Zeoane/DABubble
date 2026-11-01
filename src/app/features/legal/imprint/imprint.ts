import { Component } from '@angular/core';
import { LegalPage } from '../legal-page/legal-page';

// TODO: Kontakt-E-Mail von Ellie eintragen
const CONTACT_EMAIL = 'E-MAIL-ADRESSE';

@Component({
  selector: 'app-imprint',
  imports: [LegalPage],
  templateUrl: './imprint.html',
})
export class Imprint {
  readonly email = CONTACT_EMAIL;
}
