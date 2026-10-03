const CLIENT_ID =
  "299700160059-scopmrqq0mnn0pb0a0j2rk7sgm8f015p.apps.googleusercontent.com";

const API_KEY =
  "AIzaSyApJ-7_yqZIu0eLNXU7KgkBRwrXq3XhX1k";

const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";

const SCOPES =
  "https://www.googleapis.com/auth/calendar";


let tokenClient;
let gapiInited = false;
let gisInited = false;
let accessToken = null;


// Google API
function gapiLoaded() {

  gapi.load("client", initializeGapiClient);

}


// Initialize Google API
async function initializeGapiClient() {

  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC]
  });

  gapiInited = true;

}


// Google authentication
function gisLoaded() {

  tokenClient = google.accounts.oauth2.initTokenClient({

    client_id: CLIENT_ID,

    scope: SCOPES,

    callback: ""
  });

  gisInited = true;

}


// Get permission
function getGoogleAccessToken() {

  return new Promise(function (resolve, reject) {

    tokenClient.callback = function (response) {

      if (response.error) {

        reject(response);

        return;
      }

      accessToken = response.access_token;

      resolve(accessToken);
    };


    tokenClient.requestAccessToken({
      prompt: "consent"
    });

  });

}


// Add exam to Google Calendar
async function addExamToCalendar(
  examName,
  courseName,
  deadline
) {

  try {

    // Initialize Google APIs
    if (!gapiInited) {
      await new Promise(resolve => {

        const check = setInterval(function () {

          if (gapiInited) {

            clearInterval(check);
            resolve();

          }

        }, 100);

      });
    }


    // Login / permission
    if (!accessToken) {

      await getGoogleAccessToken();

    }


    const startDate = new Date(deadline);

    // Exam duration = 1 hour
    const endDate =
      new Date(startDate.getTime() + 60 * 60 * 1000);


    const event = {

      summary: examName,

      description:
        `EduTrack Exam - ${courseName}`,

      start: {

        dateTime: startDate.toISOString(),

        timeZone: "Asia/Amman"

      },

      end: {

        dateTime: endDate.toISOString(),

        timeZone: "Asia/Amman"

      }

    };


    const response =
      await gapi.client.calendar.events.insert({

        calendarId: "primary",

        resource: event

      });

    alert("Exam added to Google Calendar!");


    console.log(
      "Calendar Event:",
      response.result
    );


  } catch (error) {

    console.error(error);

    alert(
      "Could not add exam to Google Calendar."
    );

  }

}


// Start Google APIs
window.addEventListener("load", function () {

  gapiLoaded();

  gisLoaded();

});