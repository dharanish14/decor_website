const APP_NAME = 'Elshadai Decors';
const DATABASE_NAME = 'Elshadai Website Database';
const DATABASE_SPREADSHEET_ID = '1xPVTiFsp_-2hnfb3SlfXkqhvFKceQTKr8zzZ3mOVzks';
const IMAGE_FOLDER_NAME = 'Elshadai Website Images';
const LEADS_TAB = 'Leads';
const CONTENT_TAB = 'Content';
const LEAD_HEADERS = ['id', 'createdAt', 'name', 'email', 'phone', 'serviceType', 'budget', 'message', 'status', 'source'];

function setupElshadai() {
  const spreadsheet = ensureDatabase_();
  const folder = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('IMAGE_FOLDER_ID'));

  leadsSheet_();
  contentSheet_();
  let settings = spreadsheet.getSheetByName('Settings');
  if (!settings) settings = spreadsheet.insertSheet('Settings');
  settings.clear();
  settings.getRange(1, 1, 5, 2).setValues([
    ['Setting', 'Value'],
    ['Application', APP_NAME],
    ['Spreadsheet URL', spreadsheet.getUrl()],
    ['Drive folder URL', folder.getUrl()],
    ['Web app URL', 'https://script.google.com/macros/s/AKfycbxMCwPYLXYQlibvSujWGbB2y-jGfLlD8Tl8-J55kZBAI4L78VDYhwldzJT1z6dAm3wW/exec']
  ]);
  Logger.log('Spreadsheet: ' + spreadsheet.getUrl());
  Logger.log('Drive folder: ' + folder.getUrl());
  Logger.log('Setup complete. Deploy this project as a Web app.');
}

function ensureDatabase_() {
  const properties = PropertiesService.getScriptProperties();
  let spreadsheet = SpreadsheetApp.openById(DATABASE_SPREADSHEET_ID);
  properties.setProperty('SPREADSHEET_ID', DATABASE_SPREADSHEET_ID);

  let folderId = properties.getProperty('IMAGE_FOLDER_ID');
  let folder = folderId ? DriveApp.getFolderById(folderId) : null;
  if (!folder) {
    folder = DriveApp.createFolder(IMAGE_FOLDER_NAME);
    properties.setProperty('IMAGE_FOLDER_ID', folder.getId());
  }
  return spreadsheet;
}

function spreadsheet_() {
  return ensureDatabase_();
}

function leadsSheet_() {
  const spreadsheet = spreadsheet_();
  let sheet = spreadsheet.getSheetByName(LEADS_TAB);
  if (!sheet) {
    const firstSheet = spreadsheet.getSheets()[0];
    if (firstSheet && firstSheet.getLastRow() <= 1 && !['Content', 'Settings'].includes(firstSheet.getName())) {
      firstSheet.setName(LEADS_TAB);
      sheet = firstSheet;
    } else {
      sheet = spreadsheet.insertSheet(LEADS_TAB);
    }
  }
  if (sheet.getLastRow() === 0) sheet.appendRow(LEAD_HEADERS);
  if (sheet.getLastRow() === 1 && sheet.getRange(1, 1).getValue() !== LEAD_HEADERS[0]) sheet.getRange(1, 1, 1, LEAD_HEADERS.length).setValues([LEAD_HEADERS]);
  return sheet;
}

function contentSheet_() {
  const spreadsheet = spreadsheet_();
  const sheet = spreadsheet.getSheetByName(CONTENT_TAB) || spreadsheet.insertSheet(CONTENT_TAB);
  if (sheet.getLastRow() === 0) sheet.appendRow(['key', 'json', 'updatedAt']);
  return sheet;
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(event) {
  try {
    const action = event.parameter.action || 'content';
    if (action === 'content') {
      const values = contentSheet_().getDataRange().getValues();
      const row = values.length > 1 ? values[values.length - 1] : null;
      return json_({ success: true, content: row && row[1] ? JSON.parse(row[1]) : null });
    }
    if (action === 'listLeads') {
      const values = leadsSheet_().getDataRange().getValues();
      const headers = values.shift() || LEAD_HEADERS;
      const leads = values.filter(row => row.some(Boolean)).map(row => {
        const lead = {};
        headers.forEach((header, index) => lead[header] = row[index] || '');
        return lead;
      });
      return json_({ success: true, leads: leads.reverse() });
    }
    return json_({ success: true });
  } catch (error) {
    return json_({ success: false, error: String(error) });
  }
}

function doPost(event) {
  try {
    const data = JSON.parse(event.postData.contents);
    if (data.action === 'saveContent') {
      contentSheet_().appendRow(['public', JSON.stringify(data.content), new Date().toISOString()]);
      return json_({ success: true });
    }
    if (data.action === 'uploadImage') {
      const folderId = PropertiesService.getScriptProperties().getProperty('IMAGE_FOLDER_ID');
      const folder = DriveApp.getFolderById(folderId);
      const blob = Utilities.newBlob(Utilities.base64Decode(data.data), data.mimeType, data.name);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return json_({ success: true, url: 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1600', fileId: file.getId() });
    }
    if (data.action === 'updateLead' || data.action === 'deleteLead') {
      const sheet = leadsSheet_();
      const values = sheet.getDataRange().getValues();
      const idColumn = LEAD_HEADERS.indexOf('id');
      for (let row = 1; row < values.length; row++) {
        if (String(values[row][idColumn]) !== String(data.id)) continue;
        if (data.action === 'deleteLead') sheet.deleteRow(row + 1);
        else if (data.status) sheet.getRange(row + 1, LEAD_HEADERS.indexOf('status') + 1).setValue(data.status);
        return json_({ success: true });
      }
      return json_({ success: false, error: 'Lead not found' });
    }
    if (data.name && data.email && data.phone) {
      leadsSheet_().appendRow(LEAD_HEADERS.map(header => data[header] || ''));
      try {
        const targetEmail = data.adminNotificationEmail || 'dharaanish@gmail.com';
        MailApp.sendEmail({
          to: targetEmail,
          subject: '🔔 New Website Enquiry: ' + data.name + ' (' + data.phone + ')',
          body: 'New Enquiry Received on Elshadai Decors Website!\n\n' +
                '• Name: ' + data.name + '\n' +
                '• Phone: ' + data.phone + '\n' +
                '• Email: ' + data.email + '\n' +
                '• Service Needed: ' + (data.serviceType || 'General') + '\n' +
                '• Message: ' + (data.message || 'No additional details') + '\n\n' +
                'Date: ' + new Date().toLocaleString()
        });
      } catch (e) { /* ignore email error */ }
      return json_({ success: true });
    }
    return json_({ success: false, error: 'Unknown action' });
  } catch (error) {
    return json_({ success: false, error: String(error) });
  }
}
