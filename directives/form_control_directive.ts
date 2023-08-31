import { AttributePart, noChange } from 'lit';
import { AsyncDirective, directive, PartInfo } from 'lit/async-directive.js';

import { FormControl } from '../models/form_control';


class FormControlDirective extends AsyncDirective {

  private host: HTMLElement;
  private formControl!: FormControl;

  constructor(partInfo: PartInfo) {
    super(partInfo);

    this.host = (partInfo as AttributePart).element;
  }

  render(formControl: FormControl, name: string) {
    if (!this.formControl) {
      console.log('INIT:', name, 'TYPE:', this.host.tagName);

      this.formControl = formControl;
      this.formControl.modelToView = (value: any) => {
        (this.host as HTMLInputElement).value = value;
      };

      this.formControl.setValue(this.formControl.value);

      this.host.addEventListener('input', (event: Event) => {
        const target = event.target as HTMLInputElement;
        this.formControl.setValue(target.value);
      });
    }

    return noChange;
  }

}


export const formControl = directive(FormControlDirective)
