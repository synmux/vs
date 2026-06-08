/** A user-facing CLI error: main prints its message to stderr and exits non-zero. */
export class CliError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CliError";
  }
}
