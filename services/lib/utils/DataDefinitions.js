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

  static get ARTICLE_STATUSES() {
    return [
      {value: 'in-preparation', label: 'In Preparation'},
      {value: 'submitted', label: 'Submitted'},
      {value: 'accepted', label: 'Accepted'},
      {value: 'past-6-months', label: 'Past 6-Months'},
      {value: 'other', label: 'Other'}
    ];
  }

  static getLabel(list, value) {
    if ( typeof list === 'string' ) {
      if ( typeof DataDefinitions[list] === 'object' ) {
        list = DataDefinitions[list];
      }
    }
    const item = list.find(i => i.value === value);
    return item ? item.label : value;
  }
}

export { DataDefinitions };
