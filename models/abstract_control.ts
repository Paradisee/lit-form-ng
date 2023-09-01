import { ReactiveControllerHost } from 'lit';
import { Subject } from 'rxjs';

import { ValidationErrors } from '../validators';


export enum FormControlStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
  PENDING = 'PENDING',
  DISABLED = 'DISABLED',
}


export abstract class AbstractControl<TValue = any, TRawValue extends TValue = TValue> {

  private _value!: TValue;

  get value(): TValue {
    return this._value;
  }

  set value(value: TValue) {
    this._value = value;
  }

  defaultValue!: TValue;
  host!: ReactiveControllerHost;
  status!: FormControlStatus;
  valueChanges: Subject<TValue> = new Subject<TValue>();
  statusChanges: Subject<FormControlStatus> = new Subject<FormControlStatus>();
  disabledChanges: Subject<boolean> = new Subject<boolean>();
  errors: ValidationErrors | null = null;
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

  constructor() {

  }

  abstract setValue(value: TRawValue, options?: Object): void;

  abstract patchValue(value: TValue, options?: Object): void;

  abstract reset(value?: TValue, options?: Object): void;

  abstract _forEachChild(): Array<AbstractControl>;

  hostConnected?(): void;

  hostDisconnected?(): void;

  hostUpdate?(): void;

  hostUpdated?(): void;

  disable(): void {
    this.status = FormControlStatus.DISABLED;
    this.errors = null;

    this._forEachChild().forEach((control: AbstractControl) => {
      control.disabledChanges.next(true);
    });

    this.statusChanges.next(this.status);
    this.host.requestUpdate();
  }

  enable(): void {
    this.status = FormControlStatus.VALID;

    this._forEachChild().forEach((control: AbstractControl) => {
      control.disabledChanges.next(false);
    });

    this.updateValueAndValidity();
    this.host.requestUpdate();
  }

  updateValueAndValidity(): void {
//    this.errors = this._runValidators();
    this.status = this._calculateStatus();
    this.statusChanges.next(this.status);

    if (this.modelToView) {
      this.modelToView(this.value);
      this.host.requestUpdate();
    }
  }

  private _calculateStatus(): FormControlStatus {
    if (this.errors) return FormControlStatus.INVALID;
    if (this.disabled) return FormControlStatus.DISABLED;
    return FormControlStatus.VALID;
  }

}
