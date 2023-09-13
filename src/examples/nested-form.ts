import { html, LitElement, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

import { FormControl } from '../models/form_control';
import { FormGroup } from '../models/form_group';
import { Validators } from '../validators';


@customElement('nested-form')
export class NestedForm extends LitElement {

  private form: FormGroup = new FormGroup(this, {
    name: new FormControl(this, '', [ Validators.required ]),
    age: new FormControl(this, null, { validators: [ Validators.required ] }),
    addresses: new FormGroup(this, {
      home: new FormControl(this, '', [ Validators.required ]),
      work: new FormControl(this, ''),
    }),
  }, { updateOn: 'blur' });

  private onSubmit(event: Event): void {
    event.preventDefault();
    if (this.form.invalid) return;
    console.log(this.form.value);
  }

  protected render(): TemplateResult {
    return html`
      <h2>Nested Form</h2>

      <form>
        <div>
          <label>Name*</label><br>
          <input type="text" ${this.form.connect('name')}>
          ${this.form.get('name')?.errors?.required && this.form.get('name')?.dirty ? html`
            <div><small>Required field</small></div>
          ` : html``}
        </div>

        <div>
          <label>Age*</label><br>
          <input type="number" ${this.form.connect('age')}>
          ${this.form.get('age')?.errors?.required && this.form.get('age')?.dirty ? html`
            <div><small>Required field</small></div>
          ` : html``}
        </div>

        <div>
          <label>Home Address*</label><br>
          <input type="text" ${this.form.connect('addresses.home')}>
          ${this.form.get('addresses.home')?.errors?.required && this.form.get('addresses.home')?.dirty ? html`
            <div><small>Required field</small></div>
          ` : html``}
        </div>

        <div>
          <label>Work Address</label><br>
          <input type="text" ${this.form.connect('addresses.work')}>
        </div>

        <button type="button" ?disabled="${this.form.invalid}" @click="${this.onSubmit}">SUBMIT</button>
      </form>
    `;
  }

}
