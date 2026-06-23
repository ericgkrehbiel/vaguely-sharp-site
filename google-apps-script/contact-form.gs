const SHEET_NAME = "Submissions";
const HEADERS = [
  "Timestamp",
  "Name",
  "Email",
  "Message",
  "Source",
  "Page URL",
  "User Agent"
];

function doPost(e) {
  const params = e && e.parameter ? e.parameter : {};

  if (params.website) {
    return textResponse("OK");
  }

  const sheet = getSubmissionsSheet();
  ensureHeaders(sheet);

  sheet.appendRow([
    new Date(),
    params.name || "",
    params.email || "",
    params.message || "",
    params.source || "website",
    params.page_url || "",
    params.user_agent || ""
  ]);

  return textResponse("OK");
}

function getSubmissionsSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);

  return sheet || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeaders(sheet) {
  const range = sheet.getRange(1, 1, 1, HEADERS.length);
  const values = range.getValues()[0];
  const hasHeaders = values.some((value) => value);

  if (!hasHeaders) {
    range.setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function textResponse(message) {
  return ContentService
    .createTextOutput(message)
    .setMimeType(ContentService.MimeType.TEXT);
}
