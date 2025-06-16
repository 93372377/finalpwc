# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Repository Cleanup

The initial template included an archived copy of the project. The `*.zip` file has been removed from version control and is now ignored.

After cloning the repository, install the Node dependencies before running the project or executing lint checks. You can either run `npm install` manually or execute the provided `setup.sh` script:

```sh
npm install
# or
./setup.sh
```

## Project Structure

The application code lives under the `src/` directory. In particular, the main
component is `src/App.jsx`. A similarly named file exists at the repository
root, but it isn't used by Vite. Make sure to update `src/App.jsx` when making
changes to the application logic.

## Error Reporting

File uploads now report the HTTP status code, the server response body, and the
URL that was attempted. This helps diagnose issues such as invalid paths or
authorization errors. If a `400` error persists, double-check the SharePoint
folder path and verify that your account has permission to upload files.
