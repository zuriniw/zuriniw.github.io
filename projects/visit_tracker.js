// 访问记录追踪器
export class VisitTracker {
    static getVisitedProjects() {
        return JSON.parse(sessionStorage.getItem('visitedProjects')) || [];
    }

    static recordVisit(projectName) {
        const visitedProjects = this.getVisitedProjects();
        if (!visitedProjects.includes(projectName)) {
            visitedProjects.push(projectName);
            sessionStorage.setItem('visitedProjects', JSON.stringify(visitedProjects));
            console.log(`${projectName} visited`);
        }
    }

    static checkAndRecordCurrentProject() {
        const currentPath = window.location.pathname;
        const projectMatch = currentPath.match(/projects\/([^/]+)\/\1\.html$/);
        console.log('isproject:', projectMatch !== null);

        if (projectMatch) {
            const projectName = projectMatch[1];
            console.log('Previously visited projects:');
            this.getVisitedProjects().forEach(name => {
                console.log(`${name} visited`);
            });
            this.recordVisit(projectName);
        }
    }
} 