import { blogPosts, BlogPost } from './blogs_info.js';

// 添加 parseTime 函数定义
function parseTime(timeStr) {
    const [year, month, day] = timeStr.split('.');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day || 1));
}

// 生成博客条目
function createBlogPosts() {
    const container = document.querySelector('.blogs-container');
    
    // 在排序前打印博客列表
    console.log('Before sorting:', blogPosts.map(post => post.time));
    
    // 按时间排序（从新到旧）
    const sortedPosts = [...blogPosts].sort((a, b) => {
        const dateA = parseTime(a.time);
        const dateB = parseTime(b.time);
        console.log(`Comparing ${a.time} with ${b.time}`);
        console.log(`Date A:`, dateA);
        console.log(`Date B:`, dateB);
        console.log(`Result:`, dateB - dateA);
        return dateB - dateA;
    });
    
    // 在排序后打印博客列表
    console.log('After sorting:', sortedPosts.map(post => post.time));
    
    sortedPosts.forEach(post => {
        const blogElement = document.createElement('a');
        blogElement.className = 'blog-item';
        blogElement.href = post.link || `blogs/${post.name}/${post.name}.html`;
        if (post.isstar) blogElement.classList.add('starred');
        
        const content = `
            <span class="blog-time">${post.time}</span>
            <span class="blog-list-content" data-title="${post.title}" data-content="${post.content}">
                ${post.title}
            </span>
        `;
        
        blogElement.innerHTML = content;
        
        // 添加悬停效果
        blogElement.addEventListener('mouseenter', () => {
            const contentSpan = blogElement.querySelector('.blog-list-content');
            contentSpan.textContent = contentSpan.dataset.content;
        });
        
        // 添加移出效果
        blogElement.addEventListener('mouseleave', () => {
            const contentSpan = blogElement.querySelector('.blog-list-content');
            contentSpan.textContent = contentSpan.dataset.title;
        });
        
        container.appendChild(blogElement);
    });
}

// 初始化页面
createBlogPosts();
