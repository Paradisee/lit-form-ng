# LIT FORM NG

> A Lit Element library to semplify the use of forms in the Angular way.


## Introduction:

For us developers, forms can be a very tedious task of our work. Even the simplest application can quickly become overwhelming, causing us to lose control over the communication flow between states and events.
If you are familiar with Angular forms, then you'll be just fine using this library."


## Features

- **Two Way Bindings**
- **Async Validators** and **Custom Async Validators**
- **Custom Accessors**

## Future implementations

- **FormArray**
- **FormBuilder**


## Properties

> Since each control (FormGroup / FormControl) extend an AbstractControl, they share the same properties.

| Attribute | Type | Description |
|:----------|:----:|:------------|
| parent | AbstractControl \| null | _**readonly**_ The parent control. |
| value | any | _**readonly**_ **FormGroup** An object with a key-value pair for each member control (if not disabled) of the group. |
|  | any | _**readonly**_ **FormControl** The current value. |
| valueChanges | Observable<any> | _**readonly**_ An observable that emits an event every time the value of the control changes  |
| statusChanges | Observable<FormControlStatus> | _**readonly**_ An observable that emits an event every time the status of the control changes |
| disabledChanges | Observable<boolean> | TODO |
| errors | ValidationErrors \| null | _**readonly**_ An object containing any errors generated by failing validation, or null if there are no errors. |
| updateOn | FormHooks | _**readonly**_ Reports the update strategy of the AbstractControl (meaning the event on which the control updates itself). Possible values: 'change' \| 'blur' Default value: 'change' |
| status | FormControlStatus | _**readonly**_ The validation status of the control. |
| valid | boolean | _**readonly**_ A control is valid when its status is VALID. |
| invalid | boolean | _**readonly**_ A control is invalid when its status is INVALID. |
| pending | boolean | _**readonly**_ A control is pending when its status is PENDING. |
| disabled | boolean | _**readonly**_ A control is disabled when its status is DISABLED. |
| enabled | boolean | _**readonly**_ A control is enabled as long as its status is not DISABLED. |
| touched | boolean | _**readonly**_ A control is marked touched once the user has triggered a blur event on it. |
| untouched | boolean | _**readonly**_ A control is untouched if the user has not yet triggered a blur event on it. |
| pristine | boolean | _**readonly**_ A control is pristine if the user has not yet changed the value in the UI. |
| dirty | boolean | _**readonly**_ A control is dirty if the user has changed the value in the UI. |


## Properties (FormGroup)

| Attribute | Type | Description |
|:----------|:----:|:------------|
| controls | any | A collection of child controls. The key for each child is the name under which it is registered. |


## Properties (FormControl)

| Attribute | Type | Description |
|:----------|:----:|:------------|
| defaultValue | any | _**readonly**_ The default value of this FormControl, used whenever the control is reset without an explicit value. |


## Methods

| Method | Description |
|:-------|:------------|
| setValue(value, options) | **FormGroup**: Sets the value of the FormGroup. It accepts an object that matches the structure of the group, with control names as keys. |
|  | **FormControl**: Sets a new value for the form control. |
| getRawValue() | **FormGroup**: The aggregate value of the FormGroup, including any disabled controls. |
|  | **FormControl**: For a simple FormControl, the raw value is equivalent to the value. |
| patchValue() | **FormGroup**: Patches the value of the FormGroup. It accepts an object with control names as keys, and does its best to match the values to the correct controls in the group. |
|  | **FormControl**: Patches the value of a control. |
| disable() | Disables the control. This means the control is exempt from validation checks and excluded from the aggregate value of any parent. Its status is DISABLED. |
| enable() | Enables the control. This means the control is included in validation checks and the aggregate value of its parent. Its status recalculates based on its value and its validators. |
| reset() | **FormGroup**: Resets the FormGroup, marks all descendants pristine and untouched and sets the value of all descendants to their default values, or null if no defaults were provided. |
|  | **FormControl**: Resets the form control, marking it pristine and untouched, and resetting the value. The new value will be the provided value (if passed), null, or the initial value if nonNullable was set in the constructor via FormControlOptions. |
| updateValueAndValidity() | Updates the value and validity status of the control. By default, it also updates the value and validity of its ancestors. |
| setValidators() | Sets the synchronous validators that are active on this control. Calling this overwrites any existing synchronous validators. |
| addValidators() | Add a synchronous validator or validators to this control, without affecting other validators. |
| setAsyncValidators() | Sets the asynchronous validators that are active on this control. Calling this overwrites any existing asynchronous validators.  |
| addAsyncValidators() | Add a synchronous validator or validators to this control, without affecting other validators. |
| setErrors() | Sets errors on a form control when running validations manually, rather than automatically. |
| markAllAsTouched() | Marks the control and all its descendant controls as touched. |
| markAsTouched() | Marks the control as touched. A control is touched by focus and blur events that do not change the value. |
| markAsUntouched() | Marks the control as untouched.  |
| markAsDirty() | Marks the control as dirty. A control becomes dirty when the control's value is changed through the UI; compare markAsTouched. |
| markAsPristine() | Marks the control as pristine. |
| markAsPending() | Marks the control as pending. |


## Methods (FormGroup)

| Method | Description |
|:----------|:------------|
| get | Retrieves a child control given the control's name or path. |


## How to use

```bash
@customElement('my-form')
export class MyForm extends LitElement {

    private form: FormGroup = new FormGroup(this, {
        name: new FormControl(this, 'Carlo', [ Validators.required ]),
        age: new FormControl(this, 34, [ Validators.required ]),
    });

    private onSubmit(event: Event): void {
        console.log(this.form.value);
    }

    protected render(): TemplateResult {
        <form @submit="${this.onSubmit}">
            <div>
                <label>Name:</label>
                <input type="text" ${this.form.connect('name')}>
                ${this.form.get('name')?.errors?.required ? html`<small>Required field</small>` : html``}
            </div>
            <div>
                <label>Age:</label>
                <input type="number" ${this.form.connect('age')}>
                ${this.form.get('age')?.errors?.required ? html`<small>Required field</small>` : html``}
            </div>
        </form>
    }

}
```
