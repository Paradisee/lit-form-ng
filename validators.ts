import { AbstractControl } from './models/abstract_control';


export type ValidationErrors = {
  [key: string]: any
};

export const EMAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const CODICE_FISCALE_REGEXP = /^([a-zA-Z]{3})([a-zA-Z]{3})([0-9]{2})([(abcdehlmprstABCDEHLMPRST]{1})([0-9]{2})([a-zA-Z0-9]{4})([a-zA-Z]{1})$/;
export const PHONE_NUMBER_REGEXP = /^(\((00|\+)39\)|(00|\+)39)?(\s?)(3|0)([0-9](?:\s*)){8,9}$/;


export class Validators {

  static required(control: AbstractControl): ValidationErrors | null {
    return (control.value) ? null : { required: true };
  }

  static email(control: AbstractControl): ValidationErrors | null {
    return EMAIL_REGEXP.test(control.value) ? null : { email: true };
  }

  static minLength(control: AbstractControl, minLength: number): ValidationErrors | null {
    return (control.value?.length >= minLength) ? null : { minLength: true };
  }

  static codiceFiscale(control: AbstractControl): ValidationErrors | null {
    return CODICE_FISCALE_REGEXP.test(control.value) ? null : { codiceFiscale: true };
  }

  static phoneNumber(control: AbstractControl): ValidationErrors | null {
    return PHONE_NUMBER_REGEXP.test(control.value) ? null : { phoneNumber: true };
  }

}
