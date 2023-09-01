import { ReactiveController, ReactiveControllerHost } from 'lit';

import { ValidationErrors } from '../validators';
import { AbstractControl } from './abstract_control';


export class FormControl<T = any> extends AbstractControl implements ReactiveController {

  validators: Array<Function> = [];

  constructor(host: ReactiveControllerHost, value: T, validators: Array<Function> = []) {
    super();

    this.host = host;
    this.value = value;
    this.validators = validators;

    host.addController(this);
  }

  override setValue(value: T, options: { emitValue: boolean } = { emitValue: true }): void {
    this.value = value;
    options.emitValue && this.valueChanges.next(value);
    this.updateValueAndValidity();
  }

  override patchValue(value: T, options: { emitValue: boolean } = { emitValue: true }): void {
    this.setValue(value, options);
  }

  // TODO
  override reset(): void {

  }

  _runValidators(): ValidationErrors | null {
    let errors: ValidationErrors = {};
    for (const validatorFn of this.validators) {
      const validationError: ValidationErrors | null = validatorFn(this);
      if (validationError !== null) {
        errors = Object.assign(errors, validationError);
      }
    }
    return Object.keys(errors).length ? errors : null;
  }

}
