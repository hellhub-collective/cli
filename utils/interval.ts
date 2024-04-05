import chalk from "chalk";

export default async function interval(
  handler: () => Promise<void>,
  seconds: number,
) {
  if (seconds < 60) {
    console.error("Interval must be at least 60 seconds");
    process.exit(1);
  }

  let i = 0;
  while (true) {
    if (i === 0) {
      console.log(chalk.bold("\nWatcher Mode"));
      console.log(chalk.gray("Waiting for the first update from source data"));
    }

    i++;
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
    await handler();
    console.log(chalk.bold("\nWatcher Mode"));
    console.log(chalk.gray(`Update from source data ${i} times`));
  }
}
