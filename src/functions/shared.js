const Airtable = require("airtable");

const airtableApiKey = process.env.AIRTABLE_API_KEY;
const airtableBaseId = process.env.AIRTABLE_BASE_ID;
const airtablePrimaryTableName = process.env.AIRTABLE_PRIMARY_TABLE_NAME;

const airtablePrimaryTableViewName =
  process.env.AIRTABLE_PRIMARY_TABLE_VIEW_NAME;

const base = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId);

const getMatchingUserProfilesAsync = async function(email) {
  const completionPromise = new Promise((resolve, reject) => {
    const matchingRecords = [];
    const filter = {
      filterByFormula: `{Email} = "${email}"`,
      ...(airtablePrimaryTableViewName
        ? { view: airtablePrimaryTableViewName }
        : {})
    };
    base(airtablePrimaryTableName)
      .select(filter)
      .eachPage(
        (records, fetchNextPage) => {
          matchingRecords.push(...records);
          fetchNextPage();
        },
        err => {
          if (err) {
            console.error(err);
            reject(err);
            return;
          }

          resolve(matchingRecords);
        }
      );
  });

  const results = await completionPromise;
  return results.map(r => r.fields);
};

exports.checkUserAuthorizedAsync = async function(email) {
  const matchingProfiles = await getMatchingUserProfilesAsync(email);
  return matchingProfiles.length > 0;
};

exports.getFirstMatchingUserProfile = async function(email) {
  const matchingProfiles = await getMatchingUserProfilesAsync(email);
  return matchingProfiles.length > 0 ? matchingProfiles[0] : null;
};
