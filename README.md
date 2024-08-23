# Path Injector

Path Injector is a Visual Studio Code extension that automatically inserts the relative file path at the top of your documents.

## Features

- Automatically adds or updates a comment with the relative file path at the top of supported files.
- Works with a wide range of programming and markup languages.
- Removes existing comments at the top of the file that don't start with "// Path:".

## Installation

1. Open Visual Studio Code
2. Go to the Extensions view (Ctrl+Shift+X)
3. Search for "Path Injector"
4. Click Install

## Usage

Path Injector works automatically when you save a supported file. No additional actions are required.

## Configuration

The extension can be enabled or disabled using the following setting:

- `pathInserter.enabled`: Enable or disable the Path Inserter extension (default: true)

You can modify this setting in your VSCode settings (File > Preferences > Settings).

## Supported Languages

Path Injector supports a wide range of languages, including:

C, C++, C#, CSS, Dart, Go, HTML, Java, JavaScript, JavaScript React, Kotlin, Less, PHP, Plaintext, Prisma, Python, Ruby, Rust, SCSS, Swift, TypeScript, TypeScript React

## Commands

Path Injector adds the following command to the Command Palette:

- `Path Injector: Insert Path`: Manually insert the relative path at the cursor position

## Known Issues

Please report any issues you encounter on the [GitHub issues page](https://github.com/Lenoux01/path-injector/issues).

## Release Notes

### 1.5.0

- Added configuration option to enable/disable the extension
- Improved handling of existing path comments
- Added manual command to insert path

### 1.1.0

- Added support for multiple new languages
- Improved handling of existing comments

### 1.0.0

Initial release of Path Injector

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This extension is licensed under the [MIT License](LICENSE).

## For more information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy a cold blond Dithmarscher!**