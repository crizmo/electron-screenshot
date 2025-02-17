# Screenshot Capture and Upload Application [ WIP ]

This project is a simple Electron-based application that allows users to capture screenshots. 
The application uses Electron's desktopCapturer API for capturing screenshots.

## Features

- Capture screenshots of the entire screen or a specific area.
- Convert screenshots to base64 strings for easy transmission.

## Technologies Used

- **Electron**: A framework for building cross-platform desktop applications using web technologies.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/crizmo/electron-screenshot.git
    ```

2. Navigate to the project directory:

    ```bash
    cd electron-screenshot
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Start the application:

    ```bash
    npm start
    ```

## Usage

1. Create an `uploads` folder at the root of the project
2. Launch the application.
3. Capture a screenshot of the desired area or the entire screen by using the keyboard shortcut configured in [main.js](main.js) (Cmd + I)

> [!WARNING]
> On macOS 10.15 Catalina or higher, capturing the user's screen requires the user's consent ([source](https://www.electronjs.org/docs/latest/api/desktop-capturer#methods))

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.