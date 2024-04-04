import chalk from "chalk";
import Table from "cli-table3";
import type { Command } from "commander";

import ascii from "utils/ascii";
import { createListCommand, parseListOptions } from "utils/list-options";
import HellHub, { type Stat, type APIResponse } from "@hellhub-collective/sdk";
import { formatMoney } from "accounting";

export default function statistics(program: Command) {
  createListCommand(
    program,
    "statistics",
    "fetch a list of statistics or get a statistic by id",
  ).action(async (...args) => {
    const [id, query] = parseListOptions(...args);

    let response: APIResponse<Stat | Stat[]> | undefined;
    if (!!id) {
      response = await HellHub.statistics(id, { query });
    } else {
      response = await HellHub.statistics({
        ...query,
        include: ["planet"],
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

    await ascii("statistics", {
      name: chalk.bold(
        id === "galaxy" ? "Galactic Statistics" : "Planetary Statistics",
      ),
      description: chalk.gray(
        "List of statistics about the galactic frontier.",
      ),
    });

    if (!!args[1].url) {
      console.log(chalk.bold("Data"));
    }

    const entries = Array.isArray(data) ? data : [data];

    const table = new Table({
      style: { head: ["white", "bold"] },
      head: [
        "Planet",
        "Deaths",
        "Terminids Kills",
        "Automaton Kills",
        "Illuminate Kills",
        "Team Kills",
        "Mission Success Rate",
        "Bullets Fired",
        "Bullets Hit",
      ],
    });

    const items: (string | number)[][] = [];
    for (const p of entries) {
      items.push(
        [
          p.planet?.name ?? "Entire Galaxy",
          formatMoney(p.deaths, "", 0, "'", "."),
          chalk.green(formatMoney(p.bugKills, "", 0, "'", ".")),
          chalk.red(formatMoney(p.automatonKills, "", 0, "'", ".")),
          chalk.magenta(formatMoney(p.illuminateKills, "", 0, "'", ".")),
          chalk.blue(formatMoney(p.friendlyKills, "", 0, "'", ".")),
          formatMoney(p.missionSuccessRate, "%", 2, "'", ".", "%v%s"),
          formatMoney(p.bulletsFired, "", 0, "'", "."),
          formatMoney(p.bulletsHit, "", 0, "'", "."),
        ].map(f => {
          if (p.planet?.name) return f;
          return chalk.bold(f);
        }),
      );
    }

    table.push(...items);

    console.log(table.toString());

    if (!!args[1].url) {
      console.log(chalk.bold("\nRequest Source"));
      console.log(chalk.gray(`/${response.url.split("/").slice(3).join("/")}`));
    }
  });
}
