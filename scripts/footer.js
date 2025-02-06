document.addEventListener('DOMContentLoaded', () => {
    const boxContainer = document.querySelector('.footer-box-container');
    const footerBox = document.querySelector('.footer-box');
    
    footerBox.addEventListener('click', () => {
        boxContainer.classList.toggle('show-email');
        
        // 如果显示邮箱，恢复方块状态
        if (boxContainer.classList.contains('show-email')) {
            const boxContent = footerBox.querySelector('.box-content');
            const boxHover = footerBox.querySelector('.box-hover');
            boxContent.style.opacity = '1';
            boxHover.style.opacity = '0';
        }
    });
}); 