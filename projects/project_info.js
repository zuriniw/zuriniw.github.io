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
        situate = null,
        isflipped = false,
        category = null
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
        this.isflipped = isflipped;
        this.category = category;
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


const projects = [
    new Project({
        name: "poi",
        title: "Adaptive Exhibition",
        subtitle: "An adaptive layout system via computing human factors in the environment",
        labels: ["XR", "HCD", "Physical"],
        time: "2024",
        ispage: true,
        isteam: true,
        tutor: "Chao Yan",
        myContribution: "coding, ideation, experiment designing, documenting, figure making",
        tools: "Unity, Grasshopper, GHPython, ZED Depth Camera, Rhino",
        briefDescription: `"We shape our buildings, thereafter they shape us." --Winston Churchill, 1943`,
        youtubeLink: "https://www.youtube.com/embed/X6KAT7KzDUs?si=jhOz6vGQ7ZCa5KV1",
        prize: "Best Academic Contribution Award",
        ismarkdown: true,   
        weight: 9,
        situate: { x: -38, y: 37 },
        otherLink2: null,
        category: "blended environment"
    }),
    new Project({
        name: "seeingsaw",
        title: "SEEINGSAW",
        subtitle: "Lovable paired devices for telepresence",
        labels: ["HCD","Physical"],
        time: "2024",
        ispage: true,
        isteam: true,
        ismarkdown: true,
        collaborator: "Leslie Liu",
        tutor: "Daragh Byrne",
        ta: "Zhenfang Chen",
        myContribution: "researching, ideating, electrical wiring, coding",
        tools: "Particle Cloud, Photon2, Woodworking Tools",
        briefDescription: `Build peripheral and expressive awareness in lovable devices, to foster emotive communication through low-fidelity information`,
        youtubeLink: "https://www.youtube.com/embed/KNwp1Vy8hrg?si=GnxYe-9l1eCnve2S&amp;controls=0",
        githubLink: "https://github.com/zuriniw/SEEINGSAW",
        otherLink2: "http://ideate.xsead.cmu.edu/gallery/projects/remaking-shaker-1996",
        weight: 8.9,
        isflipped: false,
        situate: { x: 60, y: -5 },
        category: "devices"
    }),
    new Project({
        name: "ixr",
        title: "Optimized VR Interaction",
        subtitle: "A series of optimized interaction techniques for VR expereince",
        labels: ["Digital", "XR", "HCD"],
        time: "2025",
        ispage: true,
        isteam: false,
        tools: "Unity, C#, Quest 2",
        otherLink2: null,
        weight: 6.1,
        situate: { x: 20, y: 60 },
        ismarkdown: true,
        isflipped: false,
        tutor: "David Lindlbauer",
        category: "foundamental interaction techniques"
    }),
    new Project({
        name: "shapeshift",
        title: "Shapeshift Playground",
        subtitle: "A node-based drawing tool inspired by Grasshopper",
        labels: ["Digital"],
        time: "2024",
        ispage: true,
        isteam: false,
        tools: "Python",
        briefDescription: `Use Python in Grasshopper? Build your own Grasshopper using Python!`,
        youtubeLink: "https://www.youtube.com/embed/J2h9kxWUWH4?si=5DiMFTrKMxIMo9iq&amp;controls=0",
        otherLink2: null,
        prize: "1st Prize in CMU 15-112 Term Project",
        weight: 6.1,
        situate: { x: 70, y: -56 },
        ismarkdown: true,
        isflipped: false,
        category: "computational design tools"
    }),
    new Project({
        name: "villagerenewal",
        title: "Village Renewal",
        subtitle: "Area Revitalization Design",
        labels: ["Physical"],
        time: "2024",
        ispage: true,
        isteam: false,
        ismarkdown: true,
        tutor: "Hui Luo",
        myContribution: "Ethnographic Research, Area History Research,Urban Design, Architecture Design",
        tools: "Rhino, Adobe Suite, AutoCAD",
        otherLink2: null,
        briefDescription: "Revitalize the village through architectural design and cultural preservation. The project aims to preserve and enhance the unique cultural heritage of the village while improving the living conditions of its residents.",
        prize: "Outstanding Undergraduate Thesis; 1st place in Architecture School",
        weight: 5,
        situate: { x: -50, y: 70 },
        otherLink2: "https://www.behance.net/gallery/217218343/Village-Renewal-Design-in-Fujian-China",
        category: "architectures and installations"
    }),
    new Project({
        name: "aurora",
        title: "XR-aided Construction",
        subtitle: "A case study of the holographic construction of the full-scale building：AURORA",
        labels: ["XR", "Physical"],
        time: "2021",
        ispage: true,
        isteam: true,
        tutor: "Sining Wang, Dongchen Han",
        myContribution: "designing, constructing, writing",
        tools: "Fologram, Rhino, Grasshopper",
        briefDescription: `Instead of chasing zero-tolerance implementation and avoiding any potential deviations, MR-aided design practices aim to increase construction allowance by injecting computation into human operations.`,
        // youtubeLink: "https://www.dropbox.com/scl/fi/ajuzkeolpeorpc0979q8t/HolographicConstruction.mp4?rlkey=7s31yppucptg6rdk8dkhffny0&e=1&dl=0",
        paperLink: "https://papers.cumincad.org/cgi-bin/works/paper/caadria2022_157",
        otherLink2: "https://humachine.cn/?post_type=products&page_id=16963",
        weight: 8.1,
        ismarkdown: true,
        situate: { x: 70, y: -85 },
        category: "blended environment"
    }),
    // new Project({
    //     name: "bodymusic",
    //     title: "Mo-sic",
    //     subtitle: "Body as an interface for music creation",
    //     labels: ["Embodied"],
    //     time: "2024",
    //     ispage: true,
    //     ismarkdown: true,
    //     isteam: true,
    //     collaborator: "Xiang Chen, Yiqi Cheng",
    //     myContribution: "Motion capture and music component implementation, Video editing",
    //     tools: "GHPython, Grasshopper, Kinect Camera",
    //     briefDescription: `This project explores the fusion of body movement with algorithmically generated sound and visuals, redefining how we interact with music creation.`,
    //     youtubeLink: "https://www.youtube.com/embed/FpLBtfClNgE?si=b3tL60XDOnNNpoqe&amp;controls=0",
    //     weight: 6,
    //     situate: { x: -10, y: 40 }
    // }),
    // new Project({
    //     name: "gazeknitting",
    //     title: "Gaze Knitting",
    //     subtitle: "Gaze visualization in non-streamlined reading",
    //     labels: ["Embodied", "Digital"],
    //     time: "2024",
    //     ispage: true,
    //     isteam: false,
    //     ismarkdown: true,
    //     tools: "Python, Machine Learning",
    //     briefDescription: `Create an experimental platform, Knitting Text, that uses gaze position prediction models to explore human-text interaction in a non-streamlined reading scenario. By predicting and visualizing gaze projections and knitting them into a dynamic representation of the reading journey, it emphasizes the importance of human agency and the messiness inherent in reading.`,
    //     youtubeLink: "https://www.youtube.com/embed/9TzxzTWuwcQ?si=-cG2DBPIb1pkqho0&amp;controls=0",
    //     otherLink2: null,
    //     weight: 3,
    //     situate: { x: 35, y: 50 }
    // }),
    // new Project({
    //     name: "fadingroses",
    //     title: "Fading Roses",
    //     subtitle: "A text-space-exploration game",
    //     labels: ["Digital"],
    //     time: "2022",
    //     isteam: false,
    //     ispage: true,
    //     ismarkdown: true,
    //     tools: "Procreate, Adobe Suite",
    //     briefDescription: "It is a story starting from a rose, a home, and a place.",
    //     otherLink2: "https://www.bilibili.com/video/BV1jT411g7Xf/",
    //     prize: "[Award of Excellence] & [Award of New Talent] on Bilibili 'Gamify Everything' Competition",
    //     weight: 0.1,
    //     situate: { x: -80, y: -70 }
    // }),
    // new Project({
    //     name: "zijin",
    //     title: "IsLand -scaping",
    //     subtitle: "Urban renewal design and modeling",
    //     labels: ["Physical", "Digital"],
    //     time: "2022",
    //     myContribution: "Storystelling, modeling, rendering",
    //     isteam: false,
    //     // ispage: true,
    //     tools: "Rhino, Grasshopper, D5 Render",
    //     otherLink2: 'https://ziruw.notion.site/the-Ark-the-construction-of-green-space-in-the-canal-community-based-on-ecological-restoration-and-2713ed7644ff46c2a4fef6125f90cacb',
    //     briefDescription: `The design site, Hengtang Station, an ancient canal post, preserves its original texture through a concise oblique grid composition and narrative techniques. Integrating ecological restoration, wetland construction, and canal culture, it balances ecology, city, and history, fostering a shared community and sustainable landscape that embodies harmony between people, nature, and the city.`,
    //     prize: "1st Prize, Top 10/613 in Architectural & Landscape Design Competition 'Zijin Award'",
    //     weight: 4,
    //     isflipped: false,
    //     situate: { x: -60, y: -60 }
    // }),
    new Project({
        name: "taihustone",
        title: "Generative TAIHUSHI",
        subtitle: "Computational design and interface design",
        labels: ["Digital"],
        time: "2022",
        myContribution: "A computational design tools for generative Taihu stone",
        isteam: false,
        tools: "Grasshopper",
        weight: 4,
        situate: { x: 50, y: -51 },
        isflipped: true,
        ispage: true,
        ismarkdown: true,
        category: "computational design tools"
    }),
    new Project({
        name: "mobius",
        title: "Mobius",
        subtitle: "A bar table furniture design and fabrication",
        labels: ["Physical"],
        time: "2021",
        collaborator: "Humachine Lab",
        myContribution: "designing, modeling",
        isteam: true,
        ispage: true,
        ismarkdown: true,
        tools: "Rhino, Grasshopper",
        prize: "Patent",
        weight: 5,
        otherLink2:"https://humachine.cn/?post_type=products&page_id=17054",
        situate: { x: -30, y: -90 },
        category: "architectures and installations"
    }),
    // new Project({
    //     name: "intdesign",
    //     title: "Interior Design",
    //     subtitle: "Modern residential apartment design",
    //     labels: ["Physical"],
    //     time: "2023",
    //     isteam: false,
    //     // ispage: true,
    //     weight: 1,
    //     isflipped: true,
    //     situate: { x: -6, y: -64 }
    // }),
    new Project({
        name: "keyboard",
        title: "Mini Keyboard",
        subtitle: "A customized keyboard for my personal use",
        myContribution: "PCB making, electronic assembling, and 3D printing",
        briefDescription: "Wanna have a keyboard that is super handy? DIY it!",
        labels: ["Physical"],
        time: "2022",
        isteam: false,
        tools: "EasyEDA, Rhino, Soldering Tools",
        weight: 4.3,
        situate: { x: 70, y: -70 },
        isflipped: false,
        ispage: true,
        ismarkdown: true,
        category: "devices"
    }),
    // new Project({
    //     name: "mrintdesign",
    //     title: "Mixed Interior",
    //     subtitle: "MR-aided participatory design experiment",
    //     labels: ["XR", "Physical"],
    //     time: "2021",
    //     myContribution: "documentation, experiment design",
    //     isteam: true,
    //     ispage: true,
    //     tools: "Rhino, Fologram, Unity",
    //     weight: 4,
    //     situate: { x: 75, y: -67 },
    //     isflipped: true
    // }),
    new Project({
        name: "mrfarm",
        title: "BlendedFarm",
        subtitle: "A prototype of a hybrid planting system",
        labels: ["XR"],
        time: "2021",
        collaborator: "Haoxuan Li, Yueying Chen",
        tutor: "Sky Lo",
        myContribution: "coding, electronic wiring",
        isteam: true,
        ispage: true,
        ismarkdown: true,
        tools: "Unity C#, Arduino Components, HoloLens 2",
        briefDescription: "What if data can flows among the real world and MR scene?",
        weight: 4,
        situate: { x: 50, y: 80 },
        category: "blended environment"
    }),
    new Project({
        name: "wastemachine",
        title: "Waste Machine",
        subtitle: "A scanning rig made from abandoned DVD drivers",
        labels: ["Physical"],
        time: "2024",
        collaborator: "Carla Flores Travez",
        tutor: "Daragh Bryne",
        myContribution: "Researching, Disassembling, Assambling",
        isteam: true,
        tools: "Raspberry pi, electronic soldering tools",
        briefDescription: "Linking invention and disposal by researching, disassembling, and re-assambling————hold funeral, surgey, and Neonatal surgery for disk drives",
        situate: { x: 60, y: 40 },
        ispage: true,
        weight: 6,
        ismarkdown: true,
        category: "devices"
    }),
    new Project({
        name: "dataresonate",
        title: "Perceivable Data",
        subtitle: "An multi-modal data exploration toolkit for public urban discourse",
        labels: ["XR", "HCD"],
        time: "2023",
        isteam: false,
        tools: "Unity | C# | HoloLens 2 | Arduino | Rhino | ArcGIS | Figma | Procreate | laser cut",
        briefDescription: "How to make a bridge between distant information and sensible responses?",
        youtubeLink: "https://www.youtube.com/embed/Nbk9Z47OTQQ?si=e-NE6-3MkLDDQATN",
        situate: { x: 60, y: -15 },
        ispage: true,
        weight: 8.7,
        ismarkdown: true,
        category: "blended environment"
    }),
    new Project({
        name: "weddingwall",
        title: "Ethereal Veil",
        subtitle: "An art installation for a wedding ceremony",
        labels: ["Physical"],
        time: "2021",
        isteam: true,
        collaborator: "Humachine Lab",
        tools: "Rhino, Grasshopper, CNC laser cutter",
        briefDescription: "How to create a wedding vibe through a wall?",
        situate: { x: -70, y: -90 },
        ispage: true,
        weight: 4,
        ismarkdown: true,
        category: "architectures and installations"
    }),
    // new Project({
    //     name: "wavepavilion",
    //     title: "Wave Pavilion",
    //     subtitle: "physical simulation to do formfinding and structural optimization",
    //     labels: ["Physical"],
    //     time: "2021",
    //     isteam: true,
    //     tools: "Rhino, Grasshopper, Kangaroo 2 (for physical simulation), karamba3d (for structural analysis)",
    //     briefDescription: "How to make structure part works as functional art in a small scale pavilion design",
    //     situate: { x: 50, y: 20 },
    //     ispage: true,
    //     weight: 4,
    //     ismarkdown: true
    // }),
    new Project({
        name: "ada2d",
        title: "Adaptive UI",
        time: "2025",
        isteam: false,
        subtitle: "Adaptive 2d UI layout in AR context",
        briefDescription: "How to calculate and balance the trade-off between UI widgets' position, relevance, size, levels of details in a specific AR context?",
        tutor: "Alexandra Ion",
        tools: "Python, Gurobi, scikit-learn, Tkinter",
        labels: ["Digital", "XR", "HCD"],
        ispage: true,
        ismarkdown: true,
        weight: 9,
        situate: { x: 20, y: 50 },
        category: "foundamental interaction techniques"
    }),
    new Project({
        name: "autopfl",
        title: "ML Co-Curator",
        time: "2025",
        isteam: false,
        subtitle: "A ML-driven curation tool that generates portfolios and virtual exhibitions",
        briefDescription: "How to merge the agency of designers with the data-driven curation of machine learning?",
        tutor: "Eunsu Kang",
        tools: "CNN, TSNE dimension reduction, C-TSP algorithm, k-means clustering, google-genai api, Bokeh, Three.js ",
        labels: ["Digital"],
        ispage: true,
        ismarkdown: true,
        weight: 5,
        situate: { x: 10, y: 20 },
        category: "computational design tools"
    })
];

const availableLabels = [
    "Digital", "Physical", "XR", "HCD"
];

const availableCategories = [
    "blended environment",
    "computational design tools", 
    "devices",
    "foundamental interaction techniques",
    "architectures and installations"
];

export { Project, projects, availableLabels, availableCategories };
