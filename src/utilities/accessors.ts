import { FormControl } from '../models/form_control';


const inputTextAccessor = {
  modelToView: (element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) => {
    element.value = value;
  },
  viewToModel: (element: HTMLInputElement, formControl: FormControl) => {
    formControl.setValue(element.value);
  }
}

const inputNumberAccessor = {
  modelToView: (element: HTMLInputElement, value: number) => {
    element.value = value === null ? '' : value.toString();
  },
  viewToModel: (element: HTMLInputElement, formControl: FormControl) => {
    const value: number | null = element.value === '' ? null : parseFloat(element.value);
    formControl.setValue(value, { emitModelToViewChange: false });
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

const selectMultipleAccessor = {
  modelToView: (element: HTMLSelectElement, values: Array<any> = []) => {
    for (let i = 0; i < element.options.length; i++) {
      element.options[i].selected = values.includes(element.options[i].value);
    }
  },
  viewToModel: (element: HTMLSelectElement, formControl: FormControl) => {
    const values = Array.from(element.selectedOptions).map((option: HTMLOptionElement) => {
      return option.value;
    });

    formControl.setValue(values);
  }
}


export function accessors(element: HTMLElement) {
  const localName: string = element.localName;
  const type: string | null = element.getAttribute('type');

  if (localName === 'select') {
    if (element.hasAttribute('multiple')) {
      return selectMultipleAccessor;
    }
    return inputTextAccessor;
  }

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
      case 'date':
        return {};
      default:
        return {};
    }
  }

  return inputTextAccessor;
}
