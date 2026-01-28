export class UnknownGeneratorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnknownGeneratorError';
  }
}
