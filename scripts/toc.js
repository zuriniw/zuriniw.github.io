class TableOfContents {
    constructor() {
        this.container = null;
        this.headings = [];
        this.tocItems = [];
        this.markdownSection = null;
        this.activeHeading = null;
        this.markdownContent = document.querySelector('.markdown-content');
    }

    init() {
        // 只在有 markdown 内容的页面上初始化
        this.markdownSection = document.querySelector('.markdown-content');
        if (!this.markdownSection) return;

        // 创建目录容器
        this.container = this.createTocContainer();
        document.body.appendChild(this.container);

        // 获取所有标题
        this.headings = Array.from(this.markdownSection.querySelectorAll('h2, h3, h4'));
        
        // 生成目录内容
        this.generateToc();
        
        // 添加滚动监听
        this.addScrollListener();

        this.initTocVisibility();
    }

    createTocContainer() {
        const container = document.createElement('div');
        container.className = 'toc-container';
        container.innerHTML = `
            <ul class="toc-list"></ul>
        `;
        return container;
    }

    generateToc() {
        const tocList = this.container.querySelector('.toc-list');
        
        this.headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            const text = heading.textContent;
            const id = `heading-${index}`;
            heading.id = id;

            const listItem = document.createElement('li');
            listItem.className = 'toc-item';
            listItem.setAttribute('data-level', level);
            
            listItem.innerHTML = `<a class="toc-link" href="javascript:void(0)">${text}</a>`;
            listItem.addEventListener('click', (e) => {
                e.preventDefault();
                const yOffset = -200;  // 向下偏移200px
                const element = heading;
                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
            });
            
            tocList.appendChild(listItem);
            this.tocItems.push(listItem);
        });
    }

    addScrollListener() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.updateActiveHeading();
                    this.updateTocVisibility();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    checkMarkdownVisibility() {
        const markdownRect = this.markdownSection.getBoundingClientRect();
        const isVisible = markdownRect.top < window.innerHeight && markdownRect.bottom > 0;
        this.container.style.opacity = isVisible ? '1' : '0';
    }

    updateActiveHeading() {
        const scrollPos = window.scrollY + 300; // 增加偏移量到300px，与点击偏移保持一致

        for (let i = this.headings.length - 1; i >= 0; i--) {
            const heading = this.headings[i];
            if (heading.offsetTop <= scrollPos) {
                this.tocItems.forEach(item => item.classList.remove('active'));
                this.tocItems[i].classList.add('active');
                break;
            }
        }
    }

    initTocVisibility() {
        if (!this.container || !this.markdownContent) return;
        this.updateTocVisibility();
    }

    updateTocVisibility() {
        if (!this.container || !this.markdownContent) return;

        const markdownRect = this.markdownContent.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const threshold = 100; // 阈值，提前开始隐藏
        const topThreshold = 200; // 顶部阈值，开始显示的位置

        // 计算顶部和底部的淡入淡出
        let opacity = 1;

        // 顶部淡入
        if (markdownRect.top > -topThreshold) {
            opacity = Math.max(0, (-markdownRect.top) / topThreshold);
        }

        // 底部淡出
        if (markdownRect.bottom <= windowHeight + threshold) {
            const fadeDistance = 200; // 渐变过渡的距离
            opacity = Math.min(opacity, Math.max(0, (markdownRect.bottom - windowHeight + fadeDistance) / fadeDistance));
        }

        // 应用透明度
        this.container.style.opacity = opacity.toString();
        this.container.style.pointerEvents = opacity === 0 ? 'none' : 'auto';
    }
}

// 初始化目录
document.addEventListener('DOMContentLoaded', () => {
    const toc = new TableOfContents();
    toc.init();
});