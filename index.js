console.log('Script is running');

import { projects, availableLabels, availableCategories } from './projects/project_info.js';

console.log('Available labels:', availableLabels);
console.log('Projects:', projects);

const MODALITY_PLACEHOLDER_SRC = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22320%22%20height%3D%22180%22%3E%3Crect%20width%3D%22320%22%20height%3D%22180%22%20fill%3D%22%23e0e0e0%22/%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20fill%3D%22%234c4c4c%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2215%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3Ecoming%20soon%3C/text%3E%3C/svg%3E';

const getResearchTypeClass = (value) => {
    const typeKey = String(value)
        .toLowerCase()
        .replace(/[^a-z]/g, '');

    if (typeKey === 'integration' || typeKey === 'integrations' || typeKey.startsWith('affordance')) {
        return 'research-type-aff';
    }

    if (typeKey === 'interactivity' || typeKey === 'interactivities') {
        return 'research-type-int';
    }

    return 'research-type-neutral';
};

function createResearchProjectsSection() {
    const researchContainer = document.querySelector('.research-projects');
    const researchSection = document.querySelector('.research-section');
    const researchHeading = document.querySelector('.research-heading');

    if (!researchContainer || !researchSection || !researchHeading) return;

    const researchProjects = projects.filter(project => project.isResearch);

    if (!researchProjects.length) {
        researchSection.style.display = 'none';
        researchHeading.style.display = 'none';
        return;
    }

    researchContainer.innerHTML = '';

    researchProjects
        .slice()
        .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))
        .forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'research-card';

            const projectImage = document.createElement('div');
            projectImage.className = 'carousel-project-image';

            const img = document.createElement('img');
            img.src = project.name === 'OmniOrchestrator'
                ? MODALITY_PLACEHOLDER_SRC
                : project.gifImage;
            img.alt = project.title;
            img.loading = 'lazy';
            img.setAttribute('draggable', 'false');

            projectImage.appendChild(img);

            const projectInfo = document.createElement('div');
            projectInfo.className = 'carousel-project-info';

            const projectTitle = document.createElement('h4');
            projectTitle.className = 'carousel-project-title';

            const typeStack = document.createElement('span');
            typeStack.className = 'research-type-stack';

            const typeList = Array.isArray(project.researchType) ? project.researchType : [];
            const indicators = typeList.length ? typeList : ['None'];

            indicators.forEach((type, index) => {
                const indicator = document.createElement('span');
                indicator.className = 'research-type-indicator';
                indicator.dataset.index = index;
                indicator.style.zIndex = String(100 - index);

                indicator.classList.add(getResearchTypeClass(type));

                typeStack.appendChild(indicator);
            });

            projectTitle.appendChild(typeStack);

            const titleText = document.createElement('span');
            titleText.className = 'research-card-title-text';
            titleText.textContent = project.title;

            projectTitle.appendChild(titleText);
            projectInfo.appendChild(projectTitle);

            projectCard.appendChild(projectImage);
            projectCard.appendChild(projectInfo);

            const projectDetails = document.createElement('div');
            projectDetails.className = 'research-card-details';

            if (project.author) {
                const author = document.createElement('div');
                author.className = 'research-card-author';
                author.textContent = project.author;
                projectDetails.appendChild(author);
            }

            if (project.venue) {
                const venue = document.createElement('div');
                venue.className = 'research-card-venue';
                venue.textContent = project.venue;
                projectDetails.appendChild(venue);
            }

            const links = [];
            const addLink = (rawUrl, label) => {
                if (!rawUrl) return;
                const url = String(rawUrl).replace(/&amp;/g, '&').trim();
                if (!url) return;

                const link = document.createElement('a');
                link.className = 'research-card-link';
                link.href = url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.textContent = label;
                link.addEventListener('click', (event) => {
                    event.stopPropagation();
                });
                links.push(link);
            };

            addLink(project.paperLink, 'Paper');
            addLink(project.doi, 'DOI');

            if (links.length) {
                const linkWrapper = document.createElement('div');
                linkWrapper.className = 'research-card-links';
                links.forEach(link => linkWrapper.appendChild(link));
                projectDetails.appendChild(linkWrapper);
            }

            if (projectDetails.children.length) {
                projectInfo.appendChild(projectDetails);
            }

            if (project.youtubeLink) {
                const projectActions = document.createElement('div');
                projectActions.className = 'carousel-project-actions';

                let videoUrl = String(project.youtubeLink);
                const sanitized = videoUrl.replace(/&amp;/g, '&');
                const embedMatch = sanitized.match(/youtube\.com\/embed\/([A-Za-z0-9_-]+)/i);
                videoUrl = embedMatch ? `https://www.youtube.com/watch?v=${embedMatch[1]}` : sanitized;

                const videoButton = document.createElement('a');
                videoButton.className = 'carousel-project-video';
                videoButton.href = videoUrl;
                videoButton.target = '_blank';
                videoButton.rel = 'noopener noreferrer';
                videoButton.textContent = '▶';
                videoButton.setAttribute('aria-label', `Watch ${project.title} video`);
                videoButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                });

                projectActions.appendChild(videoButton);
                projectCard.appendChild(projectActions);
            }

            if (project.ispage) {
                projectCard.classList.add('research-card--clickable');
                projectCard.addEventListener('click', () => {
                    window.location.href = project.getHtmlPath();
                });
            }

            researchContainer.appendChild(projectCard);
        });
}

