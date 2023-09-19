import { ReactiveControllerHost } from 'lit';
import { DirectiveResult } from 'lit/async-directive';

import { connect } from '../directives/connect_directive';
import { AsyncValidatorFn, ValidatorFn } from '../validators';
import { AbstractControl, AbstractControlOptions, pickAsyncValidators, pickValidators } from './abstract_control';


export class FormArray<T extends AbstractControl<any> = any> extends AbstractControl {

  public controls: Array<T>;

  public get value(): Array<T> {
    return this.controls.reduce((acc: Array<T>, control: AbstractControl) => {
      if (control.disabled) return acc;
      return [ ...acc, control.value ];
    }, []);
  }

  get length(): number {
    return this.controls.length;
  }

  constructor(
    host: ReactiveControllerHost,
    controls: Array<T>,
    validatorsOrOptions: Array<ValidatorFn> | AbstractControlOptions = [],
    asyncValidators: Array<AsyncValidatorFn> = []) {
    super(host, pickValidators(validatorsOrOptions), pickAsyncValidators(asyncValidators, validatorsOrOptions));

    this._setUpdateStrategy(validatorsOrOptions);
    this.controls = controls;

    this.controls.forEach((control: AbstractControl) => {
      control.setParent(this);
    });
  }

  public connect(name: string): DirectiveResult {
    return connect(this.get(name), name);
  }

  public override getRawValue(): Array<T> {
    return this.controls.map((control: AbstractControl) => control.getRawValue());
  }

  public override setValue(value: Array<T>, options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void {
    if (value.length !== this.controls.length) {
      throw new Error('You must provide every control to use the setValue method.');
    }

    value.forEach((newValue: any, index: number) => {
      this.at(index).setValue(newValue, { onlySelf: true, emitEvent: options.emitEvent });
    });

    this.updateValueAndValidity(options);
  }

  public override patchValue(value: Array<T>, options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void {
    value.forEach((newValue: any, index: number) => {
      this.at(index)?.setValue(newValue, options);
    });
  }

  public override reset(value: Array<T> = [], options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void {
    this.controls.forEach((control: AbstractControl, index: number) => {
      control.reset(value[index], options);
    });
    this.markAsPristine(options);
    this.markAsUntouched(options);
  }

  /**
   * Gets the AbstractControl at the given index in the array.
   * @param index - The index of the AbstractControl.
   * @returns The child control.
   */
  public at(index: number): AbstractControl {
    return this.controls[index];
  }

  /**
   * Inserts a new AbstractControl at the end of the array.
   * @param control - The AbstractConrol to push into the array.
   * @param options - Options that determine how the control propagates changes and emits events when the value changes (optional).
   */
  public push(control: T, options: { emitEvent?: boolean } = {}): void {
    this.controls.push(control);
    this._registerControl(control);
    this.updateValueAndValidity({ emitEvent: options.emitEvent });
  }

  /**
   * Inserts a new AbstractControl at the given index in the array.
   * @param index - The index where the control should be insert.
   * @param control - The AbstractConrol to insert into the array.
   * @param options - Options that determine how the control propagates changes and emits events when the value changes (optional).
   */
  public insert(index: number, control: T, options: { emitEvent?: boolean } = {}): void {
    this.controls.splice(index, 0, control);
    this._registerControl(control);
    this.updateValueAndValidity({ emitEvent: options.emitEvent });
  }

  /**
   * Removes the control at the given index in the array.
   * @param index - The index of the control to remove.
   * @param options - Options that determine how the control propagates changes and emits events when the value changes (optional).
   */
  public removeAt(index: number, options: { emitEvent?: boolean } = {}): void {
    this.controls.splice(index, 1);
    this.updateValueAndValidity({ emitEvent: options.emitEvent });
  }

  /**
   * Replaces an existing control.
   * @param index - The index of the control to replace.
   * @param control - The AbstractControl that will replace the existing one.
   * @param options - Options that determine how the control propagates changes and emits events when the value changes (optional).
   */
  public setControl(index: number, control: T, options: { emitEvent?: boolean } = {}): void {
    this.controls.splice(index, 1);
    this.insert(index, control, options);
  }

  /**
   * Removes all controls in the FormArray.
   * @param options - Options that determine how the control propagates changes and emits events when the value changes (optional).
   */
  public clear(options: { emitEvent?: boolean } = {}): void {
    if (!this.length) return;
    this.controls.splice(0);
    this.updateValueAndValidity({ emitEvent: options.emitEvent });
  }

  /** @internal */
  private _registerControl(control: AbstractControl): void {
    control.setParent(this);
  }

  /** @internal */
  protected override _forEachChild(cb: (control: AbstractControl) => void): void {
    this.controls.forEach((control: AbstractControl) => cb(control));
  }

  /** @internal */
  protected override _anyControls(condition: (c: AbstractControl) => boolean): boolean {
    return this.controls.some(condition);
  }

  /** @internal */
  protected override _allControlsDisabled(): boolean {
    return this.controls.every((control: AbstractControl) => control.disabled);
  }

  /** @internal */
  protected override _find(name: number): AbstractControl | null {
    return this.controls[name] || null;
  }

}
