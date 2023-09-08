import { ReactiveControllerHost } from 'lit';
import { DirectiveResult } from 'lit/async-directive';

import { connect } from '../directives/connect_directive';
import { AsyncValidatorFn, ValidatorFn } from '../validators';
import { AbstractControl, AbstractControlOptions, pickAsyncValidators, pickValidators } from './abstract_control';


export class FormGroup<T extends Record<string, AbstractControl> = any> extends AbstractControl {

  public controls: T;

  public get value(): Partial<T> {
    return Object.entries(this.controls).reduce((acc, [name, control]) => {
      if (control.disabled) return acc;
      return {
        ...acc,
        [name]: control.value,
      }
    }, {});
  }

  constructor(
    host: ReactiveControllerHost,
    controls: T,
    validatorsOrOptions: Array<ValidatorFn> | AbstractControlOptions = [],
    asyncValidators: Array<AsyncValidatorFn> = []) {
    super(host, pickValidators(validatorsOrOptions), pickAsyncValidators(asyncValidators, validatorsOrOptions));

    this.controls = controls;

    Object.values(this.controls).forEach((control: AbstractControl) => {
      (control as { parent: AbstractControl }).parent = this;
    });
  }

  public connect(name: string): DirectiveResult {
    return connect(this.get(name), name);
  }

  /**
   * Retrieves a child control from the group by its key.
   * @param key - The key (property name) of the child control to retrieve.
   * @returns The child control associated with the specified key, or null if not found.
   */
  public get<K extends keyof T>(key: K): AbstractControl<T[K]> | null {
    return this.controls[key] || null;
  }

  public override getRawValue(): Partial<T> {
    return Object.keys(this.controls).reduce((acc, key) => {
      return {
        ...acc,
        [key]: this.controls[key].getRawValue(),
      }
    }, {});
  }

  public override setValue(value: Record<keyof T, any>, options: { onlySelf?: boolean, emitValue?: boolean } = {}): void {
    const assertAllValuesPresent: boolean = Object.keys(this.controls).every(key => key in value);

    if (!assertAllValuesPresent) {
      throw new Error('You must provide every control to use the setValue method.');
    }

    Object.entries(this.controls).forEach(([key, control]) => {
      control.setValue(value[key], { onlySelf: true, emitValue: options.emitValue });
    });

    if (options.emitValue !== false) {
      this.valueChanges.next(value);
    }

    this.markAsDirty();
    this.updateValueAndValidity(options);
  }

  /**
   * Patches each control within the group with the values provided in the `value` object (if present).
   * @param value - An object containing values to set for specific controls (optional).
   * @param options - Options for patching controls (optional).
   *   - `emitValue`: If `true`, emit value changes; otherwise, suppress value change events (default: true).
   */
  public override patchValue(value: Partial<Record<keyof T, any>>, options: { onlySelf?: boolean, emitValue?: boolean } = {}): void {
    Object.keys(value).forEach((key: keyof T) => {
      this.controls[key]?.setValue(value[key], options);
    });
  }

  /**
   * Resets each control within the group to its default value or to the provided values (if specified).
   * @param value - An object containing values to set for specific controls (optional).
   * @param options - Options for resetting controls (optional).
   *   - `emitValue`: If `true`, emit value changes; otherwise, suppress value change events (default: true).
   */
  public override reset(value: Partial<Record<keyof T, any>> = {}, options: { onlySelf?: boolean, emitValue?: boolean } = {}): void {
    Object.entries(this.controls).forEach(([name, control]) => {
      control.reset(value[name], options);
    });
    this.markAsPristine();
    this.markAsUntouched();
  }

  /**
   * @internal
   * Returns an array of child controls within the group.
   * This method is used internally to iterate through the child controls.
   * @returns An array of child controls.
   */
  protected override _forEachChild(cb: (control: AbstractControl) => void): void {
    Object.values(this.controls).forEach((control: AbstractControl) => cb(control));
  }

  /** @internal */
  protected override _anyControls(condition: (c: AbstractControl) => boolean): boolean {
    for (const control of Object.values(this.controls)) {
      if (condition(control)) {
        return true;
      }
    }
    return false;
  }

  /** @internal */
  protected override _allControlsDisabled(): boolean {
    return Object.values(this.controls).every((control: AbstractControl) => control.disabled);
  }

}
