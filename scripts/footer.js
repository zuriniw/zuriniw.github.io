// 只在移动设备上初始化触摸交互
if (window.matchMedia('(hover: none)').matches) {
    // 创建遮罩元素
    let overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    document.body.appendChild(overlay);

    // 当前活动的元素
    let activeElement = null;

    // 用于跟踪触摸状态
    let touchStartX = 0;
    let touchStartY = 0;
    const MOVE_THRESHOLD = 10; // 移动阈值（像素）

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
        const footer = document.querySelector('.footer');

        // 触摸开始时记录位置
        function handleTouchStart(e) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }

        // 触摸移动时检查是否超过移动阈值
        function handleTouchMove(e) {
            const moveX = Math.abs(e.touches[0].clientX - touchStartX);
            const moveY = Math.abs(e.touches[0].clientY - touchStartY);

            // 如果移动超过阈值，标记为滑动而不是点击
            if (moveX > MOVE_THRESHOLD || moveY > MOVE_THRESHOLD) {
                e.target.dataset.isSliding = 'true';
            }
        }

        // 触摸结束时检查是否为有效点击
        function handleTouchEnd(e, element) {
            if (e.target.dataset.isSliding !== 'true') {
                // 是点击，不是滑动
                e.preventDefault();
                e.stopPropagation();
                handleFooterClick(element);
            }
            // 重置滑动状态
            delete e.target.dataset.isSliding;
        }

        // 添加触摸事件监听器
        if (footerBox) {
            footerBox.addEventListener('touchstart', handleTouchStart, { passive: false });
            footerBox.addEventListener('touchmove', handleTouchMove, { passive: true });
            footerBox.addEventListener('touchend', (e) => handleTouchEnd(e, footerBox));
        }

        if (copyrightText) {
            copyrightText.addEventListener('touchstart', handleTouchStart, { passive: false });
            copyrightText.addEventListener('touchmove', handleTouchMove, { passive: true });
            copyrightText.addEventListener('touchend', (e) => handleTouchEnd(e, copyrightText));
        }

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
