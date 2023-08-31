import { AbstractControl, FormControlStatus } from './abstract_control';
import { FormControl } from './form_control';


export class FormGroup extends AbstractControl {

  controls: { [key: string]: FormControl } = {};
  modelToView!: Function;

  constructor(controls: { [key: string]: FormControl }) {
    super();

    this.controls = controls;
  }

  get(name: string): FormControl {
    return this.controls[name] || null;
  }

  getValue(): { [key: string]: any } {
    const controls: { [key: string]: any } = {};

    Object.entries(this.controls).map(([key, value]) => {
      controls[key] = (value as FormControl).value;
    });

    return controls;
  }

  override setValue(value: any, options: { emitValue?: boolean } = { emitValue: true }) {
    // TODO - Override values of the controls only if the user have passed the same keys
    this.value = value;
    this.validate();

    if (options.emitValue) {
      this.valueChanges.next(value);
      this.modelToView(value);
    }
  }

  override patchValue(value: { [key: string]: any }): void {
    Object.keys(value).forEach((name: string) => {
      const control: FormControl = this.controls[name];

      if (control) {
        control.patchValue(value[name]);
      }
    });
  }

  override validate(): boolean {
    let isValid = true;

    for (const control of Object.values(this.controls)) {
      if (!control.validate()) {
        (this as {status: FormControlStatus}).status = FormControlStatus.INVALID;
        isValid = false;
        console.log(control.errors);
      }
    }

    (this as {status: FormControlStatus}).status = FormControlStatus.VALID;
    return isValid;
  }

}
