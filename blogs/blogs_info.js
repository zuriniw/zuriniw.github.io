// 博客类定义
class BlogPost {
    constructor({
        time,
        content,
        isstar = false,
        link = null,
        name,
        title
    }) {
        this.time = time;
        this.content = content;
        this.isstar = isstar;
        this.link = link;
        this.name = name;
        this.title = title;
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
        time: "2025.02.04",
        content: "<About this site, and my Statement of Interest>",
        title: "Finally I Build It",
        name: "firstpost"
    }),
];

// 导出博客数据
export { blogPosts, BlogPost };
