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
}

export { DataDefinitions };
