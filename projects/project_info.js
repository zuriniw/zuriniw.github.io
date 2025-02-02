// 项目类定义
class Project {
    constructor({
        name,
        title,
        subtitle,
        labels,
        time,
        ispage,
        collaborator = null,
        tutor = null,
        ta = null,
        isteam = null,
        myContribution = null,
        tools = null,
        briefDescription = null,
        narrative = null,
        youtubeLink = null,
        paperLink = null,
        otherLink1 = null,
        otherLink2 = null,
        otherLink3 = null,
        prize = null,
        situate = null
    }) {
        this.name = name;
        this.title = title;
        this.subtitle = subtitle;
        this.labels = Array.isArray(labels) ? labels : [labels]; // 确保labels是数组
        this.time = time;
        this.ispage = ispage;
        this.isteam = isteam;
        this.gifImage = `projects/${name}/${name}.gif`;  // 使用 name 构建 gif 路径
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
        this.prize = prize;
        this.situate = situate;
    }

    // 获取项目 HTML 页面路径
    getHtmlPath() {
        return `projects/${this.name}/${this.name}.html`;
    }
    
    // 获取项目 GIF 路径
    getGifPath() {
        return `projects/${this.name}/${this.name}.gif`;
    }
}

// 项目实例

const projects = [
    new Project({
        name: "poi",
        title: "POI +-",
        subtitle: "Humanizing MR Spatial Behavior Computation",
        labels: ["XR", "Embodied", "Spatial"],
        time: "2024",
        ispage: true,
        isteam: true,
        tutor: "Chao Yan",
        ta: "Hanning Liu, Te Li",
        myContribution: "ideation, coding, experiment designing, documenting, drawing",
        tools: "Unity, Grasshopper, GHPython, ZED Depth Camera, Rhino",
        briefDescription: `"We shape our buildings, thereafter they shape us." --Winston Churchill, 1943`,
        youtubeLink: "https://www.youtube.com/watch?v=X6KAT7KzDUs",
        prize: "Best Academic Contribution Award",
        situate: { x: 45, y: -78 }
    }),
    new Project({
        name: "seeingsaw",
        title: "Seeing-Saw",
        subtitle: "Paired Device for Telepresence",
        labels: ["Embodied"],
        time: "2024",
        ispage: true,
        isteam: true,
        collaborator: "Leslie Liu",
        tutor: "Daragh Byrne",
        ta: "Zhenfang Chen",
        myContribution: "paired device background research, ideating, electrical wiring, coding",
        tools: "Particle Cloud, Photon2, Woodworking Tools",
        briefDescription: `Build peripheral and expressive awareness in lovable devices, to foster emotive communication through low-fidelity information`,
        youtubeLink: "https://www.youtube.com/watch?v=KNwp1Vy8hrg",
        situate: { x: -23, y: 89 }
    }),
    new Project({
        name: "shapeshift",
        title: "Shapeshift Playground",
        subtitle: "Node-based drawing tool development",
        labels: ["Digital"],
        time: "2024",
        ispage: true,
        isteam: false,
        tools: "Python",
        briefDescription: `Use Python in Grasshopper? Build your own Grasshopper using Python!`,
        youtubeLink: "https://www.youtube.com/watch?v=J2h9kxWUWH4",
        prize: "1st Prize in CMU 15-112 Term Project",
        situate: { x: -67, y: -34 }
    }),
    new Project({
        name: "villagerenewal",
        title: "Village Renewal Design",
        subtitle: "Village Renewal Design in Fujian, China",
        labels: ["Spatial"],
        time: "2024",
        ispage: true,
        isteam: false,
        tutor: "Hui Luo",
        myContribution: "Ethnographic surveys, Designing, Drawing",
        briefDescription: `From the perspective of post-lineage rural social relations, this study combines historical-geographic analysis of Huilong Village (investigating local history, geographic positioning, ethnic migration patterns, and spatial evolution) with ethnographic fieldwork documenting contemporary village life. To address critical issues of settlement hollowing, weakened social cohesion, and degradation of spatial fabric/cultural landscape, we propose a design intervention centered on Zhujiaxiang Lane, featuring:

1. Community Hall for Local Gentry & public space redesign
2. Architectural renovation of a vernacular rammed-earth dwelling
3. Holistic revitalization of surrounding cultural landscapes`,
        otherLink1: "https://www.behance.net/gallery/217218343/Village-Renewal-Design-in-Fujian-China",
        situate: { x: 92, y: 12 }
    }),
    new Project({
        name: "aurora",
        title: "Holographic Design2Construction",
        subtitle: "A case study of the full-scale building：AURORA",
        labels: ["XR"],
        time: "2021-2022",
        ispage: true,
        isteam: true,
        tutor: "Sining Wang, Dongchen Han",
        myContribution: "designing, constructing, writing",
        tools: "Fologram, Rhino, Grasshopper",
        briefDescription: `Instead of chasing zero-tolerance implementation and avoiding any potential deviations, MR-aided design practices aim to increase construction allowance by injecting computation into human operations.`,
        youtubeLink: "https://www.dropbox.com/scl/fi/ajuzkeolpeorpc0979q8t/HolographicConstruction.mp4?rlkey=7s31yppucptg6rdk8dkhffny0&e=1&dl=0",
        paperLink: "https://papers.cumincad.org/cgi-bin/works/paper/caadria2022_157",
        situate: { x: -88, y: 56 }
    }),
    new Project({
        name: "bodymusic",
        title: "Echos of Motion",
        subtitle: "Body as an interface for music creation",
        labels: ["Embodied"],
        time: "2024",
        ispage: true,
        isteam: true,
        collaborator: "Xiang Chen, Yiqi Cheng",
        myContribution: "Motion capture and music component implementation, Video editing",
        tools: "GHPython, Grasshopper, Kinect Camera",
        briefDescription: `This project explores the fusion of body movement with algorithmically generated sound and visuals, redefining how we interact with music creation.`,
        youtubeLink: "https://www.youtube.com/watch?v=FpLBtfClNgE",
        situate: { x: 34, y: -91 }
    }),
    new Project({
        name: "gazeknitting",
        title: "Gaze-Knitting",
        subtitle: "Gaze visualization in non-streamlined reading",
        labels: ["Embodied", "Digital"],
        time: "2024",
        ispage: true,
        isteam: false,
        tools: "Python, Flask",
        briefDescription: `The project introduces an experimental platform, Knitting Text, that uses gaze position prediction models to explore human-text interaction in a non-streamlined reading scenario. By predicting and visualizing gaze projections and knitting them into a dynamic representation of the reading journey, it emphasizes the importance of human agency and the messiness inherent in reading.`,
        youtubeLink: "https://www.youtube.com/watch?v=9TzxzTWuwcQ",
        situate: { x: -45, y: -67 }
    })
];

// 导出所有可用的标签
const availableLabels = [
    "Digital", "Spatial", "XR", "Embodied"
];

export { Project, projects, availableLabels };
