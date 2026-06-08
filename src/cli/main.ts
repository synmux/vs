/**
 * Commander program. Lookup commands (evolve/weapon/character/search/build) print
 * to stdout; section commands and the bare `vs` launch the TUI when attached to a
 * TTY and fall back to a stdout listing when piped. Shared options are added to
 * every command and read with optsWithGlobals() so `--json` etc. work in any
 * position.
 */
import { Command } from "commander";
import type { Repository } from "../data/repository.ts";
import { runTui } from "../tui/app.ts";
import { APP_VERSION } from "../version.ts";
import { buildCommand } from "./commands/build.ts";
import { characterCommand } from "./commands/character.ts";
import { evolveCommand } from "./commands/evolve.ts";
import { refreshCommand } from "./commands/refresh.ts";
import { searchCommand } from "./commands/search.ts";
import { weaponCommand } from "./commands/weapon.ts";
import { withRepo } from "./context.ts";
import { CliError } from "./errors.ts";
import { sectionList } from "./output.ts";
import type { OutputOptions } from "./types.ts";

const SECTIONS = ["evolutions", "weapons", "passives", "characters", "stages", "arcanas", "bestiary"];

interface GlobalOptions {
  json?: boolean;
  color?: boolean;
  refresh?: boolean;
}

function print(text: string): void {
  console.log(text);
}

function shared(command: Command): Command {
  return command
    .option("--json", "machine-readable JSON output")
    .option("--no-color", "disable coloured output")
    .option("--refresh", "refresh data from the wiki before running");
}

function outputOptions(options: GlobalOptions): OutputOptions {
  return { json: options.json, color: options.color };
}

/** Launch the TUI on a section, or print a plain listing when output is piped. */
async function launchOrList(repo: Repository, section: string, options: GlobalOptions): Promise<void> {
  if (process.stdout.isTTY) await runTui(repo, section);
  else print(sectionList(repo, section, outputOptions(options)));
}

export async function main(argv: string[]): Promise<void> {
  const program = new Command();
  shared(program)
    .name("vs")
    .description("Vampire Survivors companion — browse weapon evolutions and game data")
    .version(APP_VERSION);

  // Bare `vs`: launch the TUI home (or, piped, the evolution cheat sheet).
  program.action(async (_options, command: Command) => {
    const options = command.optsWithGlobals() as GlobalOptions;
    await withRepo(options, (repo) => launchOrList(repo, "home", options));
  });

  for (const section of SECTIONS) {
    shared(program.command(section))
      .description(`Browse ${section}`)
      .action(async (_options, command: Command) => {
        const options = command.optsWithGlobals() as GlobalOptions;
        await withRepo(options, (repo) => launchOrList(repo, section, options));
      });
  }

  shared(program.command("evolve <name>"))
    .description("How a weapon evolves — what it is made from and what it evolves into")
    .action(async (name: string, _options, command: Command) => {
      const options = command.optsWithGlobals() as GlobalOptions;
      await withRepo(options, (repo) => print(evolveCommand(repo, name, outputOptions(options))));
    });

  shared(program.command("weapon <name>"))
    .description("Weapon details and evolution relationships")
    .action(async (name: string, _options, command: Command) => {
      const options = command.optsWithGlobals() as GlobalOptions;
      await withRepo(options, (repo) => print(weaponCommand(repo, name, outputOptions(options))));
    });

  shared(program.command("character <name>"))
    .description("Character details and base stats")
    .action(async (name: string, _options, command: Command) => {
      const options = command.optsWithGlobals() as GlobalOptions;
      await withRepo(options, (repo) => print(characterCommand(repo, name, outputOptions(options))));
    });

  shared(program.command("search <query>"))
    .description("Fuzzy search across every entity")
    .action(async (query: string, _options, command: Command) => {
      const options = command.optsWithGlobals() as GlobalOptions;
      await withRepo(options, (repo) => print(searchCommand(repo, query, outputOptions(options))));
    });

  shared(program.command("build"))
    .description("Evolutions achievable from the items you own")
    .requiredOption("--have <items>", "comma-separated weapons and passives you own")
    .action(async (commandOptions: { have: string }, command: Command) => {
      const options = command.optsWithGlobals() as GlobalOptions;
      await withRepo(options, (repo) => print(buildCommand(repo, commandOptions.have, outputOptions(options))));
    });

  program
    .command("refresh")
    .description("Re-fetch all data from the wiki into the local cache")
    .action(async () => {
      print(await refreshCommand());
    });

  try {
    await program.parseAsync(argv);
  } catch (error) {
    if (error instanceof CliError) {
      console.error(error.message);
      process.exitCode = 1;
      return;
    }
    throw error;
  }
}
