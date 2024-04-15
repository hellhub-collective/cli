#!/usr/bin/env node

import { Command } from "commander";
import { bin, description, version, repository } from "package.json";

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
const helpText = `\nCheck out the our free and community driven API at ${repository.url.replace("/cli.git", "/api")}`;

program
  .name(programName)
  .version(programVersion)
  .description(programDescription)
  .addHelpText("after", helpText);

[planets, sectors, stratagems, reports, events, major, statistics].forEach(
  com => com(program),
);

program.parse(process.argv);
