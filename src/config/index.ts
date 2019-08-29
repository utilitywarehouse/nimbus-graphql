export * from './config.service';
export * from './config.provider';

export const StringBoolean = (value: string): boolean => {
  return value.toLowerCase().trim() === 'true';
};
