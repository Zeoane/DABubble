import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const PASSWORD_RULE = 'Erlaubt sind mindestens 8 Zeichen mit Buchstabe und Zahl, Sonderzeichen wie ! ? # ja, Leerzeichen nein.';


/** Names the first password rule the value breaks, or null if it is fine. */
export function passwordProblem(value: string): string | null {
  if (!value) return '*Bitte geben Sie ein Passwort ein.';
  if (/\s/.test(value)) return '*Leerzeichen sind im Passwort nicht erlaubt.';
  if (value.length < 8) return `*Das Passwort ist zu kurz (${value.length} von 8 Zeichen).`;
  if (!/[A-Za-zÄÖÜäöüß]/.test(value)) return '*Das Passwort braucht mindestens einen Buchstaben.';
  if (!/\d/.test(value)) return '*Das Passwort braucht mindestens eine Zahl.';
  return null;
}


/** Validator for new passwords; the error carries the message to show. */
export const passwordRule: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const problem = passwordProblem(control.value ?? '');
  return problem ? { passwordRule: `${problem} ${PASSWORD_RULE}` } : null;
};


/** Message for an e-mail field: either empty or not a valid address. */
export function emailMessage(control: AbstractControl): string {
  return control.hasError('required')
    ? '*Bitte geben Sie Ihre E-Mail-Adresse ein.'
    : '*Diese E-Mail-Adresse ist leider ungültig.';
}
