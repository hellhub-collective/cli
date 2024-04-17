import chalk from "chalk";
import boxen from "boxen";
import type { Command } from "commander";
import HellHub, { type Report } from "@hellhub-collective/sdk";

import ascii from "utils/ascii";
import output from "utils/output";
import request from "utils/request";
import interval from "utils/interval";
import { createListCommand, parseListOptions } from "utils/options";

const border = (message: string) => {
  if (message.includes("MAJOR")) {
    return "yellow";
  }

  if (message.includes("Automaton")) {
    return "red";
  }

  if (message.includes("Terminid")) {
    return "green";
  }

  return "blue";
};

const description = (message: string) => {
  const sentences1 = message.split(". ");
  const title1 = sentences1[0];
  const rest1 = sentences1.slice(1).join(". ");

  if (title1.toUpperCase() === title1) {
    return chalk.bold(title1) + "\n\n" + rest1;
  }

  const sentences2 = message.split(": ");
  const title2 = sentences2[0];
  const rest2 = sentences2.slice(1).join(": ");

  if (title2.toUpperCase() === title2) {
    return chalk.bold(title2) + "\n\n" + rest2;
  }

  return message;
};

export default function reports(program: Command) {
  const handler = async (...args: any[]) => {
    const [id, query] = parseListOptions<Report>(...args);

    const { data, url } = await request<Report>(HellHub.reports, id, {
      ...(!id ? { limit: 1, sort: ["id:desc"] } : {}),
      ...query,
    });

    if (!!args[1].raw) {
      output(data, !!args[1].pretty);
      process.exit(0);
    }

    await ascii("reports", {
      name: chalk.bold("Super Earth Command"),
      description: chalk.gray("List briefings from the frontlines."),
    });

    if (!!args[1].url) {
      console.log(chalk.bold("Data"));
    }

    const entries = Array.isArray(data) ? data : [data];

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      entry.message = entry.message.replace(/<\/?[^>]+(>|$)/g, "");

      const texts = entry.message.split("\n");
      const hasTitle = texts[0].toUpperCase() === texts[0];

      let message = description(
        texts
          .slice(hasTitle ? 1 : 0)
          .join("\n")
          .replace(/^\n/, ""),
      );

      const box = boxen(message, {
        title: hasTitle ? texts[0] : undefined,
        width: 75,
        padding: 1,
        borderStyle: "bold",
        borderColor: border(entry.message),
      });

      console.log(box, entries.length > 1 ? "\n" : "");
    }

    if (!!args[1].url) {
      console.log(chalk.bold("\nRequest Source"));
      console.log(chalk.gray(`/${url.split("/").slice(3).join("/")}`));
    }
  };

  createListCommand(
    program,
    "reports",
    "fetch a list of reports or get a report by id",
  ).action(async (...args: any[]) => {
    await handler(...args);
    if (!args[1].watch) process.exit(0);
    interval(async () => await handler(...args), args[1].watch);
  });
}
