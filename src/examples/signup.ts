import { html, LitElement, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { AbstractControl } from '../models/abstract_control';

import { FormControl } from '../models/form_control';
import { FormGroup } from '../models/form_group';
import { ValidationErrors, Validators } from '../validators';


function confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const password: AbstractControl | null = (control as FormGroup).get('password');
  const confirmPassword: AbstractControl | null = (control as FormGroup).get('confirmPassword');
  return (password?.value === confirmPassword?.value) ? null : { missmatch: true }
}


@customElement('signup-form')
export class SignUpForm extends LitElement {

  get username(): AbstractControl | null{
    return this.signUpForm.get('username');
  }

  get password(): AbstractControl | null{
    return this.signUpForm.get('password');
  }

  get confirmPassword(): AbstractControl | null{
    return this.signUpForm.get('confirmPassword');
  }

  private signUpForm: FormGroup = new FormGroup(this, {
    username: new FormControl(this, '', [ Validators.required, Validators.minLength(5) ]),
    password: new FormControl(this, '', [ Validators.required ]),
    confirmPassword: new FormControl(this, '', [ Validators.required ]),
  }, [ confirmPasswordValidator ]);

  private onSignUp(event: Event): void {
    event.preventDefault();
    if (this.signUpForm.invalid) return;
    console.log(this.signUpForm.value);
  }

  protected render(): TemplateResult {
    return html`
      <h2>Sign Up</h2>

      <form @submit="${this.onSignUp}">
        <div>
          <label>Username</label><br>
          <input type="text" ${this.signUpForm.connect('username')}>
          ${this.username?.errors && this.username?.dirty ? html`
            <div>
              ${this.username?.errors?.required ? html`<div><small>Required field<small></div>` : html``}
              ${this.username?.errors?.minLength ? html`<div><small>Min length 5<small></div>` : html``}
            </div>
          ` : html``}
        </div>

        <div>
          <label>Password</label><br>
          <input type="password" ${this.signUpForm.connect('password')}>
          ${this.password?.errors?.required && this.password?.dirty ? html`
            <div><small>Required field<small></div>
          ` : html``}
        </div>

        <div>
          <label>Confirm Password</label><br>
          <input type="password" ${this.signUpForm.connect('confirmPassword')}>
          ${this.confirmPassword?.errors?.required && this.confirmPassword.dirty ? html`<div><small>Required field</small><div>` : html``}
          ${this.signUpForm?.errors?.missmatch ? html`<div><small>Missmatch password field</small></div>` : html``}
        </div>

        <button type="submit" ?disabled="${this.signUpForm.invalid}">SIGNUP</button>
      </form>
    `;
  }

}
