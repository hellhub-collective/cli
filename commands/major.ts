import chalk from "chalk";
import boxen from "boxen";
import { formatMoney } from "accounting";
import type { Command } from "commander";
import HellHub, { type Assignment } from "@hellhub-collective/sdk";

import ascii from "utils/ascii";
import request from "utils/request";
import { createListCommand, parseListOptions } from "utils/list-options";

export default function major(program: Command) {
  createListCommand(
    program,
    "major",
    "show details for the current major order",
  ).action(async (...args) => {
    const [id, query] = parseListOptions(...args);

    const { data, url } = await request<Assignment>(HellHub.assignments, id, {
      ...(!id ? { limit: 1, sort: ["id:desc"] } : {}),
      ...query,
      include: [
        ...(Array.isArray(query.include) ? query.include : [] ?? []),
        "reward",
      ],
    });

    if (!!args[1].raw) {
      console.log(data);
      process.exit(0);
    }

    await ascii("major", {
      name: chalk.bold("Major order"),
      description: chalk.gray("Show details to for the current major order"),
    });

    if (!!args[1].url) {
      console.log(chalk.bold("Data"));
    }

    const entries = Array.isArray(data) ? data : [data];

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      const box = boxen(
        `${entry.description ? `${chalk.bold(entry.description)}\n\n` : ""}${entry.briefing}${
          entry.reward
            ? `\n\n${boxen(
                `${formatMoney(
                  entry.reward.amount,
                  "",
                  0,
                  "'",
                  ".",
                )} ${entry.reward.type === 1 ? "Medals" : ""}`,
                {
                  title: "Reward",
                  borderColor: "blue",
                  padding: 0.4,
                  width: 67,
                },
              )}`
            : ""
        }`,
        {
          title: entry.title,
          width: 75,
          padding: 1,
          borderStyle: "bold",
          borderColor: "yellow",
        },
      );

      console.log(box, entries.length > 1 ? "\n" : "");
    }

    if (!!args[1].url) {
      console.log(chalk.bold("\nRequest Source"));
      console.log(chalk.gray(`/${url.split("/").slice(3).join("/")}`));
    }
  });
}
