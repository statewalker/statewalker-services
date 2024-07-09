// export type DataUpdate<T> = (data: T) => void;
// export type DataStore<T> = [data: T, update: DataUpdate<T>];
// export type Deps<T> = Record<keyof T, T[keyof T]>;

// store:PersonalInfo
export type PersonalInfo = {
  firstName: string;
  lastName: string;
  age: number;
};
// store:PersonalInfoForm
export type PersonalInfoForm = Partial<PersonalInfo> & {
  submit: number;
  cancel: number;
  reset: number;
};

export class PersonalInfoApi {
  fields: PersonalInfo;
  update: (data: PersonalInfo) => void;

  constructor([fields, update]: [
    PersonalInfo | undefined,
    (data: PersonalInfo) => void,
  ]) {
    this.fields = fields || {
      firstName: "",
      lastName: "",
      age: 0,
    };
    this.update = update;
  }
}

export class PersonalInfoFormApi {
  static dependencies = {
    data: PersonalInfoApi,
  };
  #dataApi: PersonalInfoApi;

  #form: PersonalInfoForm;
  #formUpdate: (data: PersonalInfoForm) => void;

  #errorMessages?: {
    firstName?: string;
    lastName?: string;
    age?: string;
  };

  constructor(
    form: [PersonalInfoForm | undefined, (data: PersonalInfoForm) => void],
    {
      data,
    }: {
      data: PersonalInfoApi;
    }
  ) {
    this.#dataApi = data;
    this.#form = form[0] || this._getEmptyForm();
    this.#formUpdate = form[1];
  }
  get form(): PersonalInfoForm {
    return this.#form;
  }
  set form(values: Partial<PersonalInfoForm>) {
    const form = { ...this.form, ...values };
    this.#formUpdate(form as PersonalInfoForm);
  }
  get errorMessages(): {
    firstName?: string;
    lastName?: string;
    age?: string;
  } {
    if (!this.#errorMessages) {
      this.#errorMessages = {};
      if (isEmpty(this.#form.firstName)) {
        this.#errorMessages.firstName = "First name is empty";
      }
      if (isEmpty(this.#form.lastName)) {
        this.#errorMessages.lastName = "Last name is empty";
      }
      if (!inRange(this.#form.age, 0, 120)) {
        this.#errorMessages.age = "Age should be in the range 0..120 years";
      }
    }
    return this.#errorMessages;
    function isEmpty(value?: string) {
      return value === undefined || value.trim() === "";
    }
    function inRange(value: undefined | number, min: number, max: number) {
      if (value === undefined) return false;
      return value >= min && value <= max;
    }
  }
  get valid() {
    return Object.keys(this.errorMessages).length === 0;
  }
  get actions() {
    return {
      submit: this.form.submit,
      cancel: this.form.cancel,
    };
  }

  setFirstName(value: string) {
    this.#formUpdate({ ...this.form, firstName: value });
  }
  setLastName(value: string) {
    this.#formUpdate({ ...this.form, lastName: value });
  }
  setAge(value: number) {
    this.#formUpdate({ ...this.form, age: value });
  }
  submit() {
    const { submit, ...form } = this.form;
    this.#formUpdate({ ...form, submit: submit + 1 });
  }
  reset() {
    this.#formUpdate(this._getEmptyForm(this.#form));
  }
  _getEmptyForm(form: Partial<PersonalInfoForm> = {}) {
    return { submit: 0, cancel: 0, reset: 0, ...form, ...this.#dataApi.fields };
  }
}

export function PersonalInfoFormTrigger(
  data: PersonalInfoFormApi,
  prev?: PersonalInfoFormApi
): "ok" | "cancel" | undefined {
  if (!prev) return;
  if (data.actions.submit > prev.actions.submit) return "ok";
  if (data.actions.cancel > prev.actions.cancel) return "cancel";
  return;
}
