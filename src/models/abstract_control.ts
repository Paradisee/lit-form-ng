import { ReactiveController, ReactiveControllerHost } from 'lit';
import { DirectiveResult } from 'lit/async-directive';
import { forkJoin, from, map, Subject } from 'rxjs';

import { AsyncValidatorFn, ValidationErrors, ValidatorFn } from '../validators';


export enum FormControlStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
  PENDING = 'PENDING',
  DISABLED = 'DISABLED',
}


export type FormHooks = 'change' | 'blur';


export interface AbstractControlOptions {
  validators?: Array<ValidatorFn>;
  asyncValidators?: Array<AsyncValidatorFn>;
  updateOn?: FormHooks;
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

  public get value(): TValue {
    return this._value;
  }

  protected set value(value: TValue) {
    this._value = value;
  }

  private _host: ReactiveControllerHost;
  private _parent: AbstractControl | null = null;
  private _updateOn?: FormHooks;

  protected _asyncValidationSubscription: any;
  protected _hasPendingAsyncValidator: boolean = false;
  protected _validators: Array<ValidatorFn> = [];
  protected _asyncValidators: Array<AsyncValidatorFn> = [];

  /** TODO - Should't be visible outside */
  public modelToView!: Function;
  public readonly valueChanges: Subject<TValue> = new Subject<TValue>();
  public readonly statusChanges: Subject<FormControlStatus> = new Subject<FormControlStatus>();
  public readonly disabledChanges: Subject<boolean> = new Subject<boolean>();
  public readonly errors: ValidationErrors | null = null;
  public readonly status: FormControlStatus = FormControlStatus.VALID;
  public readonly touched: boolean = false;
  public readonly pristine: boolean = true;

  public get parent(): AbstractControl | null {
    return this._parent;
  }

  public get updateOn(): FormHooks {
    return this._updateOn ? this._updateOn : (this.parent ? this.parent.updateOn : 'change');
  }

  public get valid(): boolean {
    return this.status === FormControlStatus.VALID;
  }

  public get invalid(): boolean {
    return this.status === FormControlStatus.INVALID;
  }

  public get pending(): boolean {
    return this.status === FormControlStatus.PENDING;
  }

  public get enabled(): boolean {
    return this.status !== FormControlStatus.DISABLED;
  }

  public get disabled(): boolean {
    return this.status === FormControlStatus.DISABLED;
  }

  public get untouched(): boolean {
    return !this.touched;
  }

  public get dirty(): boolean {
    return !this.pristine;
  }

  constructor(
    host: ReactiveControllerHost,
    validators: Array<ValidatorFn>,
    asyncValidators: Array<AsyncValidatorFn>) {
    this._host = host;
    this._host.addController(this);

    this._assignValidators(validators);
    this._assignAsyncValidators(asyncValidators);
  }

  public abstract connect(name: string): DirectiveResult;

  /**
   * Returns the raw value. Abstract method (implemented in sub-classes).
   */
  public abstract getRawValue(): TValue;

  /**
   * Sets the value of the control. Abstract method (implemented in sub-classes).
   */
  public abstract setValue(value: TRawValue, options?: Object): void;

  /**
   * Patches the value of the control. Abstract method (implemented in sub-classes).
   */
  public abstract patchValue(value: TValue, options?: Object): void;

  /**
   * Resets the control. Abstract method (implemented in sub-classes).
   */
  public abstract reset(value?: TValue, options?: Object): void;

  /** @internal */
  protected abstract _forEachChild(cb: (control: AbstractControl) => void): void;

  /** @internal */
  protected abstract _anyControls(condition: (c: AbstractControl) => boolean): boolean;

  /** @internal */
  protected abstract _allControlsDisabled(): boolean;

  public hostConnected?(): void;

  public hostDisconnected?(): void;

  public hostUpdate?(): void;

  public hostUpdated?(): void;

  public setParent(parent: AbstractControl): void {
    this._parent = parent;
  }

  /**
   * Retrieves a child control given the control's name or path.
   * @param path - The path (property name) of the child control's name to retrieve.
   * @returns The child control associated with the specified key, or null if not found.
   */
  public get(path: string | Array<string>): AbstractControl | null {
    const paths: Array<string> = Array.isArray(path) ? path : path.split('.');
    return paths.reduce((control: AbstractControl | null, name: string) => {
      return control?._find(name) || null;
    }, this);
  }

