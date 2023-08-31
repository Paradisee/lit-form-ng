import { Subject } from 'rxjs';

import { ValidationErrors } from '../validators';


export enum FormControlStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
  PENDING = 'PENDING',
  DISABLED = 'DISABLED',
}


export abstract class AbstractControl<TValue = any> {

  value!: TValue;
  status!: FormControlStatus;
  errors!: ValidationErrors | null;
  valueChanges: Subject<TValue> = new Subject();
  statusChanges: Subject<FormControlStatus> = new Subject();

  get valid(): boolean {
    return this.status === FormControlStatus.VALID;
  }

  get invalid(): boolean {
    return this.status === FormControlStatus.INVALID;
  }

  get pending(): boolean {
    return this.status === FormControlStatus.PENDING;
  }

  get disabled(): boolean {
    return this.status === FormControlStatus.DISABLED;
  }

  get enabled(): boolean {
    return this.status !== FormControlStatus.DISABLED;
  }

  disable(): void {

  }

  enable(): void {

  }

  abstract setValue(value: TValue, options?: Object): void;
  abstract patchValue(value: TValue, options?: Object): void;
  abstract validate(): boolean;

}

































/*
export abstract class AbstractControl<TValue = any> {


  public readonly status!: STATUS;

  abstract _forEachChild(cb: (c: AbstractControl) => void): void;
  abstract setValue(value: TValue, options?: Object): void;
  abstract patchValue(value: TValue, options?: Object): void;
  abstract reset(value?: TValue, options?: Object): void;

  public getRawValue(): TValue {
    return this.value;
  }

  public disable(opts: { onlySelf?: boolean, emitEvent?: boolean } = {}): void {
    this._forEachChild((control: AbstractControl) => {
      control.disable();
    })
  }

  public enable(opts: { onlySelf?: boolean, emitEvent?: boolean } = {}): void {

  }

  public setErrors(errors: ValidationErrors, opts: { emitEvent?: boolean } = {}): void {

  }

//  get<P extends string | ((string | number)[])>(path: P): AbstractControl<ɵGetProperty<TRawValue, P>> | null

}
*/
