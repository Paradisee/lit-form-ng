import { FormControl } from '../models/form_control';


export const accessors = {
  'input[type=text]': {
    modelToView: (element: HTMLInputElement, value: string) => {
      element.value = value;
    },
    viewToModel: (element: HTMLInputElement, formControl: FormControl) => {
      formControl.setValue(element.value);
    }
  },
  'input[type=number]': {
    modelToView: (element: HTMLInputElement, value: number) => {
      element.value = value.toString();
    },
    viewToModel: (element: HTMLInputElement, formControl: FormControl) => {
      formControl.setValue(element.valueAsNumber);
    }
  },
  'input[type=checkbox]': {},
  'input[type=color]': {},
  'input[type=email]': {},
  'input[type=file]': {},
  'input[type=password]': {},
  'input[type=radio]': {},
  'input[type=range]': {},
  'input[type=tel]': {},
  'input[type=time]': {},
};
