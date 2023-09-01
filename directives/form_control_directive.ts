import { AttributePart, noChange } from 'lit';
import { AsyncDirective, directive, PartInfo } from 'lit/async-directive.js';

import { FormControl } from '../models/form_control';
import { accessors } from '../utilities/accessors';


class FormControlDirective extends AsyncDirective {

  private host: HTMLElement;
  private formControl!: FormControl;
  private accessor: any;

  constructor(partInfo: PartInfo) {
    super(partInfo);

    this.host = (partInfo as AttributePart).element;

    this.onInput = this.onInput.bind(this);
    this.modelToView = this.modelToView.bind(this);
  }

  protected reconnected(): void {
    this.host.addEventListener('input', this.onInput);

    this.formControl.disabledChanges.subscribe((value: boolean) => {
      (this.host as any).disabled = value;
    });
  }

  protected disconnected(): void {
    this.host.removeEventListener('input', this.onInput);
  }

  private getAccessor(): any | null {
    for (const [selector, accessor] of Object.entries(accessors)) {
      if (this.host.matches(selector)) {
        return accessor;
      }
    }
    return null;
  }

  private onInput(event: Event): void {
    this.viewToModel();
  }

  private modelToView(value: any): void {
    this.accessor.modelToView(this.host, value);
  }

  private viewToModel(): void {
    this.accessor.viewToModel(this.host, this.formControl);
  }

  public render(formControl: FormControl) {
    if (!this.formControl) {
      this.formControl = formControl;

      this.accessor = this.getAccessor();

      if (this.accessor === null) {
        // TODO - Throw a valid accessor error
        throw new Error('Accessor error');
      }

      this.reconnected();

      this.formControl.modelToView = this.modelToView;
      this.formControl.setValue(this.formControl.value);
    }

    return noChange;
  }

}


export const formControl = directive(FormControlDirective);
