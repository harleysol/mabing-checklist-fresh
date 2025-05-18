const devMode = process.env.NODE_ENV === 'development';

export const devLog = (...args: any[]) => {
    if (devMode) {
        console.log('🛠️', ...args);
    }
};