import chalk from "chalk";
import Table from "cli-table3";
import type { Command } from "commander";
import { formatMoney } from "accounting";
import HellHub, { type Planet } from "@hellhub-collective/sdk";

import ascii from "utils/ascii";
import request from "utils/request";
import { createListCommand, parseListOptions } from "utils/options";

const owner = (index: number) => {
  switch (index) {
    case 1:
      return chalk.blue("Humans");
    case 2:
      return chalk.green("Terminids");
    case 3:
      return chalk.red("Automatons");
    default:
      return chalk.magenta("Illuminates");
  }
};

export default function planets(program: Command) {
  createListCommand(
    program,
    "planets",
    "fetch a list of planets or get a planet by id",
  ).action(async (...args) => {
    const [id, query] = parseListOptions<Planet>(...args);

    const { data, url } = await request<Planet>(HellHub.planets, id, query);

    if (!!args[1].raw) {
      console.log(data);
      process.exit(0);
    }

    await ascii("planets", {
      name: chalk.bold("Galactic Planet Index"),
      description: chalk.gray("List of planets in the Helldivers 2 universe"),
    });

    if (!!args[1].url) {
      console.log(chalk.bold("Data"));
    }

    const entries = Array.isArray(data) ? data : [data];

    const table = new Table({
      style: { head: ["white", "bold"] },
      head: [
        "ID",
        "Name",
        ...(!!entries?.[0]?.sector ? ["Sector"] : []),
        "Index",
        "Players",
        "Max Health",
        "Health",
        "HP",
        "Regeneration",
        ...(!!entries?.[0]?.owner ? ["Owner"] : []),
        ...(!!entries?.[0]?.initialOwner ? ["Initial Owner"] : []),
      ],
    });

    table.push(
      ...entries.map(p => {
        const hp = (() => {
          const value = (100 / p.maxHealth) * p.health;
          const str = formatMoney(value, "%", 2, "'", ".", "%v%s");
          if (value >= 75) return chalk.green(str);
          if (value >= 50) return chalk.yellow(str);
          if (value >= 25) return chalk.red(str);
          return chalk.red(str);
        })();

        return [
          p.id,
          p.name,
          ...(p.sector ? [p.sector.name] : []),
          p.index,
          formatMoney(p.players, "", 0, "'", "."),
          formatMoney(p.maxHealth, "", 0, "'", "."),
          formatMoney(p.health, "", 0, "'", "."),
          hp,
          `${formatMoney(p.regeneration, "HP/s", 0, "'", ".", "%v %s")}`,
          ...(p.owner?.id ? [owner(p.owner.id)] : []),
          ...(p.initialOwner?.id ? [owner(p.initialOwner.id)] : []),
        ];
      }),
    );

    console.log(table.toString());

    if (!!args[1].url) {
      console.log(chalk.bold("\nRequest Source"));
      console.log(chalk.gray(`/${url.split("/").slice(3).join("/")}`));
    }
  });
}
