export abstract class ViewReadPort {
  abstract countMany(resourceIds: string[]): Promise<Record<string, number>>;
}
