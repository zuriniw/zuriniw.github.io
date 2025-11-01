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

// string time to date
function parseTime(timeStr) {
    const [year, month] = timeStr.split('.');
    return new Date(parseInt(year), parseInt(month) - 1);
}


const newsItems = [
    new NewsItem({
        time: "2025.09",
        event: `★ We submitted <b>2 </b>papers to <b>CHI 2026</b>! Fingers crossed.`,

    }),
    new NewsItem({
        time: "2025.11",
        event: `I won the Fasted Manipulation Prize in CMU <a href="https://www.hcii.cmu.edu/course/special-topics-interactive-extended-reality-not-offered-spring-2026" class="news-link">05-899 Interactive Extended Reality</a> taught by Prof. David Lindlbauer` 
    }),
    new NewsItem({
        time: "2025.08",
        event: `I launched 2 new mini lateral-puzzle games this summer. For fans of horror and interactive storytelling, check them out: <a href="https://www.bilibili.com/video/BV1iyuMzoEuB/" class="news-link">here</a> and <a href="https://www.bilibili.com/video/BV1FpupzuEnm/?vd_source=0f99d8862012dc3500590ba5b2bad6e7" class="news-link">here</a>. (BiliBili account required)` 
    }),
    new NewsItem({
        time: "2025.06",
        event: `Spring 2025 <b>Computational Design Commendation</b> for outstanding academic achievements at CMU`,
    }),
    new NewsItem({
        time: "2025.03",
        event: `An abstract has been accepted to 4S 2025 Conference Panel, September 3-6, 2025 in Seattle, WA.`,
    }),
    new NewsItem({
        time: "2025.01",
        event: `<b>Best Academic Contribution Award</b> at the 9th Cross-strait Youth Maker Competition, 2024. See the <a href="projects/poi/poi.html" class="news-link">project</a>`,
    }),
    new NewsItem({
        time: "2024.12",
        event: `I won First Prize in CMU <a href="https://www.cs.cmu.edu/~112-f24/gallery.html" class="news-link">15-112 Fundamentals of Programming and Computer Science</a> Term Project (selected from 400+ projects, David Kosbie and peers' choice)! See the <a href="projects/shapeshift/shapeshift.html" class="news-link">project</a>`,
    }),
    new NewsItem({
        time: "2025.01",
        event: `Fall 2024 <b>Computational Design Commendation</b> for outstanding academic achievements at CMU`,
    }),
    new NewsItem({
        time: "2024.08",
        event: `<b>Merit Scholarship</b> of $ 32,000 at CMU`,
    })
];


function createNewsItems() {
    const container = document.querySelector('.news-container');
    // sort by time (from new to old)
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

// initialize the page
createNewsItems(); 