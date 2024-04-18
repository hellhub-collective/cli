import boxen from "boxen";
import chalk from "chalk";
import type { Command } from "commander";
import HellHub, { type Cron } from "@hellhub-collective/sdk";

import ascii from "utils/ascii";
import output from "utils/output";
import request from "utils/request";

function timeAgo(input: Date | string | number) {
  const ranges = [
    ["years", 3600 * 24 * 365],
    ["months", 3600 * 24 * 30],
    ["weeks", 3600 * 24 * 7],
    ["days", 3600 * 24],
    ["hours", 3600],
    ["minutes", 60],
    ["seconds", 1],
  ] as const;

  const formatter = new Intl.RelativeTimeFormat("en-US");
  const date = input instanceof Date ? input : new Date(input);

  const secondsElapsed = (date.getTime() - Date.now()) / 1000;
  for (const [rangeType, rangeVal] of ranges) {
    if (rangeVal < Math.abs(secondsElapsed)) {
      const delta = secondsElapsed / rangeVal;
      return formatter.format(Math.round(delta), rangeType);
    }
  }
}

export default function source(program: Command) {
  const handler = async (...args: any[]) => {
    // @ts-expect-error
    const { data, url } = await request<Cron>(
      HellHub.crons,
      "refresh_from_source",
    );

    if (process.argv.includes("--raw") || process.argv.includes("-r")) {
      output(
        // @ts-expect-error
        data,
        process.argv.includes("--pretty") || process.argv.includes("-p"),
      );
      process.exit(0);
    }

    await ascii("database", {
      name: chalk.bold("Service health"),
      description: chalk.gray("Information about the source refresh cron job"),
    });

    const result = data as Cron;
    const values: string[][] = [];

    values.push([
      "Status",
      chalk.bold(
        result.busy
          ? chalk.yellow("Executing")
          : result.status === "ok"
            ? chalk.green("OK")
            : chalk.red("Error"),
      ),
    ]);

    values.push([
      Array.from({ length: 6 })
        .map(() => "-")
        .join(""),
      Array.from({ length: 62 })
        .map(() => "-")
        .join(""),
    ]);

    if (!result.busy && result.runs.previous) {
      const time = timeAgo(result.runs.previous) ?? "N/A";
      values.push(["Last refresh", time]);
    }

    if (!result.busy && result.runs.next) {
      const time = timeAgo(result.runs.next) ?? "N/A";
      values.push(["Next refresh", time]);
    }

    const str = values.map(s => s.join(": ")).join("\n");
    console.log(
      boxen(
        `${str}${result.busy ? `\n${chalk.bold(chalk.white("Source data is refreshing"))}` : ""}`,
        {
          padding: 1,
          title: chalk.bold("Arrowhead API Synchronization"),
          borderColor: "white",
          borderStyle: "bold",
          width: 78,
        },
      ),
    );

    if (process.argv.includes("--url") || process.argv.includes("-u")) {
      console.log(chalk.bold("\nRequest Source"));
      console.log(chalk.gray(`/${url.split("/").slice(3).join("/")}`));
    }
  };

  program
    .command("health")
    .description("displays the health of the source refresh cron job")
    .option("-u, --url [boolean]", "prints the request url")
    .option("-a, --no-ascii [boolean]", "disables the ascii art headers")
    .option("-r, --raw [boolean]", "outputs the raw response data as json")
    .option("-p, --pretty [boolean]", "use with --raw to pretty print the json")
    .action(handler);
}
