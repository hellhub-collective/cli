<p align="center">
  <a href="https://github.com/hellhub-collective/sdk">
    <img src="https://raw.githubusercontent.com/hellhub-collective/cli/main/assets/logo.png" width="150px" alt="HellHub CLI Logo" />
  </a>
</p>

<h3 align="center">The Official CLI For The Community Driven HellHub API.</h3>
<p align="center">Written 100% in <a href="https://github.com/microsoft/TypeScript">TypeScript</a> on top of the <a href="https://github.com/hellhub-collective/sdk">HellHub SDK</a>, Filter and collect data without ever leaving your terminal! Perfect for mid-work sneak peaks.</p>

<br />

<p align="center">
  <a href="https://github.com/hellhub-collective/cli/actions/workflows/github-code-scanning/codeql">
    <img src="https://github.com/hellhub-collective/cli/actions/workflows/github-code-scanning/codeql/badge.svg?branch=main" alt="CodeQL" />
  </a>
  <a href="https://github.com/hellhub-collective/cli/actions/workflows/test.yml">
    <img src="https://github.com/hellhub-collective/cli/actions/workflows/test.yml/badge.svg" alt="Tests" />
  </a>
  <a href="https://bundlephobia.com/package/@hellhub-collective/cli">
    <img src="https://img.shields.io/bundlephobia/min/@hellhub-collective/cli" alt="Bundle Size (Minified)" />
  </a>
  <a href="https://bundlephobia.com/package/@hellhub-collective/cli">
    <img src="https://img.shields.io/bundlephobia/minzip/@hellhub-collective/cli" alt="Bundle Size (Minified & Zipped)" />
  </a>
</p>

## What is the HellHub CLI?

The HellHub CLI is a command line utility that allows you to interact with the HellHub API directly from your terminal. You can use the CLI to retrieve data from the HellHub API, filter the data, and display it in a raw or human-readable format.

## Installation

To install the HellHub CLI, you can use npm, yarn or bun. For simplicity, we will use bun in this example:

```bash
bun -g add @hellhub-collective/cli
```

## Usage

To use the HellHub CLI, you can simply type the `hellhub` keyword into your terminal. Let's look at a example command:

```bash
hellhub statistics --limit 10 --filters="planet:name:@not:a"
```

This command will output the statistics for the first 10 planets that do contain the letter "a" in their name:

<p align="center">
    <img src="https://raw.githubusercontent.com/hellhub-collective/cli/main/assets/example-response.png" width="100%" alt="Example Response" />
</p>

Each command outputs a human readable table with the data you requested. You can also use the `--raw` flag to output the data in a raw JSON format.

## Bring your own API

If you are using a self-hosted version of the HellHub API, you can specify the `HELLHUB_API_URL` environment variable to point to your API endpoint. Note that the value will need to include the `/api` path.

```bash
export HELLHUB_API_URL="https://my-hellhub-api.com/api"
```

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/hellhub-collective/sdk/blob/main/LICENSE) file for details.
