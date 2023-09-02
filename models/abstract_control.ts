import { ReactiveController, ReactiveControllerHost } from 'lit';
import { Subject } from 'rxjs';

import { ValidationErrors } from '../validators';


export enum FormControlStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
  PENDING = 'PENDING',
  DISABLED = 'DISABLED',
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
  host!: ReactiveControllerHost;
  parent: AbstractControl | null = null;
  status!: FormControlStatus;
  valueChanges: Subject<TValue> = new Subject<TValue>();
  statusChanges: Subject<FormControlStatus> = new Subject<FormControlStatus>();
  disabledChanges: Subject<boolean> = new Subject<boolean>();
  errors: ValidationErrors | null = null;
  validators: Array<Function> = [];
  modelToView!: Function;

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

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.host.addController(this);
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
  abstract _forEachChild(): Array<AbstractControl>;

  abstract _runValidators(): ValidationErrors | null;

  hostConnected?(): void;

  hostDisconnected?(): void;

  hostUpdate?(): void;

  hostUpdated?(): void;

  disable(options: { onlySelf?: boolean, emitValue?: boolean } = { onlySelf: false, emitValue: true }): void {
    this.status = FormControlStatus.DISABLED;

    this._forEachChild().forEach((control: AbstractControl) => {
      control.disable({ onlySelf: true, emitValue: true });
    });

    this.disabledChanges.next(true);
    this.updateValueAndValidity(options);
  }

  enable(options: { onlySelf?: boolean, emitValue?: boolean } = { onlySelf: false, emitValue: true }): void {
    this.status = FormControlStatus.VALID;

    this._forEachChild().forEach((control: AbstractControl) => {
      control.enable({ onlySelf: true, emitValue: true });
    });

    this.disabledChanges.next(false);
    this.updateValueAndValidity(options);
  }

  updateValueAndValidity(options: { onlySelf?: boolean, emitValue?: boolean } = { onlySelf: false, emitValue: true }): void {
    if (this.parent) {
      this.parent.updateValueAndValidity(options);
    }

    this.errors = this._runValidators();
    this.status = this._calculateStatus();

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
  setValidators(validators: Array<Function> = []): void {
    this.validators = validators;
  }

  /**
   * Add synchronous validators to this control, without affecting other validators.
   */
  addValidators(validators: Array<Function> = []): void {
    this.validators = [...this.validators, ...validators];
  }

  private _calculateStatus(): FormControlStatus {
    if (this.disabled) return FormControlStatus.DISABLED;
    if (this.errors) return FormControlStatus.INVALID;
    return FormControlStatus.VALID;
  }

}
