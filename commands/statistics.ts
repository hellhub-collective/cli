import chalk from "chalk";
import Table from "cli-table3";
import { formatMoney } from "accounting";
import type { Command } from "commander";
import HellHub, { type Stat } from "@hellhub-collective/sdk";

import ascii from "utils/ascii";
import output from "utils/output";
import request from "utils/request";
import interval from "utils/interval";
import { createListCommand, parseListOptions } from "utils/options";

export default function statistics(program: Command) {
  const handler = async (...args: any[]) => {
    const [id, query] = parseListOptions<Stat>(...args);

    const { data, url } = await request<Stat>(HellHub.statistics, id, {
      ...query,
      ...(!id ? { include: ["planet"] } : {}),
    });

    if (!!args[1].raw) {
      output(data, !!args[1].pretty);
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

    for (const p of entries) {
      table.push(
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

    console.log(table.toString());

    if (!!args[1].url) {
      console.log(chalk.bold("\nRequest Source"));
      console.log(chalk.gray(`/${url.split("/").slice(3).join("/")}`));
    }
  };

  createListCommand(
    program,
    "statistics",
    "fetch a list of statistics or get a statistic by id",
  ).action(async (...args: any[]) => {
    await handler(...args);
    if (!args[1].watch) process.exit(0);
    interval(async () => await handler(...args), args[1].watch);
  });
}
