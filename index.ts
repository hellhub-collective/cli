import { Command } from "commander";
import { bin, description, version } from "package.json";

import major from "commands/major";
import events from "commands/events";
import planets from "commands/planets";
import sectors from "commands/sectors";
import reports from "commands/reports";
import stratagems from "commands/stratagems";
import statistics from "commands/statistics";

const program = new Command();

const programVersion = version;
const programDescription = description;
const programName = Object.keys(bin)[0];

program
  .name(programName)
  .version(programVersion)
  .description(programDescription);

[planets, sectors, stratagems, reports, events, major, statistics].forEach(
  com => com(program),
);

program.parse(Bun.argv);
