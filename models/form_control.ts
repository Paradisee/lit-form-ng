import { ReactiveControllerHost } from 'lit';
import { DirectiveResult } from 'lit/async-directive';

import { connect } from '../directives/connect_directive';
import { AsyncValidatorFn, ValidatorFn } from '../validators';
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

  public connect(): DirectiveResult {
    return connect(this);
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
  protected override _anyControls(condition: (c: AbstractControl) => boolean): boolean {
    return false;
  }

  /** @internal */
  protected override _allControlsDisabled(): boolean {
    return this.disabled;
  }

}
