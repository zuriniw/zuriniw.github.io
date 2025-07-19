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
        time: "2025.03",
        event: `<b>the research project "Embodied Generative Taskscape: Re-Connect Cultural-Ecological Perception in 5-Animal Play," has been accepted to the 4S 2025 Conference: Reverberations, which will be held September 3-6, 2025 in Seattle, WA. </a>`,
    }),
    new NewsItem({
        time: "2025.01",
        event: `<b>Best Academic Contribution Award</b> in The 9th Cross-strait Youth Maker Competition, 2024. See the <a href="projects/poi/poi.html" class="news-link">project</a>`,
    }),
    new NewsItem({
        time: "2025.01",
        event: `Started as a <b>Guest Reviewer</b> of CMU 25 Spring course <a href="https://www.architecture.cmu.edu/courses/spring-2025/fundamentals-computational-design" class="news-link">Fundamentals of Computational Design</a>, instructor: <a href="https://vaanoel.com/" class="news-link"> Vernelle A. A. Noel</a>`,
    }),
    new NewsItem({
        time: "2024.12",
        event: `1st Prize in <a href="https://www.cs.cmu.edu/~112-f24/gallery.html" class="news-link">CMU 15-112</a> Term Project. See the <a href="projects/shapeshift/shapeshift.html" class="news-link">project</a>`,
    }),
    new NewsItem({
        time: "2025.01",
        event: `Fall 2024 <b>Computational Design Commendation</b> for outstanding academic achievements in CMU`,
        isstar: true
    }),
    new NewsItem({
        time: "2024.09",
        event: `Started <b>Research Assistant</b> work at WHY. Research 'Studio' led by <a href="http://daraghbyrne.me/research/" class="news-link">Daragh Bryne</a> on Situating intelligences`,
        isstar: true
    }),
    new NewsItem({
        time: "2024.08",
        event: `<b>Merit Scholarship</b> of $ 32,000 in CMU`,
        isstar: true
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