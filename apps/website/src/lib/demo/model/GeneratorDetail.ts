export interface GeneratorDetail {
  id: string;
  name: string;
  description: string;
  output: number;
  input?: number;
  outputCurrency?: string;
  inputCurrency?: string;
  cost?: number;
  costCurrency?: string;
}