// Register service worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('ServiceWorker registration successful');
        }).catch(function(err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    }
}

// Create category columns for mobile
function createCategoryColumns() {
    const columnContainer = document.querySelector('.column-container');
    if (!columnContainer) return;

    // Clear existing content
    columnContainer.innerHTML = '';

    availableCategories.forEach(category => {
        const categoryColumn = document.createElement('div');
        categoryColumn.className = 'category-column';
        categoryColumn.setAttribute('data-category', category.name);

        // Create category illustration
        const illustration = document.createElement('img');
        illustration.className = 'category-illustration';
        illustration.src = category.illustration;
        illustration.alt = category.name;
        illustration.loading = 'lazy';
        illustration.setAttribute('draggable', 'false');

        // Create category title
        const categoryTitle = document.createElement('h3');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = category.name;

        // Create projects container
        const categoryProjects = document.createElement('div');
        categoryProjects.className = 'category-projects';

        // Filter and add projects for this category
        const categoryProjectList = projects
            .filter(project => project.category === category.name && !project.isResearch)
            .slice()
            .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));

        categoryProjectList.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'column-project-card';

            // Add label attributes for filtering
            project.labels.forEach(label => {
                const sanitizedLabel = label.toLowerCase().replace(/\//g, '-');
                projectCard.setAttribute(`data-${sanitizedLabel}`, 'true');
            });

            // Create project image
            const projectImage = document.createElement('div');
            projectImage.className = 'column-project-image';
            const img = document.createElement('img');
            img.src = project.gifImage;
            img.alt = project.title;
            img.loading = 'lazy';
            img.setAttribute('draggable', 'false');
            projectImage.appendChild(img);

            // Create project info
            const projectInfo = document.createElement('div');
            projectInfo.className = 'column-project-info';

            const projectTitle = document.createElement('h4');
            projectTitle.className = 'column-project-title';
            projectTitle.textContent = project.title;
            projectInfo.appendChild(projectTitle);

            // Add click handler
            projectCard.addEventListener('click', () => {
                window.location.href = project.getHtmlPath();
            });

            projectCard.appendChild(projectImage);
            projectCard.appendChild(projectInfo);
            categoryProjects.appendChild(projectCard);
        });

        categoryColumn.appendChild(illustration);
        categoryColumn.appendChild(categoryTitle);
        categoryColumn.appendChild(categoryProjects);
        columnContainer.appendChild(categoryColumn);
    });
}

// Disable image dragging globally
function enforceNoSelectNoDragOnImages() {
    const setAttrs = (img) => {
        try {
            img.setAttribute('draggable', 'false');
            img.draggable = false;
            img.style.webkitUserDrag = 'none';
            img.style.userSelect = 'none';
        } catch (_) {}
    };

    document.querySelectorAll('img').forEach(setAttrs);

    const mo = new MutationObserver((mutations) => {
        for (const m of mutations) {
            m.addedNodes && m.addedNodes.forEach((node) => {
                if (node && node.nodeType === 1) {
                    if (node.tagName === 'IMG') setAttrs(node);
                    if (node.querySelectorAll) node.querySelectorAll('img').forEach(setAttrs);
                }
            });
        }
    });

    mo.observe(document.documentElement, { childList: true, subtree: true });

    document.addEventListener('dragstart', (e) => {
        if (e.target && e.target.tagName === 'IMG') e.preventDefault();
    });
}

// Create desktop carousel view
let currentCategoryIndex = 0;
let carouselInterval = null;

function createDesktopCarousel() {
    const carouselTrack = document.querySelector('.carousel-track');
    if (!carouselTrack) return;

    // Clear existing content
    carouselTrack.innerHTML = '';

    // Create category items
    availableCategories.forEach((category, index) => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'carousel-category-item';
        categoryItem.setAttribute('data-index', index);

        // Create category illustration
        const illustration = document.createElement('img');
        illustration.className = 'carousel-category-image';
        illustration.src = category.illustration;
        illustration.alt = category.name;
        illustration.loading = 'lazy';
        illustration.setAttribute('draggable', 'false');

        // Create category name
        const categoryName = document.createElement('div');
        categoryName.className = 'carousel-category-name';
        categoryName.textContent = category.name;

        categoryItem.appendChild(illustration);
        categoryItem.appendChild(categoryName);

        // Add click handler
        categoryItem.addEventListener('click', () => {
            currentCategoryIndex = index;
            updateCarousel();
            resetCarouselInterval(); // Reset auto-play timer when user clicks
        });

        carouselTrack.appendChild(categoryItem);
    });

    // Initialize carousel
    updateCarousel();
    startCarouselAutoPlay();
}

