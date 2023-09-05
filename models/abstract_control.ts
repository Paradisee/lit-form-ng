import { ReactiveController, ReactiveControllerHost } from 'lit';
import { Subject } from 'rxjs';

import { AsyncValidatorFn, ValidationErrors, ValidatorFn } from '../validators';


export enum FormControlStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
  PENDING = 'PENDING',
  DISABLED = 'DISABLED',
}

export interface AbstractControlOptions {
  validators?: Array<ValidatorFn>;
  asyncValidators?: Array<AsyncValidatorFn>;
  updateOn?: string;
}


export function pickValidators(validatorOrOptions: ValidatorFn[] | AbstractControlOptions): ValidatorFn[] {
  if (Array.isArray(validatorOrOptions)) return validatorOrOptions;
  if (typeof validatorOrOptions === 'object') return validatorOrOptions?.validators || [];
  return [];
}


export function pickAsyncValidators(validators: AsyncValidatorFn[], validatorOrOptions: ValidatorFn[] | AbstractControlOptions): AsyncValidatorFn[] {
  if (Array.isArray(validatorOrOptions)) return validators;
  if (typeof validatorOrOptions === 'object') return validatorOrOptions?.asyncValidators || [];
  return validators;
}


export abstract class AbstractControl<TValue = any, TRawValue extends TValue = TValue> implements ReactiveController {

  private _value!: TValue;

  get value(): TValue {
    return this._value;
  }

  set value(value: TValue) {
    this._value = value;
  }

  defaultValue!: TValue;
  host: ReactiveControllerHost;
  parent: AbstractControl | null = null;
  valueChanges: Subject<TValue> = new Subject<TValue>();
  statusChanges: Subject<FormControlStatus> = new Subject<FormControlStatus>();
  disabledChanges: Subject<boolean> = new Subject<boolean>();
  errors: ValidationErrors | null = null;
  modelToView!: Function;

  protected _asyncValidationSubscription: any;
  protected _hasPendingAsyncValidator: boolean = false;
  protected _validators: Array<ValidatorFn> = [];
  protected _asyncValidators: Array<AsyncValidatorFn> = [];

  readonly status!: FormControlStatus;
  readonly touched: boolean = false;
  readonly pristine: boolean = true;

  get valid(): boolean {
    return this.status === FormControlStatus.VALID;
  }

  get invalid(): boolean {
    return this.status === FormControlStatus.INVALID;
  }

  get enabled(): boolean {
    return this.status !== FormControlStatus.DISABLED;
  }

  get disabled(): boolean {
    return this.status === FormControlStatus.DISABLED;
  }

  get untouched(): boolean {
    return !this.touched;
  }

  get dirty(): boolean {
    return !this.pristine;
  }

  constructor(
    host: ReactiveControllerHost,
    validators: Array<ValidatorFn>,
    asyncValidators: Array<AsyncValidatorFn>) {
    this.host = host;
    this.host.addController(this);

    this._assignValidators(validators);
    this._assignAsyncValidators(asyncValidators);
  }

  abstract getRawValue(): TValue;

  /**
   * Sets the value of the control. Abstract method (implemented in sub-classes).
   */
  abstract setValue(value: TRawValue, options?: Object): void;

  /**
   * Patches the value of the control. Abstract method (implemented in sub-classes).
   */
  abstract patchValue(value: TValue, options?: Object): void;

  /**
   * Resets the control. Abstract method (implemented in sub-classes).
   */
  abstract reset(value?: TValue, options?: Object): void;

  /**
   * Returns an array of controls. Abstract method (implemented in sub-classes).
   */
  abstract _forEachChild(cb: (control: AbstractControl) => void): void;

  abstract _runValidators(): ValidationErrors | null;

  abstract _runAsyncValidators(): void;

  hostConnected?(): void;

  hostDisconnected?(): void;

  hostUpdate?(): void;

  hostUpdated?(): void;

  disable(options: { onlySelf?: boolean, emitValue?: boolean } = { onlySelf: false, emitValue: true }): void {
    (this as { status: FormControlStatus }).status = FormControlStatus.DISABLED;

    this._forEachChild((control: AbstractControl) => {
      control.disable({ onlySelf: true, emitValue: true });
    });

    this.disabledChanges.next(true);
    this.updateValueAndValidity(options);
  }

  enable(options: { onlySelf?: boolean, emitValue?: boolean } = { onlySelf: false, emitValue: true }): void {
    (this as { status: FormControlStatus }).status = FormControlStatus.VALID;

    this._forEachChild((control: AbstractControl) => {
      control.enable({ onlySelf: true, emitValue: true });
    });

    this.disabledChanges.next(false);
    this.updateValueAndValidity(options);
  }

  updateValueAndValidity(options: { onlySelf?: boolean, emitValue?: boolean } = { onlySelf: false, emitValue: true }): void {
    if (this.parent) {
      this.parent.updateValueAndValidity(options);
    }

    this._cancelExistingSubscription();
    this.errors = this.disabled ? null : this._runValidators();
    (this as { status: FormControlStatus }).status = this._calculateStatus();

    if (this.status === FormControlStatus.VALID || this.status === FormControlStatus.PENDING) {
      (this as { status: FormControlStatus }).status = FormControlStatus.PENDING;
      this._runAsyncValidators();
    }

    if (options.emitValue) {
      this.statusChanges.next(this.status);
    }

    if (this.modelToView) {
      this.modelToView(this.value);
    }

    if (!options.onlySelf) {
      this.host.requestUpdate();
    }
  }

