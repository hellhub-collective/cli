import { Command } from "commander";
import type { Entity, QueryObject } from "@hellhub-collective/sdk";

import type { ListOptions } from "types/list";

export function createListCommand(
  program: Command,
  command: string,
  description: string,
) {
  return program
    .command(command)
    .description(description)
    .argument("[id]", "the id of the entry to be fetched")
    .option("-u, --url [boolean]", "prints the request url")
    .option("-o, --order-by <string>", "the field to order by")
    .option("-a, --no-ascii [boolean]", "disables the ascii art headers")
    .option("-r, --raw [boolean]", "outputs the raw response data as json")
    .option("-p, --pretty [boolean]", "use with --raw to pretty print the json")
    .option("-s, --start <number>", "the number of entries to skip", parseInt)
    .option("-l, --limit <number>", "the number of entries to fetch", parseInt)
    .option(
      "-w, --watch [interval]",
      "watch the data with a specified interval in seconds",
      parseInt,
    )
    .option("-d, --direction <string>", "the direction to sort by", val => {
      if (["asc", "desc"].includes(val)) return val;
      console.error("Invalid direction. Use 'asc' or 'desc'");
    })
    .option(
      "-f, --filters <string>",
      "filters that can be applied to the query",
      (val, previous) => {
        if (!previous) return [val];
        if (Array.isArray(previous)) return [...previous, val];
        return [previous, val];
      },
    )
    .option(
      "-i, --include <string>",
      "the direction to sort by",
      (val, previous) => {
        if (!previous) return [val];
        if (Array.isArray(previous)) return [...previous, val];
        return [previous, val];
      },
    )
    .option(
      "-t, --select <string>",
      "the fields to select",
      (val, previous) => {
        if (!previous) return [val];
        if (Array.isArray(previous)) return [...previous, val];
        return [previous, val];
      },
    );
}

export function parseListOptions<T extends Entity>(
  ...args: any[]
): [string | undefined, QueryObject<T>] {
  const [id, options] = args as [string | undefined, ListOptions];

  if (!!id && isNaN(parseInt(id)) && id !== "galaxy") {
    console.error("Invalid ID, must be a number.");
    process.exit(1);
  }

  const sort = (() => {
    if (!options.orderBy || !options.direction) return undefined;
    return [`${options.orderBy}:${options.direction}`];
  })();

  const filters = (() => {
    if (!!id) return undefined;
    if (!options.filters) return undefined;

    const obj: Record<any, any> = {};
    for (const expression of options.filters) {
      const targets = expression.split(":");
      const filterIndex = targets.findIndex(t => t.startsWith("@"));
      if (filterIndex === -1 && targets.length !== 2) {
        console.error("Invalid filter expression.");
        process.exit(1);
      }

      // simple filter expression on top level field
      if (targets.length === 3) {
        obj[targets[0]] = { [targets[1].replace("@", "")]: targets[2] };
        continue;
      }

      const value = targets.pop();
      const exps = targets.map(t => t.replace("@", ""));
      obj[exps.join(".")] = value;
      continue;
    }

    // turn the keys into a nested object
    for (const key in obj) {
      const keys = key.split(".");
      if (keys.length === 1) continue;
      const value = obj[key];
      delete obj[key];

      let nested = obj;
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (i === keys.length - 1) {
          nested[k] = value;
          break;
        }

        if (!nested[k]) nested[k] = {};
        nested = nested[k];
      }
    }

    return obj;
  })();

  const query: QueryObject<any> = {
    sort,
    filters,
    limit: options.limit,
    start: options.start,
    select: options.select,
    include: options.include,
  };

  for (const key in query) {
    const property = key as keyof QueryObject<any>;
    if (query[property] === undefined) delete query[property];
  }

  return [id, query];
}
