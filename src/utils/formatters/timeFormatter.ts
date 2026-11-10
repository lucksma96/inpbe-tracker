const formatTimeLeft = (minutes: number): string => {
    if (minutes <= 0) return 'Concluído';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m restantes` : `${m}m restantes`;
};

export { formatTimeLeft };
