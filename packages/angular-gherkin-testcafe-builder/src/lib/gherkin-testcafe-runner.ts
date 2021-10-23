export interface GherkinTestcafeRunner extends Runner {
  tags(tags: string[]): GherkinTestcafeRunner;
}
