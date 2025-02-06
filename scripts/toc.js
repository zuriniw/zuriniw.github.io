class TableOfContents {
    constructor() {
        this.container = null;
        this.headings = [];
        this.tocItems = [];
        this.markdownSection = null;
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
                    this.checkMarkdownVisibility();
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
}

// 初始化目录
document.addEventListener('DOMContentLoaded', () => {
    const toc = new TableOfContents();
    toc.init();
});