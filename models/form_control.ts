import { ValidationErrors } from '../validators';
import { AbstractControl } from './abstract_control';


export class FormControl extends AbstractControl {

  modelToView!: Function;
  validators: Array<Function> = [];

  constructor(value: any, validators: Array<Function> = []) {
    super();

    this.value = value;
    this.validators = validators;
  }

  getValue(): any {
    return this.value;
  }

  setValue(value: any, options: { emitValue?: boolean } = { emitValue: true }) {
    this.value = value;
    this.validate();

    if (options.emitValue) {
      this.valueChanges.next(value);
      this.modelToView(value);
    }
  }

  override patchValue(value: any): void {
    this.setValue(value);
  }

  override validate(): boolean {
    let isValid = true;
    let errors: ValidationErrors = {};

    for (const validatorFn of this.validators) {
      const errorControl: ValidationErrors = validatorFn(this);
      if (errorControl === null) {
        continue;
      } else {
        isValid = false;
        errors = Object.assign(errors, errorControl);
      }
    }

    this.setErrors(errors);

    return isValid;
  }

  setErrors(errors: ValidationErrors) {
    this.errors = errors;
  }

}
