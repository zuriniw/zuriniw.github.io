// 只在移动设备上初始化触摸交互
if (window.matchMedia('(hover: none)').matches) {
    // 创建遮罩元素
    let overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    document.body.appendChild(overlay);

    // 当前活动的元素
    let activeElement = null;

    // 处理 footer 元素的点击
    function handleFooterClick(element) {
        // 如果点击的是当前活动元素，则关闭它
        if (activeElement === element) {
            element.classList.remove('active');
            overlay.classList.remove('active');
            activeElement = null;
            return;
        }

        // 如果已经有其他活动元素，先重置它
        if (activeElement) {
            activeElement.classList.remove('active');
        }
        
        // 设置新的活动元素
        element.classList.add('active');
        activeElement = element;
        
        // 显示遮罩
        overlay.classList.add('active');
    }

    // 初始化 footer 交互
    function initFooterInteractions() {
        const footerBox = document.querySelector('.footer-box');
        const copyrightText = document.querySelector('.copyright-text');

        // 点击事件监听器
        footerBox?.addEventListener('click', (e) => {
            e.stopPropagation();
            handleFooterClick(footerBox);
        });
        
        copyrightText?.addEventListener('click', (e) => {
            e.stopPropagation();
            handleFooterClick(copyrightText);
        });

        // 点击遮罩时关闭
        overlay.addEventListener('click', () => {
            if (activeElement) {
                activeElement.classList.remove('active');
                activeElement = null;
            }
            overlay.classList.remove('active');
        });

        // 防止事件冒泡到 document
        document.querySelector('.footer')?.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // 点击页面任意位置关闭
        document.addEventListener('click', () => {
            if (activeElement) {
                activeElement.classList.remove('active');
                activeElement = null;
            }
            overlay.classList.remove('active');
        });
    }

    // 在页面加载时初始化
    document.addEventListener('DOMContentLoaded', initFooterInteractions);
}
