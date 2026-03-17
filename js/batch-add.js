function batchAddProjects() {
    const titles = [
        "须臾之境",
        "隐秘之欢",
        "人道是",
        "游园惊梦",
        "湿地的来历",
        "坏空",
        "西行路难",
        "废黄河"
    ];
    
    const data = getData();
    const existingTitles = data.projects.map(p => p.title);
    
    let addedCount = 0;
    
    titles.forEach((title, index) => {
        if (!existingTitles.includes(title)) {
            const newProject = {
                id: 'project-' + Date.now() + '-' + index,
                title: title,
                year: new Date().getFullYear().toString(),
                cover: 'images/placeholder.svg',
                description: '项目描述',
                images: ['images/placeholder.svg']
            };
            
            data.projects.push(newProject);
            addedCount++;
        }
    });
    
    saveData(data);
    
    if (addedCount > 0) {
        alert(`成功添加 ${addedCount} 个项目`);
        // 刷新项目列表
        if (typeof renderProjectsList === 'function') {
            renderProjectsList();
        }
    } else {
        alert('所有项目已存在');
    }
}

// 执行批量添加
batchAddProjects();
