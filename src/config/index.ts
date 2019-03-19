export * from './config.service';
export * from './config.provider';

export const StringBoolean = (value) => {
    return value.toLowerCase().trim() === 'true';
};
