import chalk from "chalk";
import Table from "cli-table3";
import type { Command } from "commander";
import { formatMoney } from "accounting";
import HellHub, { type Planet } from "@hellhub-collective/sdk";

import ascii from "utils/ascii";
import request from "utils/request";
import interval from "utils/interval";
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
  const handler = async (...args: any[]) => {
    const [id, query] = parseListOptions<Planet>(...args);

    const { data, url } = await request<Planet>(HellHub.planets, id, {
      ...query,
      include: [
        ...(Array.isArray(query.include) ? query.include : [] ?? []),
        "sector",
      ],
    });

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
        "Index",
        "Name",
        "Liberation",
        "Rate",
        "Prediction",
        "Players",
        ...(!!entries?.[0]?.sector ? ["Sector"] : []),
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

        const liberation = (() => {
          const value = p.liberation;
          const str = formatMoney(value, "%", 5, "'", ".", "%v%s");
          return chalk.bold(str);
        })();

        const rate = (() => {
          const value = p.liberationRate;
          const str = `${p.liberationRate > 0 ? "+" : ""}${formatMoney(value, "%", 2, "'", ".", "%v%s")} / h`;
          switch (p.liberationState) {
            case "WINNING": {
              return chalk.green(str);
            }

            case "DRAW": {
              return chalk.yellow(str);
            }

            case "LOSING": {
              return chalk.red(str);
            }

            default: {
              return chalk.gray(str);
            }
          }
        })();

        const status = (() => {
          switch (p.liberationState) {
            case "WINNING": {
              const now_h = p.health;
              const max_h = p.maxHealth;
              const now_p = (now_h / max_h) * 100;
              const lib_r = p.liberationRate;

              // show the time to liberation in minutes, hours and minutes or
              // in days and hours if the time is greater than 24 hours
              const lib_h = (100 - now_p) / lib_r;
              const lib_m = lib_h * 60;
              const lib_d = lib_h / 24;

              if (lib_h < 1) {
                return chalk.green(`${Math.round(lib_m)}m`);
              } else if (lib_h < 24) {
                return chalk.green(
                  `${Math.round(lib_h)}h ${Math.round(lib_m % 60)}m`,
                );
              } else {
                return chalk.green(
                  `${Math.round(lib_d)}d ${Math.round(lib_h % 24)}h`,
                );
              }
            }

            case "DRAW": {
              return chalk.yellow("Draw");
            }

            case "LOSING": {
              return chalk.red("Losing");
            }

            default: {
              return chalk.gray("N/A");
            }
          }
        })();

        return [
          p.id,
          p.index,
          p.name,
          liberation,
          rate,
          status,
          formatMoney(p.players, "", 0, "'", "."),
          ...(p.sector ? [p.sector.name] : []),
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
  };

  createListCommand(
    program,
    "planets",
    "fetch a list of planets or get a planet by id",
  ).action(async (...args: any[]) => {
    await handler(...args);
    if (!args[1].watch) process.exit(0);
    interval(async () => await handler(...args), args[1].watch);
  });
}
