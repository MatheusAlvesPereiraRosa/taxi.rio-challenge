type LogLevel = 'info' | 'warn' | 'error';

export function jsonLog(
    level: LogLevel,
    message: string,
    fields: Record<string, unknown> = {},
): void {
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        service: 'corridas-api',
        message,
        ...fields,
    };

    const output = JSON.stringify(entry);

    if (level === 'error') {
        console.error(output);
    } else if (level === 'warn') {
        console.warn(output);
    } else {
        console.log(output);
    }
}