const fs = require('fs');
const path = require('path');
const { projects } = require('./projects/project_info.js');

projects.forEach(project => {
    if (project.ispage) {
        const htmlContent = project.generateHtml();
        const filePath = project.getHtmlPath();
        const dirPath = path.dirname(filePath);

        // 确保目录存在
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // 写入文件
        fs.writeFileSync(filePath, htmlContent);
        console.log(`Created ${filePath}`);
    }
}); 