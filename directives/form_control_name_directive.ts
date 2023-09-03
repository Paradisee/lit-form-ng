import { AttributePart, noChange } from 'lit';
import { AsyncDirective, directive, PartInfo } from 'lit/async-directive.js';

import { FormControl } from '../models/form_control';
import { FormGroup } from '../models/form_group';
import { accessors } from '../utilities/accessors';


class FormControlNameDirective extends AsyncDirective {

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

  private onInput(event: Event): void {
    this.viewToModel();
  }

  private modelToView(value: any): void {
    this.accessor.modelToView(this.host, value);
  }

  private viewToModel(): void {
    this.accessor.viewToModel(this.host, this.formControl);
  }

  public render(formGroup: FormGroup, name: string) {
    if (!this.formControl) {
      const formControl: FormControl | null = formGroup.get(name);

      if (formControl === null) {
        throw new Error(`Couldn't find a [formControlName]="${name}"`);
      } else {
        this.formControl = formControl;
      }

      this.accessor = accessors(this.host);

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


export const formControlName = directive(FormControlNameDirective);
