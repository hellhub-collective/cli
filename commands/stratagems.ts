import chalk from "chalk";
import Table from "cli-table3";
import type { Command } from "commander";
import HellHub, { type Stratagem } from "@hellhub-collective/sdk";

import ascii from "utils/ascii";
import request from "utils/request";
import { createListCommand, parseListOptions } from "utils/options";

export default function stratagems(program: Command) {
  createListCommand(
    program,
    "stratagems",
    "fetch a list of stratagems or get a stratagem by id",
  ).action(async (...args) => {
    const [id, query] = parseListOptions<Stratagem>(...args);

    const { data, url } = await request<Stratagem>(HellHub.stratagems, id, {
      ...query,
    });

    if (!!args[1].raw) {
      console.log(data);
      process.exit(0);
    }

    await ascii("stratagems", {
      name: chalk.bold("Stratagem Index"),
      description: chalk.gray(
        "List of stratagems to obliterate your enemies with.",
      ),
    });

    if (!!args[1].url) {
      console.log(chalk.bold("Data"));
    }

    const entries = Array.isArray(data) ? data : [data];

    const table = new Table({
      style: { head: ["white", "bold"] },
      head: [
        "ID",
        "Codename",
        "Name",
        ...(entries?.[0]?.group ? ["Group"] : []),
        "Uses",
        "Activation",
        "Cooldown",
        "Keys",
      ],
    });

    for (const p of entries) {
      table.push([
        p.id,
        p.codename ?? "",
        p.name,
        ...(p?.group ? [p.group.name] : []),
        p.uses,
        `${p.activation} seconds`,
        p.cooldown !== null ? `${p.cooldown} seconds` : "",
        p.keys
          .map(key => {
            switch (key) {
              case "down":
                return "↓";
              case "up":
                return "↑";
              case "left":
                return "←";
              case "right":
                return "→";
              default:
                return key;
            }
          })
          .map(key => chalk.bold(key))
          .join(" "),
      ]);
    }

    console.log(table.toString());

    if (!!args[1].url) {
      console.log(chalk.bold("\nRequest Source"));
      console.log(chalk.gray(`/${url.split("/").slice(3).join("/")}`));
    }
  });
}
