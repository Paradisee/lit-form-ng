import { ReactiveControllerHost } from 'lit';
import { forkJoin, from, map } from 'rxjs';

import { AsyncValidatorFn, ValidationErrors, ValidatorFn } from '../validators';
import { AbstractControl, AbstractControlOptions, pickAsyncValidators, pickValidators } from './abstract_control';


export class FormControl<T = any> extends AbstractControl {

  public readonly defaultValue: T = null as unknown as T;

  constructor(
    host: ReactiveControllerHost,
    value: T,
    validatorsOrOptions: Array<ValidatorFn> | AbstractControlOptions = [],
    asyncValidators: Array<AsyncValidatorFn> = []) {
    super(host, pickValidators(validatorsOrOptions), pickAsyncValidators(asyncValidators, validatorsOrOptions));

//    this._setUpdateStrategy(validatorOrOptions);

    this.value = value;
    this.defaultValue = value;
  }

  public override getRawValue(): T {
    return this.value;
  }

  /**
   * Sets the control's value to the provided value and updates its validity.
   * @param value - The value to set for the control.
   * @param options - Options for setting the control's value (optional).
   *   - `emitValue`: If `true`, emit value changes; otherwise, suppress value change events (default: true).
   */
  public override setValue(value: T, options: { onlySelf?: boolean, emitValue?: boolean } = {}): void {
    this.value = value;

    if (options.emitValue !== false) {
      this.valueChanges.next(value);
    }

    this.markAsDirty();
    this.updateValueAndValidity(options);
  }

  /**
   * Patches the control's value with the provided value (if specified).
   * @param value - The value to patch the control with (optional).
   * @param options - Options for patching the control (optional).
   *   - `emitValue`: If `true`, emit value changes; otherwise, suppress value change events (default: true).
   */
  public override patchValue(value: T, options: { onlySelf?: boolean, emitValue?: boolean } = {}): void {
    this.setValue(value, options);
  }

  /**
   * Resets the control to its default value or to the provided value (if specified).
   * @param value - The value to set for the control (optional).
   * @param options - Options for resetting the control (optional).
   *   - `emitValue`: If `true`, emit value changes; otherwise, suppress value change events (default: true).
   */
  public override reset(value: T = this.defaultValue, options: { onlySelf?: boolean, emitValue?: boolean } = {}): void {
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
  protected override _forEachChild(cb: (control: AbstractControl) => void): void {

  }

  /** @internal */
  override _runValidators(): ValidationErrors | null {
    let errors: ValidationErrors = {};
    for (const validatorFn of this._validators) {
      const validationError: ValidationErrors | null = validatorFn(this);
      if (validationError !== null) {
        errors = Object.assign(errors, validationError);
      }
    }
    return Object.keys(errors).length ? errors : null;
  }

  /** @internal */
  override _runAsyncValidators(): void {
    this._hasPendingAsyncValidator = true;

    const asyncValidationObservables = this._asyncValidators.map(
      (validatorFn: AsyncValidatorFn) => from(validatorFn(this)).pipe(
        map(validationResult => validationResult)
      )
    );

    this._asyncValidationSubscription = forkJoin(asyncValidationObservables).subscribe(
      (results: Array<ValidationErrors | null>) => {
        let errors: ValidationErrors | null = {};
        this._hasPendingAsyncValidator = false;

        for (const validationError of results) {
          if (validationError !== null) {
            errors = Object.assign(errors, validationError);
          }
        }

        errors = Object.keys(errors).length ? errors : null;
        this.setErrors(errors, { emitEvent: true });
      }
    );
  }

  /** @internal */
  protected override _anyControls(condition: (c: AbstractControl) => boolean): boolean {
    return false;
  }

}
