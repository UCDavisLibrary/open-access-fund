import mysql from 'mysql2/promise';

import fundAccountUtils from '../lib/utils/fundAccountUtils.js';

// setup mysql connection
const pool = mysql.createPool({
  connectionLimit: 3,
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  multipleStatements: true
});

class Migration {

  constructor(){
    this.warningsById = {};
  }

  async run(opts={}){
    const bigsysData = await this.getBigsysData({ limit: opts.limit});
    console.log(`Got ${bigsysData.length} applications from bigsys`);

    for (const app of bigsysData) {
      const submission = this.transformSubmission(app);
      console.log(submission);
    }

    await this.writeWarnings();
    this.printWarningCounts();
    pool.end();
  }

  addWarning(appId, warning){
    if ( !this.warningsById[appId] ) this.warningsById[appId] = [];
    this.warningsById[appId].push(warning);
  }

  /**
   * @description Transform bigsys application data for writing to new 'submission' table
   * @param {Object} bigsysApp - bigsys application data
   */
  transformSubmission(bigsysApp){

    const submission = {
      'submitted_at': bigsysApp.submit_date,
      'author_last_name': this.convertStringField(bigsysApp, 'author_last'),
      'author_first_name': this.convertStringField(bigsysApp, 'author_first'),
      'author_middle_initial': bigsysApp.author_mi,
      'other_authors': bigsysApp.author_other,
      'author_department': bigsysApp.author_department,
      'author_email': this.convertStringField(bigsysApp, 'author_email'),
      'author_phone': bigsysApp.author_phone,
      'financial_contact_email': this.convertStringField(bigsysApp, 'contact_email'),
      'financial_contact_phone': this.convertStringField(bigsysApp, 'contact_phone'),
      'fund_account': { bigsysValue: bigsysApp.fund_account },
    };

    // split out author affiliation
    if ( bigsysApp.author_affiliation ){
      const affiliations = {
        'Faculty': 'faculty',
        'Graduate Student': 'grad-student',
        'Post-Doc': 'postdoc',
        'Postdoc': 'postdoc',
        'Staff': 'staff',
        'Resident physician': 'resident',
        'Resident': 'resident'
      };
      if ( affiliations[bigsysApp.author_affiliation] ) {
        submission.author_affiliation = affiliations[bigsysApp.author_affiliation];
      } else {
        submission.author_affiliation = 'other';
        submission.author_affiliation_other = bigsysApp.author_affiliation;
        this.addWarning(bigsysApp.id, {
          type: 'AFFILIATION_MAPPED_TO_OTHER',
          field: 'author_affiliation'
        });
      }
    }

    // parse out fund account
    if ( bigsysApp.contact_name ){
      const nameParts = bigsysApp.contact_name.trim().split(' ');
      if ( nameParts.length === 1 ) {
        submission.financial_contact_first_name = nameParts[0];
        submission.financial_contact_last_name = '';
        this.addWarning(bigsysApp.id, {
          type: 'CONTACT_NAME_NO_LAST_NAME',
          field: 'contact_name'
        });
      } else if ( nameParts.length === 2 ) {
        submission.financial_contact_first_name = nameParts[0];
        submission.financial_contact_last_name = nameParts[1];
      } else if ( nameParts.length > 2 ) {
        submission.financial_contact_first_name = nameParts.slice(0,nameParts.length-1).join(' ');
        submission.financial_contact_last_name = nameParts[nameParts.length-1];
        this.addWarning(bigsysApp.id, {
          type: 'CONTACT_NAME_MORE_THAN_TWO_PARTS',
          field: 'contact_name'
        });
      } else {
        submission.financial_contact_first_name = '';
        submission.financial_contact_last_name = '';
        this.addWarning(bigsysApp.id, {
          type: 'CONTACT_NAME_NO_PARTS',
          field: 'contact_name'
        });
      }

    } else {
      submission.financial_contact_first_name = '';
      submission.financial_contact_last_name = '';
      this.addWarning(bigsysApp.id, {
        type: 'MISSING_CONTACT_NAME',
        field: 'contact_name'
      });
    }

    // parse fund account
    if ( bigsysApp.fund_account?.trim?.() ) {

    } else {
      this.addWarning(bigsysApp.id, {
        type: 'MISSING_FUND_ACCOUNT',
        field: 'fund_account'
      });
    }

    return submission;
  }

  convertStringField(app, fieldName){
    if ( !app[fieldName]?.trim?.()) {
      this.addWarning(app.id, {
        type: `MISSING_${fieldName.toUpperCase()}`,
        field: fieldName
      });
      return '';
    }
    return app[fieldName].trim();
  }

  /**
   * @description Get data from bigsys database
   * @returns
   */
  async getBigsysData(opts={}) {
    let [applications = rows ] = await pool.query('SELECT * FROM applications');
    const [applicationsHistory = rows ] = await pool.query('SELECT * FROM applications_history');

    for (const app of applications) {
      app.application_history = applicationsHistory.filter(h => h.application_id === app.id);
    }

    if ( opts.limit ) {
      applications = applications.slice(0,opts.limit);
    }

    return applications;
  }

  printWarningCounts(){
    console.log(`${Object.keys(this.warningsById).length} applications had warnings`);
    const counts = {};
    for (const appId in this.warningsById) {
      const warnings = this.warningsById[appId];
      for (const warning of warnings) {
        if ( !warning.type ) continue;
        if ( !counts[warning.type] ) counts[warning.type] = 0;
        counts[warning.type]++;
      }
    }
    console.log(counts);
  }

  async writeWarnings(){
    await pool.query('DROP TABLE IF EXISTS migration_warnings');
    await pool.query(`
      CREATE TABLE migration_warnings (
        application_id INT NOT NULL,
        warning JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    for (const appId in this.warningsById) {
      const warnings = this.warningsById[appId];
      for (const warning of warnings) {
        await pool.query('INSERT INTO migration_warnings (application_id, warning) VALUES (?,?)', [
          appId,
          JSON.stringify(warning)
        ]);
      }
    }
  }

}

const migration = new Migration();

await migration.run({limit: 1});
