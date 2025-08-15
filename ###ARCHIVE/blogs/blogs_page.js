import { blogPosts, BlogPost, BLOG_TYPES } from './blogs_info.js';

// 添加 parseTime 函数定义
function parseTime(timeStr) {
    const [year, month, day] = timeStr.split('.');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day || 1));
}

// 生成博客条目
function createBlogPosts() {
    const container = document.querySelector('.blogs-container');
    container.innerHTML = ''; // 清空容器
    
    // 创建类型列容器
    BLOG_TYPES.forEach((type, index) => {
        const columnDiv = document.createElement('div');
        columnDiv.className = 'blog-column';
        columnDiv.innerHTML = `
            <div class="column-arrow">▼</div>
            <h2>${type}</h2>
        `;
        container.appendChild(columnDiv);
        
        // 添加鼠标悬停事件
        columnDiv.addEventListener('mouseenter', () => {
            const arrow = columnDiv.querySelector('.column-arrow');
            arrow.style.opacity = '1';
        });
        
        columnDiv.addEventListener('mouseleave', () => {
            const arrow = columnDiv.querySelector('.column-arrow');
            arrow.style.opacity = '0';
        });
        
        // 筛选并排序该类型的博客
        const typeFilteredPosts = [...blogPosts]
            .filter(post => post.type === index)
            .sort((a, b) => {
                const dateA = parseTime(a.time);
                const dateB = parseTime(b.time);
                return dateB - dateA;
            });
        
        // 为该类型创建博客条目
        typeFilteredPosts.forEach(post => {
            const blogElement = document.createElement('a');
            blogElement.className = 'blog-item';
            blogElement.href = post.link || `blogs/${post.name}/${post.name}.html`;
            if (post.isstar) blogElement.classList.add('starred');
            
            const content = `
                <span class="blog-time">${post.time}</span>
                <span class="blog-title">
                    ${post.title}
                </span>
            `;
            
            blogElement.innerHTML = content;
            
            columnDiv.appendChild(blogElement);
        });
    });
}

// 初始化页面
createBlogPosts();
