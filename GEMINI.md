# Gemini Project Context: Personal Portfolio and Admin Panel

## Project Overview

This is a comprehensive personal portfolio website built as a monorepo using Nx. It includes a public-facing site and a secure admin panel for content management.

-   **Frontend:** The public portfolio is an Angular 21 application. It features a responsive design with light/dark modes, showcases projects and blog posts, and includes "About" and "Contact" pages. It uses Vite for a fast development experience and Tailwind CSS for styling.

-   **Backend:** A Node.js and Express.js API serves the portfolio's content. It connects to a Supabase instance for data storage, authentication, and file management.

-   **Admin Panel:** Integrated within the Angular application, the admin panel provides a secure area for managing projects and blog posts. It uses Supabase for authentication and features a rich text editor (EditorJS) for a seamless content creation experience.

-   **Shared Library:** A shared TypeScript library (`libs/shared`) ensures type safety and code consistency between the frontend and backend applications.

-   **Infrastructure:** The project is designed for deployment on Google Cloud Run and is fully containerized using Docker. It leverages a Supabase backend, including PostgreSQL for the database, Supabase Auth for user management, and Supabase Storage for file uploads.

-   **CI/CD:** The repository includes GitHub Actions workflows for automated testing, building, and deployment to both development and production environments on Google Cloud Run.

## Building and Running

### Development

To run the frontend and backend servers for development:

```bash
npm run dev
```

Alternatively, you can run them separately:

-   **Frontend:** `npm run dev:frontend` (available at `http://localhost:3000`)
-   **Backend:** `npm run dev:backend` (available at `http://localhost:3001`)

### Building

To build all projects for production:

```bash
npm run build
```

To build a specific project:

-   `npm run build:frontend`
-   `npm run build:backend`

### Testing

To run all tests:

```bash
npm run test
```

To run tests for a specific project:

-   `npm run test:frontend`
-   `npm run test:backend`

End-to-end tests are run using Playwright:

```bash
npm run e2e
```

## Development Conventions

-   **Monorepo Management:** This project uses Nx to manage dependencies and streamline development workflows. Use `nx` commands for building, testing, and linting (`npm run affected:build`, `npm run affected:test`, `npm run affected:lint`).

-   **Code Style:** The project uses the standard TypeScript and Angular coding styles. A linting step is included in the CI/CD pipeline to enforce consistency.

-   **Content Management:** Content for projects and blog posts is created and managed through the admin panel. The EditorJS interface is used for rich text editing, and the content is stored in the Supabase database.

-   **Branching Strategy:** The project follows a Gitflow-like branching strategy:
    -   `main`: Represents the production environment.
    -   `dev`: Represents the development environment.
    -   Feature branches: Should be created from `dev`.

-   **Commits:** Commit messages should be clear and concise, providing a summary of the changes.
