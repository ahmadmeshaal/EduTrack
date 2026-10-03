const CLIENT_ID ="299700160059-scopmrqq0mnn0pb0a0j2rk7sgm8f015p.apps.googleusercontent.com";

const API_KEY = "AIzaSyApJ-7_yqZIu0eLNXU7KgkBRwrXq3XhX1k";

const DISCOVERY_DOC ="https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";

const SCOPES = "https://www.googleapis.com/auth/calendar.events";

let tokenClient;
let gapiInited = false;
let gisInited = false;

function gapiLoaded() {
  gapi.load("client", async function () {
    try {
      await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
      });
      gapiInited = true;
    } catch (e) {
      console.error("gapi init failed:", e);
    }
  });
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: function () {},
  });
  gisInited = true;
}

function waitFor(cond) {
  return new Promise(function (resolve) {
    const t = setInterval(function () {
      if (cond()) {
        clearInterval(t);
        resolve();
      }
    }, 100);
  });
}

function getGoogleAccessToken() {
  return new Promise(function (resolve, reject) {
    tokenClient.callback = function (response) {
      if (response.error) {
        reject(response);
        return;
      }
      resolve(response.access_token);
    };
    tokenClient.requestAccessToken({
      prompt: gapi.client.getToken() === null ? "consent" : "",
    });
  });
}

async function addExamToCalendar(examName, courseName, deadline) {
  try {
    await waitFor(function () {
      return gapiInited && gisInited;
    });

    if (gapi.client.getToken() === null) {
      await getGoogleAccessToken();
    }

    const startDate = new Date(deadline);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const response = await gapi.client.calendar.events.insert({
      calendarId: "primary",
      resource: {
        summary: examName,
        description: `EduTrack Exam - ${courseName}`,
        start: { dateTime: startDate.toISOString(), timeZone: "Asia/Amman" },
        end: { dateTime: endDate.toISOString(), timeZone: "Asia/Amman" },
      },
    });

    alert("Exam added to Google Calendar!");
    console.log("Calendar Event:", response.result);
  } catch (error) {
    console.error(error);
    alert(
      "Could not add exam: " +
        (error.error ||
          error.result?.error?.message ||
          error.message ||
          "unknown error"),
    );
  }
}
function waitFor(cond) {
  return new Promise(function (resolve) {
    const t = setInterval(function () {
      if (cond()) {
        clearInterval(t);
        resolve();
      }
    }, 100);
  });
}

async function startGoogle() {
  await waitFor(function () {
    return typeof gapi !== "undefined" && typeof google !== "undefined";
  });
  gapiLoaded();
  gisLoaded();
}

startGoogle();