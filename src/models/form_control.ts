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

    this._setUpdateStrategy(validatorsOrOptions);

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
   * Sets a new value for the form control.
   * @param value - The new value for the control.
   * @param options - Options that determine how the control propagates changes and emits events when the value changes (optional).
   *   - `onlySelf`: If `true`, each change only affects this control, and not its parent (default: false).
   *   - `emitValue`: If `true`, emit `valueChanges` and `statusChanges` (default: true).
   *   - `emitModelToViewChange`: If `true`, updates the view (default: true).
   */
  public override setValue(value: T, options: { onlySelf?: boolean, emitValue?: boolean, emitModelToViewChange?: boolean } = {}): void {
    this.value = value;

    if (this.modelToView && options.emitModelToViewChange !== false) {
      this.modelToView();
    }

    this.updateValueAndValidity(options);
  }

  /**
   * Patches the control's value with the provided value.
   * @param value - The value to patch the control with.
   * @param options - Options for patching the control (optional).
   */
  public override patchValue(value: T, options: { onlySelf?: boolean, emitValue?: boolean } = {}): void {
    this.setValue(value, options);
  }

  /**
   * Resets the control to its default value or to the provided value (if specified).
   * @param value - The value to set for the control (optional).
   * @param options - Options for resetting the control (optional).
   */
  public override reset(value: T = this.defaultValue, options: { onlySelf?: boolean, emitValue?: boolean } = {}): void {
    this.markAsPristine();
    this.markAsUntouched();
    this.setValue(value, options);
  }

  /** @internal */
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
