// 博客类型列表
const BLOG_TYPES = ['Aca', 'Tech', 'Random'];

// 博客类定义
class BlogPost {
    constructor({
        time,
        content,
        isstar = false,
        link = null,
        name,
        title,
        type = 2  // 默认为Random的索引值
    }) {
        this.time = time;
        this.content = content;
        this.isstar = isstar;
        this.link = link;
        this.name = name;
        this.title = title;
        this.type = type;    // 存储类型的索引值
    }

    // 新增方法：获取博客的markdown内容
    async getMarkdownContent() {
        try {
            const response = await fetch(`blogs/${this.name}/${this.name}.md`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const markdownContent = await response.text();
            return markdownContent;
        } catch (error) {
            console.error('Error loading markdown:', error);
            return null;
        }
    }
}

// 时间字符串转换为日期对象
function parseTime(timeStr) {
    const [year, month] = timeStr.split('.');
    return new Date(parseInt(year), parseInt(month) - 1);
}

// 博客数据
const blogPosts = [
    new BlogPost({
        time: "25.02.04",
        content: "<About this site, and my Statement of Interest>",
        title: "Dump/Matrix/Map",
        name: "firstpost",
        type: 0    // Aca的索引值
    }),
    new BlogPost({
        time: "25.03.04",
        content: "<A reflection on a recent project>",
        title: "Pre-thesis framework, Micro project",
        name: "secondpost",
        type:0
    }),
];

// 导出博客数据和类型列表
export { blogPosts, BlogPost, BLOG_TYPES };
