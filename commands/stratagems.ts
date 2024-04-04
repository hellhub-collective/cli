import chalk from "chalk";
import Table from "cli-table3";
import type { Command } from "commander";

import HellHub, {
  type Stratagem,
  type APIResponse,
} from "@hellhub-collective/sdk";

import ascii from "utils/ascii";
import { createListCommand, parseListOptions } from "utils/list-options";

export default function stratagems(program: Command) {
  createListCommand(
    program,
    "stratagems",
    "fetch a list of stratagems or get a stratagem by id",
  ).action(async (...args) => {
    const [id, query] = parseListOptions(...args);

    let response: APIResponse<Stratagem | Stratagem[]> | undefined;
    if (!!id) {
      response = await HellHub.stratagems(id, { query });
    } else {
      response = await HellHub.stratagems(query);
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

    const items: (string | number)[][] = [];
    for (const p of entries) {
      items.push([
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

    table.push(...items);

    console.log(table.toString());

    if (!!args[1].url) {
      console.log(chalk.bold("\nRequest Source"));
      console.log(chalk.gray(`/${response.url.split("/").slice(3).join("/")}`));
    }
  });
}
