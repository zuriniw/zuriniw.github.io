// 新闻类定义
class NewsItem {
    constructor({
        time,
        event,
        isstar = false,
        link = null
    }) {
        this.time = time;
        this.event = event;
        this.isstar = isstar;
        this.link = link;
    }
}

// 时间字符串转换为日期对象
function parseTime(timeStr) {
    const [year, month] = timeStr.split('.');
    return new Date(parseInt(year), parseInt(month) - 1);
}

// 新闻数据
const newsItems = [
    new NewsItem({
        time: "2025.01",
        event: `Best Academic Contribution Award in The 9th Cross-strait Youth Maker Competition, 2024. See the <a href="projects/poi/poi.html" class="news-link">project↗</a>.`,
        isstar: true
    }),
    new NewsItem({
        time: "2024.12",
        event: `1st Prize in <a href="https://www.cs.cmu.edu/~112-f24/gallery.html" class="news-link">CMU 15-112↗</a> Term Project. See the <a href="projects/shapeshift/shapeshift.html" class="news-link">project↗</a>.`,
    }),
    new NewsItem({
        time: "2025.01",
        event: `Fall 2024 Computational Design Commendation for outstanding academic achievements in CMU`,
        isstar: true
    }),
    new NewsItem({
        time: "2024.09",
        event: `Started research assistant work at WHY. Research 'Studio' led by <a href="http://daraghbyrne.me/research/" class="news-link">Daragh Bryne↗</a> on Situating intelligences`,
        isstar: true
    })
];

// 生成新闻条目
function createNewsItems() {
    const container = document.querySelector('.news-container');
    
    // 按时间排序（从新到旧）
    const sortedItems = [...newsItems].sort((a, b) => {
        const dateA = parseTime(a.time);
        const dateB = parseTime(b.time);
        return dateB - dateA;
    });
    
    sortedItems.forEach(item => {
        const newsElement = document.createElement('div');
        newsElement.className = 'news-item';
        if (item.isstar) newsElement.classList.add('starred');
        
        const content = `
            <span class="news-time">${item.time}</span>
            <span class="news-event">${item.event}</span>
        `;
        
        newsElement.innerHTML = content;
        container.appendChild(newsElement);
    });
}

// 初始化页面
createNewsItems(); 