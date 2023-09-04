import { Observable } from 'rxjs';

import { AbstractControl } from './models/abstract_control';


export type ValidationErrors = {
  [key: string]: any
};

export interface ValidatorFn {
  (control: AbstractControl): ValidationErrors | null;
}

export interface AsyncValidatorFn {
  (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null>;
}

const EMAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


export class Validators {

  static required(control: AbstractControl): ValidationErrors | null {
    return (control.value) ? null : { required: true };
  }

  static email(control: AbstractControl): ValidationErrors | null {
    return EMAIL_REGEXP.test(control.value) ? null : { email: true };
  }

  static minLength(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return (control.value?.length >= minLength) ? null : { minLength: true };
    };
  }

}
