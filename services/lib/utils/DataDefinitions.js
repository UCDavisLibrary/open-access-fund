class DataDefinitions {

  static get AFFILIATIONS() {
    return [
      {value: 'faculty', label: 'Faculty'},
      {value: 'staff', label: 'Staff'},
      {value: 'postdoc', label: 'Postdoc'},
      {value: 'grad-student', label: 'Graduate Student'},
      {value: 'resident', label: 'Resident'},
      {value: 'other', label: 'Other'}
    ];
  }
}

export { DataDefinitions };
