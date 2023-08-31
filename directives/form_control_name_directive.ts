import { noChange } from 'lit';
import { AsyncDirective } from 'lit/async-directive.js';
import { AttributePart, directive, PartInfo } from 'lit/directive.js';

import { FormControl } from '../models/form_control';
import { FormGroup } from '../models/form_group';


class FormControlNameDirective extends AsyncDirective {

  private host: HTMLElement;
  private formControl!: FormControl;

  constructor(partInfo: PartInfo) {
    super(partInfo);

    this.host = (partInfo as AttributePart).element;
  }

  public render(formGroup: FormGroup, name: string) {
    if (!this.formControl) {
      console.log('INIT:', name, 'TYPE:', this.host.tagName);

      this.formControl = formGroup.controls[name];
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


export const formControlName = directive(FormControlNameDirective);
