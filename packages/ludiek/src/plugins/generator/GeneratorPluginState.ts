export interface GeneratorPluginState {
  isActive: Record<string, boolean>;
}

export const createGeneratorState = (): GeneratorPluginState => {
  return {
    isActive: {},
  };
};
