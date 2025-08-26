create or replace view submission_core_json_v as
select
  s.submission_id,
  jsonb_build_object(
    'submissionId', s.submission_id,
    'authorLastName', s.author_last_name,
    'authorFirstName', s.author_first_name,
    'authorMiddleInitial', s.author_middle_initial,
    'authorFullName', s.author_full_name,
    'otherAuthors', s.other_authors,
    'authorAffiliation', s.author_affiliation,
    'authorAffiliationOther', s.author_affiliation_other,
    'authorAffiliationCombined', s.author_affiliation_combined,
    'authorDepartment', s.author_department,
    'authorEmail', s.author_email,
    'authorPhone', s.author_phone,
    'financialContactFirstName', s.financial_contact_first_name,
    'financialContactLastName',  s.financial_contact_last_name,
    'financialContactEmail',     s.financial_contact_email,
    'financialContactPhone',     s.financial_contact_phone,
    'fundAccount', s.fund_account,
    'requestedAmount', s.requested_amount,
    'articleTitle', s.article_title,
    'articleJournal', s.article_journal,
    'articleStatus', s.article_status,
    'articlePublisher', s.article_publisher,
    'articleLink', s.article_link,
    'submissionStatusId', s.submission_status_id,
    'awardAmount', s.award_amount,
    'accountingSystemNumber', s.accounting_system_number,
    'createdAt', s.created_at,
    'updatedAt', s.updated_at,
    'status', jsonb_build_object(
      'statusId', st.status_id,
      'name', st.name,
      'label', st.label,
      'submissionActive', st.submission_active,
      'submissionSuccessful', st.submission_successful
    )
  ) as submission_json
from submission s
join submission_status st on st.status_id = s.submission_status_id;

create or replace view submission_simple_json_v as
select * from submission_core_json_v;

create or replace view submission_detailed_json_v as
select
  c.submission_id,
  c.submission_json
  || jsonb_build_object(
       'userComments',
         coalesce((
           select jsonb_agg(
                    jsonb_build_object(
                      'userCommentId', uc.user_comment_id,
                      'user',
                        case when au.app_user_id is null then null else jsonb_build_object(
                          'appUserId', au.app_user_id,
                          'kerberos', au.kerberos,
                          'firstName', au.first_name,
                          'lastName',  au.last_name,
                          'email',     au.email,
                          'fullName',  au.full_name
                        ) end,
                      'commentText',   uc.comment_text,
                      'isFromAuthor',  uc.is_from_author,
                      'createdAt',     uc.created_at,
                      'updatedAt',     uc.updated_at
                    )
                    order by uc.created_at
                  )
           from user_comment uc
           left join app_user au on au.app_user_id = uc.app_user_id
           where uc.submission_id = c.submission_id
         ), '[]'::jsonb),
       'transactions',
         coalesce((
           select jsonb_agg(
                    jsonb_build_object(
                      'transactionId',       t.transaction_id,
                      'transactionType',     t.transaction_type,
                      'transactionSubtype',  t.transaction_subtype,
                      'previousStatus',      t.previous_status,
                      'userComment',
                        case when tuc.user_comment_id is null then null else jsonb_build_object(
                          'userCommentId', tuc.user_comment_id,
                          'commentText',   tuc.comment_text,
                          'isFromAuthor',  tuc.is_from_author,
                          'createdAt',     tuc.created_at,
                          'updatedAt',     tuc.updated_at
                        ) end,
                      'appUser',
                        case when tau.app_user_id is null then null else jsonb_build_object(
                          'appUserId', tau.app_user_id,
                          'kerberos',  tau.kerberos,
                          'firstName', tau.first_name,
                          'lastName',  tau.last_name,
                          'email',     tau.email,
                          'fullName',  tau.full_name
                        ) end,
                      'createdAt', t.created_at
                    )
                    order by t.created_at
                  )
           from submission_transaction t
           left join user_comment tuc on tuc.user_comment_id = t.user_comment_id
           left join app_user tau on tau.app_user_id = t.app_user_id
           where t.submission_id = c.submission_id
         ), '[]'::jsonb)
     ) as submission_json
from submission_core_json_v c;