function startCarouselAutoPlay() {
    // Clear any existing interval
    if (carouselInterval) {
        clearInterval(carouselInterval);
    }

    // Auto-advance every 3 seconds
    carouselInterval = setInterval(() => {
        currentCategoryIndex = (currentCategoryIndex + 1) % availableCategories.length;
        updateCarousel();
    }, 3000);
}

function resetCarouselInterval() {
    startCarouselAutoPlay();
}

function updateCarousel() {
    const categoryItems = document.querySelectorAll('.carousel-category-item');
    const totalCategories = availableCategories.length;

    // Update category items opacity and position
    categoryItems.forEach((item, index) => {
        item.classList.remove('active', 'prev', 'next');

        // Calculate position relative to current index
        const diff = index - currentCategoryIndex;

        // Assign classes based on position
        if (diff === 0) {
            item.classList.add('active');
        } else if (diff === -1 || diff === totalCategories - 1) {
            item.classList.add('prev');
        } else if (diff === 1 || diff === -(totalCategories - 1)) {
            item.classList.add('next');
        }
    });

    // Update projects display
    displayCategoryProjects(availableCategories[currentCategoryIndex].name);
}

function displayCategoryProjects(categoryName) {
    const projectsContainer = document.querySelector('.carousel-projects');
    if (!projectsContainer) return;

    // Clear existing projects
    projectsContainer.innerHTML = '';

    // Filter projects for this category
    const categoryProjects = projects
        .filter(project => project.category === categoryName && !project.isResearch)
        .slice()
        .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));

    // Create project cards
    categoryProjects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'carousel-project-card';

        // Left side: GIF image
        const projectImage = document.createElement('div');
        projectImage.className = 'carousel-project-image';
        const img = document.createElement('img');
        img.src = project.gifImage;
        img.alt = project.title;
        img.loading = 'lazy';
        img.setAttribute('draggable', 'false');
        projectImage.appendChild(img);

        // Right side: Info
        const projectInfo = document.createElement('div');
        projectInfo.className = 'carousel-project-info';

        const projectTitle = document.createElement('h4');
        projectTitle.className = 'carousel-project-title';
        projectTitle.textContent = project.title;

        const projectSubtitle = document.createElement('div');
        projectSubtitle.className = 'carousel-project-subtitle';
        projectSubtitle.textContent = project.subtitle;

        const projectDate = document.createElement('div');
        projectDate.className = 'carousel-project-date';
        projectDate.textContent = project.time;

        projectInfo.appendChild(projectTitle);
        projectInfo.appendChild(projectSubtitle);

        projectInfo.appendChild(projectDate);

        if (project.youtubeLink) {
            const projectLinks = document.createElement('div');
            projectLinks.className = 'carousel-project-links';

            let videoUrl = String(project.youtubeLink);
            const sanitized = videoUrl.replace(/&amp;/g, '&');
            const embedMatch = sanitized.match(/youtube\.com\/embed\/([A-Za-z0-9_-]+)/i);
            videoUrl = embedMatch ? `https://www.youtube.com/watch?v=${embedMatch[1]}` : sanitized;

            const videoButton = document.createElement('a');
            videoButton.className = 'project-card-link';
            videoButton.href = videoUrl;
            videoButton.target = '_blank';
            videoButton.rel = 'noopener noreferrer';
            videoButton.textContent = 'Video';
            videoButton.setAttribute('aria-label', `Watch ${project.title} video`);
            videoButton.addEventListener('click', (event) => {
                event.stopPropagation();
            });

            projectLinks.appendChild(videoButton);
            projectInfo.appendChild(projectLinks);
        }

        // Add hover handlers to pause/resume carousel
        projectCard.addEventListener('mouseenter', () => {
            if (carouselInterval) {
                clearInterval(carouselInterval);
                carouselInterval = null;
            }
        });

        projectCard.addEventListener('mouseleave', () => {
            startCarouselAutoPlay();
        });

        // Add click handler
        projectCard.addEventListener('click', () => {
            window.location.href = project.getHtmlPath();
        });

        projectCard.appendChild(projectImage);
        projectCard.appendChild(projectInfo);

        projectsContainer.appendChild(projectCard);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Create research section
    createResearchProjectsSection();

    // Create column view (only visible on mobile)
    createCategoryColumns();

    // Create desktop carousel (only visible on desktop)
    createDesktopCarousel();

    // Disable image dragging
    enforceNoSelectNoDragOnImages();

    // Register service worker
    registerServiceWorker();
});
