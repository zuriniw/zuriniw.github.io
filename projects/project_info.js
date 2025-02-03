// 项目类定义
class Project {
    constructor({
        name,
        title,
        subtitle,
        labels,
        time,
        ispage,
        ismarkdown = false,
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
        githubLink = null,
        otherLink2 = null,
        otherLink3 = null,
        prize = null,
        weight = null,
        situate = null
    }) {
        this.name = name;
        this.title = title;
        this.subtitle = subtitle;
        this.labels = Array.isArray(labels) ? labels : [labels]; // 确保labels是数组
        this.time = time;
        this.ispage = ispage;
        this.ismarkdown = ismarkdown;
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
        this.githubLink = githubLink;
        this.otherLink2 = otherLink2;
        this.otherLink3 = otherLink3;
        this.prize = prize;
        this.weight = weight;
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
    
    // 获取项目 Markdown 文件路径
    getMdPath() {
        return `projects/${this.name}/${this.name}.md`;
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
        ismarkdown: true,   
        weight: 9,
        situate: { x: 45, y: -78 },
        otherLink2: null
    }),
    new Project({
        name: "seeingsaw",
        title: "SEEINGSAW",
        subtitle: "Peripheral and expressive awareness in lovable devices",
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
        youtubeLink: "https://www.youtube.com/watch?v=KNwp1Vy8hrg&feature=youtu.be",
        githubLink: "https://github.com/zuriniw/SEEINGSAW",
        otherLink2: null,
        weight: 8.9,
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
        otherLink2: null,
        prize: "1st Prize in CMU 15-112 Term Project",
        weight: 7.1,
        situate: { x: -67, y: -34 },
        ismarkdown: true
    }),
    new Project({
        name: "villagerenewal",
        title: "Village Renewal",
        subtitle: "Area Revitalization Design",
        labels: ["Spatial"],
        time: "2024",
        ispage: true,
        isteam: false,
        tutor: "Hui Luo",
        myContribution: "Ethnographic surveys, Designing, Drawing",
        tools: "Rhino, Adobe Suite, AutoCAD",
        otherLink2: null,
        briefDescription: "Revitalize the village through architectural design and cultural preservation. The project aims to preserve and enhance the unique cultural heritage of the village while improving the living conditions of its residents.",
        prize: "Outstanding Undergraduate Thesis; 1st place in Architecture School",
        weight: 7,
        situate: { x: 67, y: 23 },
        otherLink2: "https://www.behance.net/gallery/217218343/Village-Renewal-Design-in-Fujian-China",
    }),
    new Project({
        name: "aurora",
        title: "Holographic Design2Construction",
        subtitle: "A case study of the full-scale building：AURORA",
        labels: ["XR"],
        time: "2021",
        ispage: true,
        isteam: true,
        tutor: "Sining Wang, Dongchen Han",
        myContribution: "designing, constructing, writing",
        tools: "Fologram, Rhino, Grasshopper",
        briefDescription: `Instead of chasing zero-tolerance implementation and avoiding any potential deviations, MR-aided design practices aim to increase construction allowance by injecting computation into human operations.`,
        youtubeLink: "https://www.dropbox.com/scl/fi/ajuzkeolpeorpc0979q8t/HolographicConstruction.mp4?rlkey=7s31yppucptg6rdk8dkhffny0&e=1&dl=0",
        paperLink: "https://papers.cumincad.org/cgi-bin/works/paper/caadria2022_157",
        weight: 8.1,
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
        weight: 6,
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
        tools: "Python, Machine Learning",
        briefDescription: `Create an experimental platform, Knitting Text, that uses gaze position prediction models to explore human-text interaction in a non-streamlined reading scenario. By predicting and visualizing gaze projections and knitting them into a dynamic representation of the reading journey, it emphasizes the importance of human agency and the messiness inherent in reading.`,
        youtubeLink: "https://www.youtube.com/watch?v=9TzxzTWuwcQ",
        otherLink2: null,
        weight: 5,
        situate: { x: -45, y: -67 }
    }),
    new Project({
        name: "fadingroses",
        title: "Fading Roses",
        subtitle: "text-space-exploration narrative game",
        labels: ["Digital"],
        time: "2022",
        isteam: false,
        ispage: true,
        tools: "Procreate, Adobe Suite",
        briefDescription: "It is a story starting from a rose, a home, and a place.",
        otherLink2: "https://www.bilibili.com/video/BV1jT411g7Xf/",
        prize: "Award of Excellence & Award of New Talent on Bilibili 'Gamify Everything'",
        weight: 5,
        situate: { x: 23, y: -45 }
    }),
    new Project({
        name: "zijin",
        title: "Island Landscaping",
        subtitle: "Urban renewal design and modeling",
        labels: ["Spatial", "Digital"],
        time: "2022",
        myContribution: "Storystelling, modeling, rendering",
        isteam: false,
        ispage: true,
        tools: "Rhino, Grasshopper, D5 Render",
        otherLink2: 'https://ziruw.notion.site/the-Ark-the-construction-of-green-space-in-the-canal-community-based-on-ecological-restoration-and-2713ed7644ff46c2a4fef6125f90cacb',
        briefDescription: `The design site, Hengtang Station, an ancient canal post, preserves its original texture through a concise oblique grid composition and narrative techniques. Integrating ecological restoration, wetland construction, and canal culture, it balances ecology, city, and history, fostering a shared community and sustainable landscape that embodies harmony between people, nature, and the city.`,
        prize: "1st Prize, Top 10/613 in Architectural Design Competition 'Zijin Award'",
        weight: 4,
        situate: { x: -67, y: 89 }
    }),
    new Project({
        name: "taihustone",
        title: "Generative Digital TAIHU Stone",
        subtitle: "Computational design and interface design",
        labels: ["Digital"],
        time: "2022",
        myContribution: "Computational design, interface design",
        isteam: true,
        tools: "Grasshopper",
        weight: 4,
        situate: { x: 34, y: -91 }
    }),
    new Project({
        name: "mobius",
        title: "Mobius",
        subtitle: "Bar table furniture design",
        labels: ["Spatial"],
        time: "2021",
        collaborator: "fabrication team",
        myContribution: "designing, modeling",
        isteam: true,
        ispage: true,
        tools: "Rhino, Grasshopper",
        prize: "Patent",
        weight: 5,
        situate: { x: -88, y: 12 }
    }),
    new Project({
        name: "intdesign",
        title: "Interior Design",
        subtitle: "Modern residential apartment design",
        labels: ["Spatial"],
        time: "2023",
        isteam: false,
        ispage: true,
        weight: 1,
        situate: { x: 56, y: -34 }
    }),
    new Project({
        name: "keyboard",
        title: "Mini-Keyboard",
        subtitle: "PCB making, electronic assembling, and 3D printing",
        labels: ["Digital"],
        time: "2022",
        isteam: false,
        tools: "JLC EDA, Arduino, Rhino",
        weight: 1,
        situate: { x: -12, y: 78 }
    }),
    new Project({
        name: "mrintdesign",
        title: "Mixed Interior Design",
        subtitle: "MR-aided participatory design experiment",
        labels: ["XR", "Spatial"],
        time: "2021",
        myContribution: "documentation, experiment design",
        isteam: true,
        ispage: true,
        tools: "Rhino, Fologram, Unity",
        weight: 4,
        situate: { x: 45, y: -67 }
    }),
    new Project({
        name: "mrfarm",
        title: "BlendedFarm",
        subtitle: "MR interaction game",
        labels: ["XR"],
        time: "2021",
        collaborator: "Haoxuan Li, Yueying Chen",
        myContribution: "coding, game design, modeling",
        isteam: true,
        ispage: true,
        tools: "Unity, Arduino",
        briefDescription: "What if data can flows among the real world and MR scene?",
        weight: 4,
        situate: { x: -23, y: 56 }
    })
];

// 导出所有可用的标签
const availableLabels = [
    "Digital", "Spatial", "XR", "Embodied"
];

export { Project, projects, availableLabels };
