import chalk from "chalk";
import Table from "cli-table3";
import type { Command } from "commander";
import HellHub, { type Sector } from "@hellhub-collective/sdk";

import ascii from "utils/ascii";
import request from "utils/request";
import { createListCommand, parseListOptions } from "utils/list-options";

export default function sectors(program: Command) {
  createListCommand(
    program,
    "sectors",
    "fetch a list of sectors or get a sector by id",
  ).action(async (...args) => {
    const [id, query] = parseListOptions<Sector>(...args);

    const { data, url } = await request<Sector>(HellHub.sectors, id, {
      ...query,
    });

    if (!!args[1].raw) {
      console.log(data);
      process.exit(0);
    }

    await ascii("planets", {
      name: chalk.bold("Galactic Sector Index"),
      description: chalk.gray("List of sectors in the Helldivers 2 universe"),
    });

    if (!!args[1].url) {
      console.log(chalk.bold("Data"));
    }

    const entries = Array.isArray(data) ? data : [data];

    const table = new Table({
      style: { head: ["white", "bold"] },
      head: ["ID", "Name", "Index"],
    });

    table.push(
      ...entries.map(p => {
        return [p.id, p.name, p.index];
      }),
    );

    console.log(table.toString());

    if (!!args[1].url) {
      console.log(chalk.bold("\nRequest Source"));
      console.log(chalk.gray(`/${url.split("/").slice(3).join("/")}`));
    }
  });
}
