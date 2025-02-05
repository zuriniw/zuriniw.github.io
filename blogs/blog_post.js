import { blogPosts } from './blogs_info.js';

// 获取当前博客名称
const blogName = window.location.pathname.split('/').slice(-2)[0];

// 找到对应的博客
const currentBlog = blogPosts.find(blog => blog.name === blogName);

if (currentBlog) {
    // 设置页面标题
    document.title = `${currentBlog.title} - Ziru Wei`;
    
    // 设置博客标题和时间
    document.querySelector('.blog-title').textContent = currentBlog.title;
    document.querySelector('.blog-time').textContent = currentBlog.time;
    document.querySelector('.blog-description').textContent = currentBlog.content;
    
    // 加载 markdown 内容
    fetch(`${currentBlog.name}.md`)
        .then(response => response.text())
        .then(mdContent => {
            const markdownDiv = document.getElementById('markdown-content');
            markdownDiv.innerHTML = marked.parse(mdContent);
            
            // 处理所有图片
            markdownDiv.querySelectorAll('img').forEach(img => {
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
            });
        })
        .catch(error => {
            console.error('Error loading markdown:', error);
        });
} 