  /**
   * Sets the synchronous validators that are active on this control.
   * Calling this overwrites any existing synchronous validators.
   */
  setValidators(validators: Array<ValidatorFn>): void {
    this._validators = validators;
  }

  /**
   * Add synchronous validators to this control, without affecting other validators.
   */
  addValidators(validators: Array<ValidatorFn>): void {
    this._validators = [...this._validators, ...validators];
  }

  /**
   * Sets the asynchronous validators that are active on this control.
   * Calling this overwrites any existing synchronous validators.
   */
  setAsyncValidators(validators: Array<AsyncValidatorFn>): void {
    this._asyncValidators = validators;
  }

  /**
   * Add asynchronous validators to this control, without affecting other validators.
   */
  addAsyncValidators(validators: Array<AsyncValidatorFn>): void {
    this._asyncValidators = [...this._asyncValidators, ...validators];
  }

  setErrors(errors: ValidationErrors | null, options: { emitEvent?: boolean } = {}): void {
    this.errors = errors;
    (this as { status: FormControlStatus }).status = this._calculateStatus();

    if (options.emitEvent) {
      this._updateControlsErrors(options.emitEvent);
    }
  }

  /**
   * Marks the control and all its descendant controls as `touched`.
   */
  markAllAsTouched(): void {
    this.markAsTouched({ onlySelf: true });

    this._forEachChild((control: AbstractControl) => {
      control.markAllAsTouched();
    });
  }

  /**
   * Marks the control as `touched`. A control is touched by focus and
   * blur events that do not change the value.
   */
  markAsTouched(options: { onlySelf?: boolean } = {}): void {
    (this as { touched: boolean }).touched = true;

    if (this.parent && !options.onlySelf) {
      this.parent.markAsTouched(options);
    }
  }

  /**
   * Marks the control as `untouched`.
   *
   * If the control has any children, also marks all children as `untouched`
   * and recalculates the `touched` status of all parent controls.
   */
  markAsUntouched(options: { onlySelf?: boolean } = {}): void {
    (this as { touched: boolean }).touched = false;

    this._forEachChild((control: AbstractControl) => {
      control.markAsUntouched(options);
    });

    if (this.parent && !options.onlySelf) {
      this.parent._updateTouched(options);
    }
  }

  /**
   * Marks the control as `dirty`. A control becomes dirty when
   * the control's value is changed through the UI.
   */
  markAsDirty(options: { onlySelf?: boolean } = {}): void {
    (this as { pristine: boolean }).pristine = false;

    if (this.parent && !options.onlySelf) {
      this.parent.markAsDirty(options);
    }
  }

  /**
   * Marks the control as `pristine`.
   *
   * If the control has any children, marks all children as `pristine`,
   * and recalculates the `pristine` status of all parent controls.
   */
  markAsPristine(options: { onlySelf?: boolean } = {}): void {
    (this as { pristine: boolean }).pristine = true;

    this._forEachChild((control: AbstractControl) => {
      control.markAsPristine(options);
    });

    if (this.parent && !options.onlySelf) {
      this.parent._updatePristine(options);
    }
  }

  // TODO
  markAsPending(): void {

  }

  /** @internal */
  private _calculateStatus(): FormControlStatus {
    if (this.disabled) return FormControlStatus.DISABLED;
    if (this._hasPendingAsyncValidator) return FormControlStatus.PENDING;
    if (this.errors) return FormControlStatus.INVALID;
    return FormControlStatus.VALID;
  }

  /** @internal */
  private _updateControlsErrors(emitEvent: boolean): void {
    (this as {status: FormControlStatus}).status = this._calculateStatus();

    if (emitEvent) {
      this.statusChanges.next(this.status);
    }

    if (this.parent) {
      this.parent._updateControlsErrors(emitEvent);
    }

    this.host.requestUpdate();
  }

  /** @internal */
  abstract _anyControls(condition: (c: AbstractControl) => boolean): boolean;

  /** @internal */
  private _anyControlsDirty(): boolean {
    return this._anyControls((control: AbstractControl) => control.dirty);
  }

  /** @internal */
  private _anyControlsTouched(): boolean {
    return this._anyControls((control: AbstractControl) => control.touched);
  }

  /** @internal */
  private _updateTouched(options: { onlySelf?: boolean } = {}): void {
    (this as { touched: boolean }).touched = !this._anyControlsTouched();

    if (this.parent && !options.onlySelf) {
      this.parent._updateTouched(options);
    }
  }

  /** @internal */
  private _updatePristine(options: { onlySelf?: boolean } = {}): void {
    (this as { pristine: boolean }).pristine = !this._anyControlsDirty();

    if (this.parent && !options.onlySelf) {
      this.parent._updatePristine(options);
    }
  }

  /** @internal */
  private _assignValidators(validators: Array<ValidatorFn>): void {
    this._validators = validators.slice();
  }

  /** @internal */
  private _assignAsyncValidators(validators: Array<AsyncValidatorFn>): void {
    this._asyncValidators = validators.slice();
  }

  /** @internal */
  private _cancelExistingSubscription(): void {
    if (this._asyncValidationSubscription) {
      this._asyncValidationSubscription.unsubscribe();
      this._hasPendingAsyncValidator = false;
    }
  }

  /** @internal */
  protected _setUpdateStrategy(options: Array<AsyncValidatorFn> | AbstractControlOptions | null): void {

  }

}