  public disable(options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void {
    (this as { status: FormControlStatus }).status = FormControlStatus.DISABLED;

    this._forEachChild((control: AbstractControl) => {
      control.disable({ onlySelf: true });
    });

    this.disabledChanges.next(true);
    this.updateValueAndValidity(options);
  }

  public enable(options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void {
    (this as { status: FormControlStatus }).status = FormControlStatus.VALID;

    this._forEachChild((control: AbstractControl) => {
      control.enable({ onlySelf: true });
    });

    this.disabledChanges.next(false);
    this.updateValueAndValidity(options);
  }

  /**
   * Updates the value and validity status of the control.
   * By default, it also updates the value and validity of its ancestors.
   * @param options - Options for updating the control's value and validating (optional).
   */
  public updateValueAndValidity(options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void {
    (this as { status: FormControlStatus }).status = this._allControlsDisabled() ? FormControlStatus.DISABLED : FormControlStatus.VALID;

    if (this.enabled) {
      this._cancelExistingSubscription();

      (this as { errors: ValidationErrors | null }).errors = this._runValidators();
      (this as { status: FormControlStatus }).status = this._calculateStatus();

      if (this.status === FormControlStatus.VALID || this.status === FormControlStatus.PENDING) {
        this._runAsyncValidators();
      }
    }

    if (options.emitEvent !== false) {
      this.statusChanges.next(this.status);
      this.valueChanges.next(this.value);
    }

    if (this.parent && !options.onlySelf) {
      this.parent.updateValueAndValidity(options);
    } else {
      this._host.requestUpdate();
    }
  }

  /**
   * Sets the synchronous validators that are active on this control.
   * Calling this overwrites any existing synchronous validators.
   */
  public setValidators(validators: Array<ValidatorFn>): void {
    this._validators = validators;
  }

  /**
   * Add synchronous validators to this control, without affecting other validators.
   */
  public addValidators(validators: Array<ValidatorFn>): void {
    this._validators = [...this._validators, ...validators];
  }

  /**
   * Sets the asynchronous validators that are active on this control.
   * Calling this overwrites any existing synchronous validators.
   */
  public setAsyncValidators(validators: Array<AsyncValidatorFn>): void {
    this._asyncValidators = validators;
  }

  /**
   * Add asynchronous validators to this control, without affecting other validators.
   */
  public addAsyncValidators(validators: Array<AsyncValidatorFn>): void {
    this._asyncValidators = [...this._asyncValidators, ...validators];
  }

  public setErrors(errors: ValidationErrors | null, options: { emitEvent?: boolean } = {}): void {
    (this as { errors: ValidationErrors | null }).errors = errors;
    (this as { status: FormControlStatus }).status = this._calculateStatus();

    if (options.emitEvent) {
      this._updateControlsErrors(options.emitEvent);
    }
  }

  /**
   * Marks the control and all its descendant controls as `touched`.
   */
  public markAllAsTouched(): void {
    this.markAsTouched({ onlySelf: true });

    this._forEachChild((control: AbstractControl) => {
      control.markAllAsTouched();
    });
  }

  /**
   * Marks the control as `touched`.
   * A control is touched by focus and blur events that do not change the value.
   */
  public markAsTouched(options: { onlySelf?: boolean } = {}): void {
    (this as { touched: boolean }).touched = true;

    if (this.parent && !options.onlySelf) {
      this.parent.markAsTouched(options);
    } else {
      this._host.requestUpdate();
    }
  }

  /**
   * Marks the control as `untouched`.
   * If the control has any children, also marks all children as `untouched`
   * and recalculates the `touched` status of all parent controls.
   */
  public markAsUntouched(options: { onlySelf?: boolean } = {}): void {
    (this as { touched: boolean }).touched = false;

    this._forEachChild((control: AbstractControl) => {
      control.markAsUntouched(options);
    });

    if (this.parent && !options.onlySelf) {
      this.parent._updateTouched(options);
    } else {
      this._host.requestUpdate();
    }
  }

  /**
   * Marks the control as `dirty`.
   * A control becomes dirty when the control's value is changed through the UI.
   */
  public markAsDirty(options: { onlySelf?: boolean } = {}): void {
    (this as { pristine: boolean }).pristine = false;

    if (this.parent && !options.onlySelf) {
      this.parent.markAsDirty(options);
    } else {
      this._host.requestUpdate();
    }
  }

  /**
   * Marks the control as `pristine`.
   * If the control has any children, marks all children as `pristine`,
   * and recalculates the `pristine` status of all parent controls.
   */
  public markAsPristine(options: { onlySelf?: boolean } = {}): void {
    (this as { pristine: boolean }).pristine = true;

    this._forEachChild((control: AbstractControl) => {
      control.markAsPristine(options);
    });

    if (this.parent && !options.onlySelf) {
      this.parent._updatePristine(options);
    } else {
      this._host.requestUpdate();
    }
  }

  /** TODO */
  public markAsPending(): void {

  }

  /** @internal */
  private _calculateStatus(): FormControlStatus {
    if (this._allControlsDisabled()) return FormControlStatus.DISABLED;
    if (this.errors) return FormControlStatus.INVALID;
    if (this._hasPendingAsyncValidator || this._anyControlsHaveStatus(FormControlStatus.PENDING)) return FormControlStatus.INVALID;
    if (this._anyControlsHaveStatus(FormControlStatus.INVALID)) return FormControlStatus.INVALID;
    return FormControlStatus.VALID;
  }

  /** @internal */
  private _updateControlsErrors(emitEvent: boolean): void {
    (this as { status: FormControlStatus }).status = this._calculateStatus();

    if (emitEvent) {
      this.statusChanges.next(this.status);
    }

    if (this.parent) {
      this.parent._updateControlsErrors(emitEvent);
    }

    this._host.requestUpdate();
  }

  /** @internal */
  private _runValidators(): ValidationErrors | null {
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
  private _runAsyncValidators(): void {
    if (!this._asyncValidators.length) return;

    (this as { status: FormControlStatus }).status = FormControlStatus.PENDING;
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
  private _anyControlsHaveStatus(status: FormControlStatus): boolean {
    return this._anyControls((control: AbstractControl) => control.status === status);
  }

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
  protected _find(name: string | number): AbstractControl | null {
    return null;
  }

  /** @internal */
  protected _setUpdateStrategy(validatorsOrOptions: Array<ValidatorFn> | AbstractControlOptions): void {
    if (!Array.isArray(validatorsOrOptions) && typeof validatorsOrOptions === 'object') {
      this._updateOn = validatorsOrOptions.updateOn!;
    }
  }

}
