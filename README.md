# EduTrack

EduTrack is a lightweight school management and student tracking web app designed to help teachers and administrators manage academic information through a simple, user-friendly dashboard.

The application provides tools for managing students, assignments, quizzes, exams, grades, and archived records. It is built with plain HTML, CSS, and JavaScript, making it easy to run locally and customize.

## Features

- Teacher dashboard with quick navigation
- Student management
- Assignment tracking
- Quiz and exam overview
- Grade monitoring
- Archive section for past records
- Login and sign-up pages
- Client-side dynamic page routing
- LocalStorage-based authentication and session handling
- JSON-backed application data

## Tech Stack

- HTML5
- CSS3
- JavaScript
- JSON
- Font Awesome

## Project Structure

```text
EduTrack/
├── assets/               # Static assets
├── css/                  # Stylesheets
│   ├── dashboard.css
│   ├── exam.css
│   ├── grades.css
│   ├── landingPage.css
│   ├── login.css
│   ├── style.css
│   └── ...
├── js/                   # JavaScript logic
│   ├── dashboard.js
│   ├── exam.js
│   ├── routing.js
│   ├── login.js
│   ├── student.js
│   ├── quiz.js
│   └── ...
├── json/
│   └── db.json           # Application data
├── pages/
│   ├── dashboard.html
│   ├── student.html
│   ├── assignments.html
│   ├── exams.html
│   ├── grades.html
│   ├── archive.html
│   ├── login.html
│   ├── signUp.html
│   └── ...
├── index.html            # Main application shell
├── .gitignore
└── README.md
```

## Live Demo

Visit the live project here:

- [EduTrack Live Demo](https://your-live-demo-link.com)
  
## Getting Started

### Prerequisites
- node JS 
### Run Locally

Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/ahmadmeshaal/EduTrack.git
cd EduTrack
```

Start a local web server:

```bash
npx json-server --watch db.json --port 3000
```


## Usage

1. Open the application in your browser.
2. Create an account or sign in.
3. Use the dashboard to navigate between:
   - Students
   - Assignments
   - Quizzes
   - Exams
   - Grades
   - Archive
4. Manage and review academic information through the available pages.

## Application Flow

EduTrack uses client-side routing to dynamically load page content into the main application layout. JavaScript manages navigation, authentication state, page interactions, and data handling.

Application data is stored in `json/db.json`, while login and session information are handled using browser `localStorage`.

## Notes

- EduTrack is currently a front-end application.
- It does not currently use a server-side backend or database server.
- Authentication is intended for demonstration and prototype purposes.

\
## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature
   ```

3. Commit your changes:

   ```bash
   git commit -m "Add your feature"
   ```

4. Push the branch:

   ```bash
   git push origin feature/your-feature
   ```

5. Open a pull request.
