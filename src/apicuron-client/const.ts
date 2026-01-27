export const EndpointMap = {
  prod: 'https://apicuron.org/api/',
  dev: 'https://dev.apicuron.org/api/'
} as const;

export type Environment = keyof typeof EndpointMap;
