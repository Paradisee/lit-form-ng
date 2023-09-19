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
    this.onBlur = this.onBlur.bind(this);
    this.modelToView = this.modelToView.bind(this);
  }

  protected reconnected(): void {
    this.host.addEventListener('input', this.onInput);
    this.host.addEventListener('blur', this.onBlur);

    this.control.disabledChanges.subscribe((value: boolean) => {
      (this.host as any).disabled = value;
    });
  }

  protected disconnected(): void {
    this.host.removeEventListener('input', this.onInput);
    this.host.removeEventListener('blur', this.onBlur);
  }

  private onInput(event: Event): void {
    if (this.control.updateOn === 'change') {
      this.control.markAsDirty();
      this.viewToModel();
    }
  }

  private onBlur(event: Event): void {
    this.control.markAsTouched();

    if (this.control.updateOn === 'blur') {
      this.control.markAsDirty();
      this.viewToModel();
    }
  }

  private modelToView(): void {
    this.accessor.setValue(this.host, this.control.value);
  }

  private viewToModel(): void {
    const value = this.accessor.getValue(this.host);
    this.control.setValue(value, { emitModelToViewChange: false });
  }

  public render(control: AbstractControl | null, name?: string) {
    if (control === null) {
      throw new Error(`Couldn't find a form control with name: "${name}"`);
    }

    /**
     * This condition is crucial to ensure that, during each host rendering phase,
     * the current directive is consistently and accurately associated with the appropriate control.
     */
    if (this.control !== control) {
      this.control = control;
      this.accessor = accessors(this.host);

      this.reconnected();

      this.control.modelToView = this.modelToView;
      this.control.setValue(this.control.value);
    }

    return noChange;
  }

}

export const connect = directive(ConnectDirective);
