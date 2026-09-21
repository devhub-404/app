declare module 'diff-match-patch' {
  export type DiffPatch = object;

  export default class DiffMatchPatch {
    patch_fromText(text: string): DiffPatch[];
    patch_apply(patches: DiffPatch[], text: string): [string, boolean[]];
    patch_make(text1: string, text2: string): DiffPatch[];
    patch_toText(patches: DiffPatch[]): string;
  }
}
