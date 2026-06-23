# Contact Form Google Sheets Endpoint

This folder stores the source for the Google Apps Script endpoint used by the
website contact form.

## Setup

1. Create or open the Google Sheet that should receive contact submissions.
2. Rename the destination tab to `Submissions`, or let the script create it.
3. In the Sheet, open `Extensions > Apps Script`.
4. Copy the contents of `contact-form.gs` into the Apps Script editor.
5. Click `Deploy > New deployment`.
6. Choose `Web app`.
7. Set `Execute as` to `Me`.
8. Set `Who has access` to `Anyone`.
9. Deploy and copy the Web App URL ending in `/exec`.
10. In `index.html`, replace:

```html
https://script.google.com/macros/s/REPLACE_WITH_DEPLOYMENT_ID/exec
```

with the deployed `/exec` URL.

After redeploying the site, contact form submissions should append rows to the
`Submissions` sheet.
