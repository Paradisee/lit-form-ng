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
  }

  if (localName === 'input') {
    switch (type) {
      case 'number':
      case 'range':
        return inputNumberAccessor;
      case 'checkbox':
        return inputCheckboxAccessor;
      case 'file':
        throw new Error(`File accessor isn't supported yet.`);
      case 'radio':
        throw new Error(`Radio accessor isn't supported yet.`);
    }
  }

  return inputTextAccessor;
}
