import { FormControl } from '../models/form_control';


const inputTextAccessor = {
  modelToView: (element: HTMLInputElement | HTMLTextAreaElement, value: string) => {
    element.value = value;
  },
  viewToModel: (element: HTMLInputElement, formControl: FormControl) => {
    formControl.setValue(element.value);
  }
}

const inputNumberAccessor = {
  modelToView: (element: HTMLInputElement, value: number) => {
    element.value = value.toString();
  },
  viewToModel: (element: HTMLInputElement, formControl: FormControl) => {
    formControl.setValue(element.valueAsNumber);
  }
}

const inputCheckboxAccessor = {
  modelToView: (element: HTMLInputElement, value: boolean) => {
    element.checked = value;
  },
  viewToModel: (element: HTMLInputElement, formControl: FormControl) => {
    formControl.setValue(element.checked);
  }
}


export function accessors(element: HTMLElement) {
  const localName: string = element.localName;
  const type: string | null = element.getAttribute('type');

  if (localName === 'textarea') {
    return inputTextAccessor;
  }

  if (localName === 'input') {
    switch (type) {
      case 'text':
      case 'color':
      case 'email':
      case 'password':
      case 'tel':
        return inputTextAccessor;
      case 'number':
        return inputNumberAccessor;
      case 'checkbox':
        return inputCheckboxAccessor;
      case 'file':
        return {};
      case 'radio':
        return {};
      case 'range':
        return {};
      case 'time':
        return {};
      default:
        return {};
    }
  }

  return inputTextAccessor;
}
