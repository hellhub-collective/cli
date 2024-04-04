import chalk from "chalk";
import Table from "cli-table3";
import type { Command } from "commander";

import HellHub, {
  type Sector,
  type APIResponse,
} from "@hellhub-collective/sdk";

import ascii from "utils/ascii";
import { createListCommand, parseListOptions } from "utils/list-options";

export default function sectors(program: Command) {
  createListCommand(
    program,
    "sectors",
    "fetch a list of sectors or get a sector by id",
  ).action(async (...args) => {
    const [id, query] = parseListOptions(...args);

    let response: APIResponse<Sector | Sector[]> | undefined;
    if (!!id) {
      response = await HellHub.sectors(id, { query });
    } else {
      response = await HellHub.sectors(query);
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
      console.log(chalk.gray(`/${response.url.split("/").slice(3).join("/")}`));
    }
  });
}
