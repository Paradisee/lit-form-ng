import { html, LitElement, PropertyValueMap, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

import { formControl } from '../directives/form_control_directive';
import { FormControl } from '../models/form_control';
import { Validators } from '../validators';

/**
 * Known bugs:
 *  Whenever a setValue() is called it does not check the type
 *
 * TODO:
 *  reset()
 *  enable()
 *  disable()
 *
 * To implement:
 *  onBlur()
 *  dirty
 *  touched
 */


@customElement('my-form')
export class MyForm extends LitElement {

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

  private forceRender(): void {
    this.requestUpdate();
  }

  protected render(): TemplateResult {
    return this.renderFormControl();
  }

  private renderFormControl(): TemplateResult {
    return html`
      <h2>FormControl</h2>

      <div>
        <label>Name:</label>
        <input type="number" ${formControl(this.nameControl, 'name')}>
        <small>${this.nameControl.errors?.required ? html`Required field` : html``}</small>
      </div>

      <div>
        <button @click="${this.setControlValue}">Set "New Value"</button>
        <button @click="${this.resetControlValue}">Reset</button>
        <button @click="${this.disableControl}">Disable</button>
        <button @click="${this.enableControl}">Enable</button>
        <button @click="${this.forceRender}">FORCE RENDER</button>
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

}
