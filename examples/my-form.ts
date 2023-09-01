import { html, LitElement, PropertyValueMap, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

import { formControl } from '../directives/form_control_directive';
import { formControlName } from '../directives/form_control_name_directive';
import { FormControl } from '../models/form_control';
import { FormGroup } from '../models/form_group';
import { Validators } from '../validators';

/**
 * Known bugs:
 *  Whenever a setValue() is called it does not check the type
 *  The input[number] sets the value as string instead of a number in the model at first load
 *
 * TODO:
 *  rawValue()
 *  validators
 *
 * To implement:
 *  onBlur()
 *  dirty
 *  touched
 *
 * Think about:
 *  What should happen if a form is disabled and the value changes?
 *  Should it change the view value or no?
 */


interface User {
  nome: string;
  cognome: string;
  birthDate: Date;
  gender: string;
}


@customElement('my-form')
export class MyForm extends LitElement {

  private form: FormGroup = new FormGroup(this, {
    text: new FormControl(this, 'This is an input text', [ Validators.required ]),
    number: new FormControl(this, '13', [ Validators.required ]),
    checkbox: new FormControl(this, true, [ Validators.required ]),
    color: new FormControl(this, '#4911e4', [ Validators.required ]),
    email: new FormControl(this, 'lit-ng-form@email.it', [ Validators.required, Validators.email ]),
    password: new FormControl(this, null, [ Validators.required ]),
    tel: new FormControl(this, '', [ Validators.required ]),
    textArea: new FormControl(this, 'This is a text area', [ Validators.required ]),
  });

  private nameControl: FormControl = new FormControl<string>(this, 'Carlo', [ Validators.required ]);

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this.nameControl.valueChanges.subscribe(value => console.log('valueChanges:', value, typeof(value) === 'number'));
    this.nameControl.statusChanges.subscribe(status => console.log('statusChanges:', status));
  }

  private setControlValue(): void {
    this.nameControl.setValue('New Value');
  }

  private resetControlValue(): void {
    this.nameControl.reset();
  }

  private disableControl(): void {
    this.nameControl.disable();
  }

  private enableControl(): void {
    this.nameControl.enable();
  }

  private patchValueFormGroup(): void {
    this.form.patchValue({
      text: 'This input text has been patched',
      number: 15,
      checkbox: false,
      color: '#11e434',
      email: 'test@test.test',
    });
  }

  private resetFormGroup(): void {
    this.form.reset({
      nome: 'This input text has been reset with a new value',
    });
  }

  private disableFormGroup(): void {
    this.form.disable();
  }

  private enableFormGroup(): void {
    this.form.enable();
  }

  protected render(): TemplateResult {
    return html`
      ${this.renderFormControl()}
      ${this.renderFormGroup()}
    `;
  }

  private renderFormControl(): TemplateResult {
    return html`
      <h2>FormControl</h2>

      <div>
        <label>Name:</label>
        <input type="text" ${formControl(this.nameControl)}>
        <small>${this.nameControl.errors?.required ? html`Required field` : html``}</small>
      </div>

      <div>
        <button @click="${this.setControlValue}">Set "New Value"</button>
        <button @click="${this.resetControlValue}">Reset</button>
        <button @click="${this.disableControl}">Disable</button>
        <button @click="${this.enableControl}">Enable</button>
      </div>

      <div>
        Value: ${this.nameControl.value}<br>
        Disbled: ${this.nameControl.disabled}<br>
        Enabled: ${this.nameControl.enabled}<br>
        Valid: ${this.nameControl.valid}<br>
        Invalid: ${this.nameControl.invalid}<br>
        Errors: <pre>${JSON.stringify(this.nameControl.errors, null, 2)}</pre>
      </div>
    `;
  }

  private renderFormGroup(): TemplateResult {
    return html`
      <h2>FormGroup</h2>

      <form>
        <div>
          <label>Input text:</label>
          <input type="text" ${formControlName(this.form, 'text')}>
          <small>${this.form.get('text')?.errors?.required ? html`Required field` : html``}</small>
        </div>

        <div>
          <label>Input number:</label>
          <input type="number" ${formControlName(this.form, 'number')}>
          <small>${this.form.get('number')?.errors?.required ? html`Required field` : html``}</small>
        </div>

        <div>
          <label>Checkbox:</label>
          <input type="checkbox" ${formControlName(this.form, 'checkbox')}>
          <small>${this.form.get('checkbox')?.errors?.required ? html`Required field` : html``}</small>
        </div>

        <div>
          <label>Color:</label>
          <input type="color" ${formControlName(this.form, 'color')}>
          <small>${this.form.get('color')?.errors?.required ? html`Required field` : html``}</small>
        </div>

        <div>
          <label>Email:</label>
          <input type="email" ${formControlName(this.form, 'email')}>
          <small>${this.form.get('email')?.errors?.required ? html`Required field` : html``}</small>
          <small>${this.form.get('email')?.errors?.email ? html`Invalid email` : html``}</small>
        </div>

        <div>
          <label>Password:</label>
          <input type="password" ${formControlName(this.form, 'password')}>
          <small>${this.form.get('password')?.errors?.required ? html`Required field` : html``}</small>
        </div>

        <div>
          <label>Tel:</label>
          <input type="tel" ${formControlName(this.form, 'tel')}>
          <small>${this.form.get('tel')?.errors?.required ? html`Required field` : html``}</small>
        </div>

        <textarea rows="5" cols="33" ${formControlName(this.form, 'textArea')}></textarea>
<!--
        <div>
          <label>Genere:</label>
          <select name="gender" id="gender" ${formControlName(this.form, 'gender')}>
            <option value="male">M</option>
            <option value="female">F</option>
            <option value="other">Other</option>
          </select>
          <small>${this.form.get('gender')?.errors?.required ? html`Required field` : html``}</small>
        </div>
-->
      </form>

      <div>
        <button @click="${this.patchValueFormGroup}">PatchValue</button>
        <button @click="${this.resetFormGroup}">Reset</button>
        <button @click="${this.disableFormGroup}">Disable</button>
        <button @click="${this.enableFormGroup}">Enable</button>
      </div>

      <div>
        Value: <pre>${JSON.stringify(this.form.value, null, 2)}</pre><br>
        Disbled: ${this.form.disabled}<br>
        Enabled: ${this.form.enabled}<br>
        Valid: ${this.form.valid}<br>
        Invalid: ${this.form.invalid}<br>
        Errors: <pre>${JSON.stringify(this.form.errors, null, 2)}</pre>
      </div>
    `;
  }

}
