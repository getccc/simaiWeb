export function getLatestByParameterSetId(records: any) {
    // 分组阶段：使用 Map 按 parameter_set_id 对记录进行分组
    const grouped = records.reduce((acc: any, record: any) => {
        const key = record.parameter_set_id;
        if (!acc.has(key)) {
            acc.set(key, []);
        }
        acc.get(key).push(record);
        return acc;
    }, new Map());

    // 选取阶段：对每个组，找出 created_at 最晚的记录
    const result = [];
    for (const [key, group] of grouped.entries()) {
        const latest = group.reduce((prev: any, current: any) => {
            const prevDate = new Date(prev.created_at);
            const currDate = new Date(current.created_at);
            return currDate > prevDate ? current : prev;
        });
        result.push(latest);
    }

    return result;
}