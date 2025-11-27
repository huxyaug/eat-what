function parts(n) { return String(n).split('/'); }
function childrenOf(categories, path) {
    return categories.filter((c) => {
        const p = parts(c.name);
        return path.every((seg, i) => p[i] === seg) && p.length === path.length + 1;
    });
}
function roots(categories) {
    return categories.filter((c) => parts(c.name).length === 1);
}
function pickByWeight(items) {
    const total = items.reduce((s, it) => s + Math.max(0, it.weight ?? 50), 0);
    let r = Math.random() * (total || 1);
    let acc = 0;
    for (const it of items) {
        acc += Math.max(0, it.weight ?? 50);
        if (acc >= r)
            return it;
    }
    return items[0];
}
export function pickDish(categories, dishes) {
    let attempts = 0;
    while (attempts < 20) {
        attempts++;
        const rootCats = roots(categories);
        if (rootCats.length === 0)
            break;
        let current = pickByWeight(rootCats);
        const trail = [parts(current.name)[0]];
        while (true) {
            const kids = childrenOf(categories, parts(current.name));
            if (kids.length === 0)
                break;
            current = pickByWeight(kids);
            trail.push(parts(current.name).slice(-1)[0]);
        }
        const leafId = current.id;
        const candidates = dishes.filter((d) => d.category_id === leafId);
        if (candidates.length === 0) {
            continue;
        }
        const chosen = pickByWeight(candidates);
        return { dish: chosen, trail };
    }
    const any = dishes[Math.floor(Math.random() * (dishes.length || 1))] || null;
    return { dish: any, trail: [] };
}
