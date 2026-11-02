import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';
import { ChannelService, normalizeName } from '../../core/services/channel.service';

export const CHANNEL_NAME_MAX = 30;

/**
 * Required, at most 30 characters and not used by another channel.
 */
export function channelNameValidators(channels: ChannelService, exceptId?: () => string | undefined): ValidatorFn[] {
  const unique: ValidatorFn = (control) => {
    const name = normalizeName(control.value ?? '');
    if (!name) return { required: true };
    return channels.isNameTaken(name, exceptId?.()) ? { taken: true } : null;
  };
  return [Validators.required, Validators.maxLength(CHANNEL_NAME_MAX), unique];
}


/** Error text below the name field, or null while the input is fine or untouched. */
export function channelNameError(control: AbstractControl): string | null {
  if (!control.invalid || !(control.touched || control.dirty)) return null;
  if (control.hasError('taken')) return '*Diesen Channel-Namen gibt es schon. Bitte wähle einen anderen.';
  if (control.hasError('maxlength')) return `*Der Name darf höchstens ${CHANNEL_NAME_MAX} Zeichen lang sein.`;
  return '*Bitte gib einen Channel-Namen ein.';
}
