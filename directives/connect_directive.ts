import { AttributePart, noChange } from 'lit';
import { AsyncDirective, directive, PartInfo } from 'lit/async-directive.js';

import { AbstractControl } from '../models/abstract_control';
import { accessors } from '../utilities/accessors';


class ConnectDirective extends AsyncDirective {

  private host: HTMLElement;
  private control!: AbstractControl;
  private accessor: any;

  constructor(partInfo: PartInfo) {
    super(partInfo);

    this.host = (partInfo as AttributePart).element;

    this.onInput = this.onInput.bind(this);
    this.modelToView = this.modelToView.bind(this);
  }

  protected reconnected(): void {
    this.host.addEventListener('input', this.onInput);

    this.control.disabledChanges.subscribe((value: boolean) => {
      (this.host as any).disabled = value;
    });
  }

  protected disconnected(): void {
    this.host.removeEventListener('input', this.onInput);
  }

  private onInput(event: Event): void {
    this.viewToModel();
  }

  private modelToView(value: any): void {
    this.accessor.modelToView(this.host, value);
  }

  private viewToModel(): void {
    this.accessor.viewToModel(this.host, this.control);
  }

  public render(control: AbstractControl | null, name?: string) {
    if (!this.control) {
      if (control === null) {
        throw new Error(`Couldn't find a form control with name: "${name}"`);
      }

      this.control = control;
      this.accessor = accessors(this.host);

      if (this.accessor === null) {
        // TODO - Throw a valid accessor error
        throw new Error('Accessor error');
      }

      this.reconnected();

      this.control.modelToView = this.modelToView;
      this.control.updateValueAndValidity();
    }

    return noChange;
  }

}

export const connect = directive(ConnectDirective);
