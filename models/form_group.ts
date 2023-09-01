import { ReactiveController, ReactiveControllerHost } from 'lit';

import { ValidationErrors } from '../validators';
import { AbstractControl } from './abstract_control';
import { FormControl } from './form_control';


export class FormGroup<T extends Record<string, FormControl> = any> extends AbstractControl implements ReactiveController {

  controls: T;

  get value(): Partial<T> {
    return Object.keys(this.controls).reduce((acc, key) => {
      if (this.controls[key]?.disabled) return acc;
      return {
        ...acc,
        [key]: this.controls[key].value,
      }
    }, {});
  }

  constructor(host: ReactiveControllerHost, controls: T) {
    super();

    this.host = host;
    this.controls = controls;

    host.addController(this);
  }

  get<K extends keyof T>(key: K): FormControl<T[K]> | null {
    return this.controls[key] || null;
  }

  // TODO
  // Allow the setValue method only if the passed values are effectively keys (controls)
  override setValue(value: T, options: { emitValue: boolean } = { emitValue: true }): void {

  }

  override patchValue(value: Partial<Record<keyof T, any>>, options: { emitValue: boolean } = { emitValue: true }): void {
    Object.keys(value).forEach((key: keyof T) => {
      this.controls[key]?.setValue(value[key], options);
    });
  }

  override reset(value: Partial<Record<keyof T, any>> = {}, options: { emitValue: boolean } = { emitValue: true }): void {
    Object.entries(this.controls).forEach(([name, control]) => {
      control.reset(value[name], options);
    });
  }

  override _forEachChild(): Array<AbstractControl> {
    return Object.values(this.controls);
  }

  // TODO
  _runValidators(): ValidationErrors | null {
    return null;
  }

}
