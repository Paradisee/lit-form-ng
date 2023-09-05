import { ReactiveControllerHost } from 'lit';

import { AsyncValidatorFn, ValidationErrors, ValidatorFn } from '../validators';
import { AbstractControl, AbstractControlOptions, pickAsyncValidators, pickValidators } from './abstract_control';


export class FormGroup<T extends Record<string, AbstractControl> = any> extends AbstractControl {

  controls: T;

  get value(): Partial<T> {
    return Object.entries(this.controls).reduce((acc, [name, control]) => {
      if (control.disabled) return acc;
      return {
        ...acc,
        [name]: control.value,
      }
    }, {});
  }

  constructor(
    host: ReactiveControllerHost,
    controls: T,
    validatorsOrOptions: Array<ValidatorFn> | AbstractControlOptions = [],
    asyncValidators: Array<AsyncValidatorFn> = []) {
    super(host, pickValidators(validatorsOrOptions), pickAsyncValidators(asyncValidators, validatorsOrOptions));

    this.controls = controls;

    Object.values(this.controls).forEach((control: AbstractControl) => {
      control.parent = this;
    });
  }

  /**
   * Retrieves a child control from the group by its key.
   * @param key - The key (property name) of the child control to retrieve.
   * @returns The child control associated with the specified key, or null if not found.
   */
  get<K extends keyof T>(key: K): AbstractControl<T[K]> | null {
    return this.controls[key] || null;
  }

  override getRawValue(): Partial<T> {
    return Object.keys(this.controls).reduce((acc, key) => {
      return {
        ...acc,
        [key]: this.controls[key].getRawValue(),
      }
    }, {});
  }

  override setValue(value: Record<keyof T, any>, options: { onlySelf?: boolean, emitValue?: boolean } = {}): void {
    const assertAllValuesPresent: boolean = Object.keys(this.controls).every(key => key in value);

    if (!assertAllValuesPresent) {
      throw new Error('You must provide every control to use the setValue method.');
    }

    Object.entries(this.controls).forEach(([key, control]) => {
      control.setValue(value[key], { onlySelf: true, emitValue: options.emitValue });
    });

    if (options.emitValue !== false) {
      this.valueChanges.next(value);
    }

    this.markAsDirty();
    this.updateValueAndValidity(options);
  }

  /**
   * Patches each control within the group with the values provided in the `value` object (if present).
   * @param value - An object containing values to set for specific controls (optional).
   * @param options - Options for patching controls (optional).
   *   - `emitValue`: If `true`, emit value changes; otherwise, suppress value change events (default: true).
   */
  override patchValue(value: Partial<Record<keyof T, any>>, options: { onlySelf?: boolean, emitValue?: boolean } = {}): void {
    Object.keys(value).forEach((key: keyof T) => {
      this.controls[key]?.setValue(value[key], options);
    });
  }

  /**
   * Resets each control within the group to its default value or to the provided values (if specified).
   * @param value - An object containing values to set for specific controls (optional).
   * @param options - Options for resetting controls (optional).
   *   - `emitValue`: If `true`, emit value changes; otherwise, suppress value change events (default: true).
   */
  override reset(value: Partial<Record<keyof T, any>> = {}, options: { onlySelf?: boolean, emitValue?: boolean } = {}): void {
    Object.entries(this.controls).forEach(([name, control]) => {
      control.reset(value[name], options);
    });
    this.markAsPristine();
    this.markAsUntouched();
  }

  /**
   * @internal
   * Returns an array of child controls within the group.
   * This method is used internally to iterate through the child controls.
   * @returns An array of child controls.
   */
  override _forEachChild(cb: (control: AbstractControl) => void): void {
    Object.values(this.controls).forEach((control: AbstractControl) => cb(control));
  }

  override _runValidators(): ValidationErrors | null {
    let errors: ValidationErrors | null = {};

    for (const validatorFn of this._validators) {
      const validationErrors: ValidationErrors | null = validatorFn(this);
      if (validationErrors) {
        errors = Object.assign(errors, validationErrors);
      }
    }

    for (const [name, control] of Object.entries(this.controls)) {
      const validationErrors: ValidationErrors | null = control._runValidators();
      if (validationErrors) {
        errors[name] = validationErrors;
      }
    }

    return Object.keys(errors).length ? errors : null;
  }

  /** @internal */
  override _runAsyncValidators(): void {

  }

  /** @internal */
  override _anyControls(condition: (c: AbstractControl) => boolean): boolean {
    for (const control of Object.values(this.controls)) {
      if (condition(control)) {
        return true;
      }
    }
    return false;
  }

}
