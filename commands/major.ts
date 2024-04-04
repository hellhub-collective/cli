import chalk from "chalk";
import boxen from "boxen";
import { formatMoney } from "accounting";
import type { Command } from "commander";

import HellHub, {
  type APIResponse,
  type Assignment,
} from "@hellhub-collective/sdk";

import ascii from "utils/ascii";
import { createListCommand, parseListOptions } from "utils/list-options";

export default function major(program: Command) {
  createListCommand(
    program,
    "major",
    "show details for the current major order",
  ).action(async (...args) => {
    const [id, query] = parseListOptions(...args);

    let response: APIResponse<Assignment | Assignment[]> | undefined;
    if (!!id) {
      response = await HellHub.assignments(id, {
        query: {
          ...query,
          include: [
            ...(Array.isArray(query.include) ? query.include : [] ?? []),
            "reward",
          ],
        } as any,
      });
    } else {
      response = await HellHub.assignments({
        limit: 1,
        sort: ["id:desc"],
        ...query,
        include: [
          ...(Array.isArray(query.include) ? query.include : [] ?? []),
          "reward",
        ],
      } as any);
    }

    if (!response) {
      console.error("An error occurred while fetching data.");
      process.exit(1);
    }

    const { data, error } = await response.json();

    if (!response.ok || !!error || !data) {
      console.error(error?.details?.[0]);
      process.exit(1);
    }

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
      console.log(chalk.gray(`/${response.url.split("/").slice(3).join("/")}`));
    }
  });
}
