console.log('Footer script loading...');

// 等待 DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    function initFooter() {
        console.log('Initializing footer...');
        const footerBox = document.querySelector('.footer-box');
        const footerLeft = document.querySelector('.footer-left');
        
        console.log('Footer elements:', { footerBox, footerLeft });
        
        if (!footerBox || !footerLeft) {
            console.log('Elements not found, retrying...');
            setTimeout(initFooter, 100);
            return;
        }

        console.log('Adding click event listener');
        footerBox.addEventListener('click', () => {
            console.log('Footer box clicked');
            footerLeft.classList.toggle('show-email');
        });
    }

    initFooter();
});