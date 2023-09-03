import { ReactiveControllerHost } from 'lit';

import { ValidationErrors } from '../validators';
import { AbstractControl } from './abstract_control';


export class FormControl<T = any> extends AbstractControl {

  constructor(host: ReactiveControllerHost, value: T, validators: Array<Function> = []) {
    super(host);

    this.value = value;
    this.defaultValue = value;
    this.validators = validators;
    this.parent = null;
  }

  override getRawValue(): T {
    return this.value;
  }

  /**
   * Sets the control's value to the provided value and updates its validity.
   * @param value - The value to set for the control.
   * @param options - Options for setting the control's value (optional).
   *   - `emitValue`: If `true`, emit value changes; otherwise, suppress value change events (default: true).
   */
  override setValue(value: T, options: { onlySelf?: boolean, emitValue: boolean } = { onlySelf: false, emitValue: true }): void {
    this.value = value;
    options.emitValue && this.valueChanges.next(value);
    this.markAsDirty();
    this.updateValueAndValidity(options);
  }

  /**
   * Patches the control's value with the provided value (if specified).
   * @param value - The value to patch the control with (optional).
   * @param options - Options for patching the control (optional).
   *   - `emitValue`: If `true`, emit value changes; otherwise, suppress value change events (default: true).
   */
  override patchValue(value: T, options: { onlySelf?: boolean, emitValue: boolean } = { onlySelf: false, emitValue: true }): void {
    this.setValue(value, options);
  }

  /**
   * Resets the control to its default value or to the provided value (if specified).
   * @param value - The value to set for the control (optional).
   * @param options - Options for resetting the control (optional).
   *   - `emitValue`: If `true`, emit value changes; otherwise, suppress value change events (default: true).
   */
  override reset(value: T = this.defaultValue, options: { onlySelf?: boolean, emitValue: boolean } = { onlySelf: false, emitValue: true }): void {
    this.markAsPristine();
    this.markAsUntouched();
    this.setValue(value, options);
  }

  /**
   * @internal
   * Returns an array containing the current control itself.
   * This method is used internally to include the control itself when iterating through child controls.
   * @returns An array containing the control itself.
   */
  override _forEachChild(): Array<AbstractControl> {
    return [];
  }

  /** @internal */
  override _runValidators(): ValidationErrors | null {
    if (this.disabled) return null;
    let errors: ValidationErrors = {};
    for (const validatorFn of this.validators) {
      const validationError: ValidationErrors | null = validatorFn(this);
      if (validationError !== null) {
        errors = Object.assign(errors, validationError);
      }
    }
    return Object.keys(errors).length ? errors : null;
  }

  /** @internal */
  override _anyControls(condition: (c: AbstractControl) => boolean): boolean {
    return false;
  }

}
