// 加载组件的函数
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error(`Error loading component from ${componentPath}:`, error);
    }
}

// 初始化函数
function initComponents() {
    // 获取当前页面相对于根目录的层级
    const pathLevel = window.location.pathname.split('/').length - 2;
    const basePath = '../'.repeat(pathLevel);

    // 加载页眉和页脚
    loadComponent('header', `${basePath}components/header.html`);
    loadComponent('footer', `${basePath}components/footer.html`);
}

// 当 DOM 加载完成时初始化组件
document.addEventListener('DOMContentLoaded', initComponents);
