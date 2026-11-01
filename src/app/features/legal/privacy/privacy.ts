import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalPage } from '../legal-page/legal-page';

@Component({
  selector: 'app-privacy',
  imports: [LegalPage, RouterLink],
  templateUrl: './privacy.html',
})
export class Privacy {}
