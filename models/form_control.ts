import { ReactiveController, ReactiveControllerHost } from 'lit';
import { Subject } from 'rxjs';

import { ValidationErrors } from '../validators';
import { FormControlStatus } from './abstract_control';


export class FormControl<TValue = any> implements ReactiveController {

  host: ReactiveControllerHost;
  value: TValue;
  status!: FormControlStatus;
  valueChanges: Subject<TValue> = new Subject<TValue>();
  statusChanges: Subject<FormControlStatus> = new Subject<FormControlStatus>();
  validators: Array<Function> = [];
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

  constructor(host: ReactiveControllerHost, value: TValue, validators: Array<Function> = []) {
    this.host = host;
    this.value = value;
    this.validators = validators;

    host.addController(this);
  }

  hostConnected?(): void;
  hostDisconnected?(): void;
  hostUpdate?(): void;
  hostUpdated?(): void;

  setValue(value: TValue, options: { emitValue: boolean } = { emitValue: true }): void {
    this.value = value;
    options.emitValue && this.valueChanges.next(value);
    this._updateValueAndValidity();
  }

  patchValue(value: TValue, options: { emitValue: boolean } = { emitValue: true }): void {
    this.setValue(value, options);
  }

  disable(): void {
    // TODO - Disable the host input
    this.status = FormControlStatus.DISABLED;
    this.statusChanges.next(this.status);
    this.host.requestUpdate();
  }

  enable(): void {
    // TODO - Enable the host input
    this.status = FormControlStatus.VALID;
    this._updateValueAndValidity();
    this.host.requestUpdate();
  }

  reset(): void {
    // TODO
    //this.setValue(null);
  }

  private _runValidators(): ValidationErrors | null {
    let errors: ValidationErrors = {};
    for (const validatorFn of this.validators) {
      const validationError: ValidationErrors | null = validatorFn(this);
      if (validationError !== null) {
        errors = Object.assign(errors, validationError);
      }
    }
    return Object.keys(errors).length ? errors : null;
  }

  private _updateValueAndValidity(): void {
    this.errors = this._runValidators();
    this.status = this._calculateStatus();
    this.statusChanges.next(this.status);
    this.modelToView(this.value);
    this.host.requestUpdate();
  }

  private _calculateStatus(): FormControlStatus {
    if (this.errors) return FormControlStatus.INVALID;
    if (this.disabled) return FormControlStatus.DISABLED;
    return FormControlStatus.VALID;
  }
}
