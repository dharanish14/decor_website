# Google Sheets + Drive backend

The published site uses one Google Apps Script web app as its lightweight backend:

- `Content` sheet stores the public page as one JSON record.
- `Leads` sheet stores enquiry form submissions.
- Google Drive stores uploaded images in one folder.
- Next.js server routes proxy requests, so the browser does not call Apps Script directly.

## Easy setup

1. Go to [script.google.com](https://script.google.com) and create a **New project**.
2. Delete the starter code and paste the complete script from [Code.gs](Code.gs). This workspace file is plain JavaScript with no Markdown fence lines. If you copy from this document instead, copy only the code section.
3. The script is already connected to spreadsheet ID `1xPVTiFsp_-2hnfb3SlfXkqhvFKceQTKr8zzZ3mOVzks`.
4. Click **Save**, select the function `setupElshadai` in the function dropdown, and click **Run**.
4. Approve the Google permissions. This creates the spreadsheet, all tabs, headers, and the Drive image folder automatically.
5. Open **Executions** or the run log to see the created Sheet and Drive URLs.
6. Deploy with **Deploy > New deployment > Web app**.
7. Choose **Execute as: Me** and **Who has access: Anyone**.
8. Copy the deployed URL ending in `/exec`.
9. Add this environment variable to the hosting provider running Next.js:

```text
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

10. Redeploy the website. Open `/admin`, log in, then press **Publish** once to create the initial Content row.

## Apps Script

Use the standalone [Code.gs](Code.gs) file. It is the only authoritative script now. It automatically creates the spreadsheet, `Leads`, `Content`, and `Settings` tabs, and the `Elshadai Website Images` Drive folder.

After replacing your Google Apps Script code with the current `Code.gs`, create a **new deployment version**. Updating the editor code alone does not update an existing Web App deployment.

## Local development

Create `.env.local` in the project root:

```text
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Restart `npm run dev` after changing it. On Vercel or another host, add the same variable in the project environment settings and redeploy.

## Important security note

This lightweight version uses a client-side admin login and a public Apps Script web app. Do not treat it as strong authentication. Before handling sensitive customer data at scale, add server-side authentication and restrict Apps Script requests with a private token. Drive images are intentionally shared as “Anyone with the link” so public visitors can view them.
