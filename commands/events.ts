import chalk from "chalk";
import boxen from "boxen";
import type { Command } from "commander";
import HellHub, { type GlobalEvent } from "@hellhub-collective/sdk";

import ascii from "utils/ascii";
import request from "utils/request";
import { createListCommand, parseListOptions } from "utils/list-options";

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

export default function events(program: Command) {
  createListCommand(
    program,
    "events",
    "fetch a list of events or get a event by id",
  ).action(async (...args) => {
    const [id, query] = parseListOptions<GlobalEvent>(...args);

    const { data, url } = await request<GlobalEvent>(HellHub.events, id, {
      ...query,
      ...(!id ? { limit: 1, sort: ["id:desc"] } : {}),
    });

    if (!!args[1].raw) {
      console.log(data);
      process.exit(0);
    }

    await ascii("events", {
      name: chalk.bold("Event Briefings"),
      description: chalk.gray("List global event briefings."),
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
        title: entry.title ?? undefined,
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
  });
}
