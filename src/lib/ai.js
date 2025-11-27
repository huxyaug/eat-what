export async function generateDishCaption(name, calories) {
    const { endpoint, model, key } = getAIEnv();
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: '你是美食推荐助手，用简短中文文案给出友好建议。' },
                { role: 'user', content: `菜名：${name}；热量：${calories}kcal。请生成一句温柔的推荐文案，风格像小红书。` },
            ],
        }),
    });
    if (!res.ok)
        throw new Error('AI 请求失败');
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || '';
    if (!text)
        throw new Error('AI 响应为空');
    return String(text).trim();
}
export async function suggestDishInfo(name) {
    const { endpoint, model, key } = getAIEnv();
    if (!name)
        throw new Error('缺少菜名');
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: '返回 JSON，不要解释。字段：calories(整数)、keywords(英文逗号分隔关键词)。' },
                { role: 'user', content: `菜名：${name}。根据常见做法估算热量，并给出用于图片检索的英文关键词。严格只返回 JSON。` },
            ],
        }),
    });
    if (!res.ok)
        throw new Error('AI 请求失败');
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(text);
    const clean = String(parsed.keywords)
        .toLowerCase()
        .replace(/[^a-z,\s]/g, ' ')
        .split(/[\s,]+/)
        .filter(Boolean)
        .slice(0, 5)
        .join(',');
    return { calories: Math.max(0, Math.round(parsed.calories)), keywords: clean };
}
export function keywordsToLoremFlickrUrl(keywords, w = 400, h = 300) {
    const tags = String(keywords).toLowerCase().replace(/[^a-z,\s]/g, ' ').split(/[\s,]+/).filter(Boolean).join(',');
    return `https://loremflickr.com/${w}/${h}/${tags || 'food,dish'}?random=${Math.random()}`;
}
export function dishNameToTags(name) {
    const n = String(name);
    const pairs = [
        [/火锅|麻辣烫|冒菜|辣锅/, 'hotpot,spicy,chinese'],
        [/寿司|刺身|日料|饭团/, 'sushi,japanese,seafood'],
        [/披萨|pizza/, 'pizza,italian,cheese'],
        [/牛肉面|牛肉|面条|拉面|刀削面/, 'beef,noodles,ramen'],
        [/米饭|拌饭|盖饭|炒饭/, 'rice,bowl,asian'],
        [/沙拉|蔬菜|清炒/, 'salad,healthy,vegetable'],
        [/汉堡|薯条|炸鸡|麦当劳|肯德基/, 'burger,fastfood,fried chicken'],
        [/烤肉|烧烤|羊肉串/, 'barbecue,grill,meat'],
        [/饺子|煎饺|锅贴|包子|点心/, 'dumplings,dim sum'],
        [/汤|粉|米线|螺蛳粉/, 'noodles,soup,asian'],
        [/牛排|西冷|菲力|沙朗/, 'steak,beef,western'],
        [/意面|意大利面|面酱|番茄面/, 'pasta,italian,tomato'],
        [/烤鱼|水煮鱼|酸菜鱼/, 'fish,grilled,spicy'],
        [/麻婆豆腐|豆腐/, 'tofu,spicy,sichuan'],
        [/生煎|小笼包|汤包/, 'dumplings,steamed,chinese'],
        [/肠粉|云吞|叉烧|粥|早茶/, 'cantonese,dim sum'],
        [/小龙虾|海鲜|虾|蟹|贝类/, 'seafood,shrimp,crab'],
        [/牛肉饭|鸡肉饭|猪肉饭/, 'rice,meat,bowl'],
        [/炒年糕|年糕|糖醋|红烧/, 'chinese,stir fry,sweet'],
        [/咖啡|奶茶|饮料|果汁/, 'drink,beverage'],
        [/蛋糕|甜点|冰淇淋|布丁/, 'dessert,cake,ice cream'],
    ];
    for (const [re, tag] of pairs)
        if (re.test(n))
            return tag;
    return 'food,dish';
}
export function imageUrlForDishName(name, w = 400, h = 300) {
    const tags = dishNameToTags(name);
    return `https://loremflickr.com/${w}/${h}/${tags}?random=${Math.random()}`;
}
export async function chatRecommend(messages) {
    const { endpoint, model, key } = getAIEnv();
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model, messages: [{ role: 'system', content: '你是美食决策助手，围绕“今天吃什么”进行中文对话，建议具体菜品与分类，并兼顾健康与均衡。回答简短。' }, ...messages] }),
    });
    if (!res.ok)
        throw new Error('AI 请求失败');
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || '';
    if (!text)
        throw new Error('AI 响应为空');
    return String(text).trim();
}
export async function generateShoppingList(context) {
    const { endpoint, model, key } = getAIEnv();
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: '根据用户的饮食建议生成购物清单，返回 JSON 数组，每项包含 item(中文食材名)、qty(数量或“适量”)。严格只返回 JSON。' },
                { role: 'user', content: context },
            ],
        }),
    });
    if (!res.ok)
        throw new Error('AI 请求失败');
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || '';
    const arr = JSON.parse(text);
    return arr.map((x) => ({ item: String(x.item || x.name || '食材'), qty: String(x.qty || x.quantity || '适量') })).slice(0, 20);
}
function getAIEnv() {
    const endpoint = import.meta.env.VITE_AI_ENDPOINT;
    const model = import.meta.env.VITE_AI_MODEL;
    const keysRawEnv = import.meta.env.VITE_AI_KEYS || '';
    const singleKeyEnv = import.meta.env.VITE_AI_KEY || '';
    const key = [keysRawEnv, singleKeyEnv]
        .filter(Boolean)
        .join(',')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)[0];
    if (!endpoint || !model || !key)
        throw new Error('AI 环境变量未配置完整');
    return { endpoint, model, key };
}
