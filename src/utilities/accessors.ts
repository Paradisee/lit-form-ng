const inputTextAccessor = {
  setValue: (element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) => {
    element.value = value;
  },
  getValue: (element: HTMLInputElement) => {
    return element.value;
  }
}

const inputNumberAccessor = {
  setValue: (element: HTMLInputElement, value: number) => {
    element.value = value === null ? '' : value.toString();
  },
  getValue: (element: HTMLInputElement) => {
    return element.value === '' ? null : parseFloat(element.value);
  }
}

const inputCheckboxAccessor = {
  setValue: (element: HTMLInputElement, value: boolean) => {
    element.checked = value;
  },
  getValue: (element: HTMLInputElement) => {
    return element.checked;
  }
}

const selectMultipleAccessor = {
  setValue: (element: HTMLSelectElement, values: Array<any> = []) => {
    for (let i = 0; i < element.options.length; i++) {
      element.options[i].selected = values.includes(element.options[i].value);
    }
  },
  getValue: (element: HTMLSelectElement) => {
    return Array.from(element.selectedOptions).map((option: HTMLOptionElement) => {
      return option.value;
    });
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
