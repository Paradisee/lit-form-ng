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
 *
 * TODO:
 *  rawValue()
 *  reset()
 *  enable()
 *  disable()
 *  validators
 *
 * To implement:
 *  onBlur()
 *  dirty
 *  touched
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
    nome: new FormControl(this, 'Carlo', [ Validators.required ]),
    cognome: new FormControl(this, 'Beccarini', [ Validators.required ]),
    birthDate: new FormControl(this, '', [ Validators.required ]),
    gender: new FormControl(this, null, [ Validators.required ]),
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
      nome: 'Carlo Patched',
      cognome: 'Beccarini Patched',
    });
  }

  private resetFormGroup(): void {
    this.form.reset();
  }

  private disableFormGroup(): void {

  }

  private enableFormGroup(): void {

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
        Errors: ${JSON.stringify(this.nameControl.errors, null, 2)}
      </div>
    `;
  }

  private renderFormGroup(): TemplateResult {
    return html`
      <h2>FormGroup</h2>

      <form>
        <div>
          <label>Nome:</label>
          <input type="text" ${formControlName(this.form, 'nome')}>
          <small>${this.form.get('nome')?.errors?.required ? html`Questo campo è obbligatorio` : html``}</small>
        </div>

        <div>
          <label>Cognome:</label>
          <input type="text" ${formControlName(this.form, 'cognome')}>
          <small>${this.form.get('cognome')?.errors?.required ? html`Questo campo è obbligatorio` : html``}</small>
        </div>

        <div>
          <label>Data di nascita:</label>
          <input type="text" ${formControlName(this.form, 'birthDate')}>
          <small>${this.form.get('birthDate')?.errors?.required ? html`Questo campo è obbligatorio` : html``}</small>
        </div>
<!--
        <div>
          <label>Genere:</label>
          <select name="gender" id="gender" ${formControlName(this.form, 'gender')}>
            <option value="male">M</option>
            <option value="female">F</option>
            <option value="other">Other</option>
          </select>
          <small>${this.form.get('gender')?.errors?.required ? html`Questo campo è obbligatorio` : html``}</small>
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
        Value: ${JSON.stringify(this.form.value, null, 2)}<br>
        Disbled: ${this.form.disabled}<br>
        Enabled: ${this.form.enabled}<br>
        Valid: ${this.form.valid}<br>
        Invalid: ${this.form.invalid}<br>
        Errors: ${JSON.stringify(this.form.errors, null, 2)}
      </div>
    `;
  }

}
