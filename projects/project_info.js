// 项目类定义
class Project {
    constructor({
        title,
        subtitle,
        labels,
        time,
        gifImage,
        collaborator = null,
        tutor = null,
        ta = null,
        myContribution = null,
        tools = null,
        briefDescription = null,
        narrative = null,
        youtubeLink = null,
        paperLink = null,
        otherLink1 = null,
        otherLink2 = null,
        otherLink3 = null
    }) {
        this.title = title;
        this.subtitle = subtitle;
        this.labels = Array.isArray(labels) ? labels : [labels]; // 确保labels是数组
        this.time = time;
        this.gifImage = gifImage;
        this.collaborator = collaborator;
        this.tutor = tutor;
        this.ta = ta;
        this.myContribution = myContribution;
        this.tools = tools;
        this.briefDescription = briefDescription;
        this.narrative = narrative;
        this.youtubeLink = youtubeLink;
        this.paperLink = paperLink;
        this.otherLink1 = otherLink1;
        this.otherLink2 = otherLink2;
        this.otherLink3 = otherLink3;
    }
}

// 项目实例
const projects = [
    new Project({
        title: "POI +-",
        subtitle: "Humanizing Mixed Reality—Spatial Behavior Computation",
        labels: ["XR", "Embodied", "Spatial"],
        time: "2024",
        gifImage: "projects/poi/poi.gif",
        youtubeLink: "https://www.youtube.com/watch?v=X6KAT7KzDUs"
    }),
    new Project({
        title: "Seeing-Saw",
        subtitle: "Paired Device for Telepresence",
        labels: "Embodied",
        time: "2021-2022",
        gifImage: "projects/seeingsaw/seeingsaw.gif",
        myContribution: "paired device background research | ideating | electrical wiring |coding​",
        youtubeLink: "https://www.youtube.com/watch?v=KNwp1Vy8hrg&t=12s"
    }),
    new Project({
        title: "Shapeshift Playground",
        subtitle: "Node-based drawing tool development",
        labels: "Digital",
        time: "2024",
        gifImage: "projects/shapeshift/shapeshift.gif",
        youtubeLink: "https://www.youtube.com/watch?v=J2h9kxWUWH4"
    }),
    new Project({
        title: "Village Renewal Design",
        subtitle: "Village Renewal Design in Fujian, China",  // 添加副标题
        labels: "Spatial",
        time: "2024",
        gifImage: "projects/villagerenewal/villagerenewal.gif",
        otherLink1: "https://www.behance.net/gallery/217218343/Village-Renewal-Design-in-Fujian-China"
    }),
    new Project({
        title: "Holographic Design2Construction",
        subtitle: "A case study of the full-scale building：AURORA",
        labels: "XR",
        time: "2021-2022",
        gifImage: "projects/aurora/aurora.gif",
        myContribution: "designing | constructing | writing",
        youtubeLink: "https://www.dropbox.com/scl/fi/ajuzkeolpeorpc0979q8t/HolographicConstruction.mp4?rlkey=7s31yppucptg6rdk8dkhffny0&e=1&dl=0",
        paperLink: "https://papers.cumincad.org/cgi-bin/works/paper/caadria2022_157"
    }),
    new Project({
        title: "Echos of Motion",
        subtitle: "Body as an interface for music creation",
        labels: "Embodied",
        time: "2024",
        gifImage: "projects/bodymusic/bodymusic.gif",
        youtubeLink: "https://www.youtube.com/watch?v=FpLBtfClNgE"
    }),
    new Project({
        title: "Gaze-Knitting",
        subtitle: "Gaze data visualization in a non-streamlined reading scenario",
        labels: ["Embodied", 'Digital'],
        time: "2024",
        gifImage: "projects/gazeknitting/gazeknitting.gif",
        youtubeLink: "https://www.youtube.com/watch?v=9TzxzTWuwcQ&t=6s"
    })
];

// 导出所有可用的标签
const availableLabels = [
    "Digital", "Spatial", "XR", "Embodied"
];

export { Project, projects, availableLabels };
