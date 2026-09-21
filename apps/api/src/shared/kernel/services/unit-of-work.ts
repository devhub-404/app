/**
 * Coordinates a short local transaction across public owner operations when a
 * workflow requires all local facts to commit together. It carries no state
 * between requests and exposes no database details to application code.
 */
export abstract class UnitOfWork {
  abstract run<T>(work: () => Promise<T>): Promise<T>;
}
