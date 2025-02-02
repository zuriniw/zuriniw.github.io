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
        title: "Holographic Design-to-Construction",
        subtitle: "A case study of the full-scale building：AURORA",
        labels: "Blended",
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
        labels: ["Embodied", "Speculative"],
        time: "2024",
        gifImage: "projects/gazeknitting/gazeknitting.gif",
        youtubeLink: "https://www.youtube.com/watch?v=9TzxzTWuwcQ&t=6s"
    })
];

// 导出所有可用的标签
const availableLabels = ["Digital", "Spatial", "Blended", "Embodied", "Speculative"];

export { Project, projects, availableLabels };
