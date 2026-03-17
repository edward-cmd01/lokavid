const defaultData = {
    site: {
        name: "NIU",
        logoImage: "",
        subtitle: "DOCUMENTARY PHOTOGRAPHER",
        heroImage: "images/hero.svg"
    },
    about: {
        photo: "images/portrait.svg",
        content: `<h2>关于我</h2>
<p>我是一名中国社会纪实摄影师，长期关注社会话题与公共问题，通过镜头记录时代的变迁与人们的生活状态。</p>
<p>我的作品聚焦于城市公共空间、乡村纪实、社会变迁等主题，试图以客观而富有温度的视角，呈现当代中国的社会图景。</p>
<p>摄影对我而言，不仅是记录，更是一种观察与思考的方式。我相信，每一张照片都承载着特定时空下的故事，而这些故事值得被看见、被记住。</p>`
    },
    contact: {
        email: "contact@example.com",
        xiaohongshu: "@摄影师NIU",
        xiaohongshuLink: "",
        weibo: "@摄影师NIU",
        weiboLink: ""
    },
    projects: [
        {
            id: "urban-public-space",
            title: "城市公共空间",
            year: "2023",
            cover: "images/placeholder.svg",
            description: "探索城市中公共空间的使用与变迁，记录人们在公共空间中的日常生活与互动。",
            images: [
                { src: "images/placeholder.svg", description: "@Lokavid" },
                { src: "images/placeholder.svg", description: "@Lokavid" },
                { src: "images/placeholder.svg", description: "@Lokavid" }
            ]
        },
        {
            id: "rural-documentary",
            title: "乡村纪实",
            year: "2022",
            cover: "images/placeholder.svg",
            description: "深入中国乡村，记录传统村落的日常生活、农耕文化与代际传承。",
            images: [
                { src: "images/placeholder.svg", description: "@Lokavid" },
                { src: "images/placeholder.svg", description: "@Lokavid" },
                { src: "images/placeholder.svg", description: "@Lokavid" }
            ]
        },
        {
            id: "urban-villages",
            title: "城中村",
            year: "2021",
            cover: "images/placeholder.svg",
            description: "关注城市中的城中村社区，记录这里居民的生活状态与社区变迁。",
            images: [
                { src: "images/placeholder.svg", description: "@Lokavid" },
                { src: "images/placeholder.svg", description: "@Lokavid" },
                { src: "images/placeholder.svg", description: "@Lokavid" }
            ]
        }
    ]
};

function getData() {
    const stored = localStorage.getItem('photographerData');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            return defaultData;
        }
    }
    return defaultData;
}

function saveData(data) {
    localStorage.setItem('photographerData', JSON.stringify(data));
    
    // 如果启用了云服务，尝试同步
    if (typeof cloudService !== 'undefined' && cloudService.config.enabled) {
        cloudService.syncToCloud().catch(err => console.error('云同步失败:', err));
    }
}

function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

function getImageSrc(src) {
    const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages') || '{}');
    return uploadedImages[src] || src;
}

function loadProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    
    const data = getData();
    grid.innerHTML = '';
    
    data.projects.forEach(project => {
        const card = document.createElement('a');
        card.href = `project-detail.html?id=${project.id}`;
        card.className = 'project-card fade-in';
        card.innerHTML = `
            <img src="${getImageSrc(project.cover)}" alt="${project.title}" onerror="this.src='images/placeholder.svg'">
            <div class="project-card-overlay">
                <h2 class="project-card-title">${project.title}</h2>
                <p class="project-card-year">${project.year}</p>
            </div>
        `;
        grid.appendChild(card);
    });
    
    observeFadeIn();
}

function loadProjectDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    
    if (!projectId) {
        window.location.href = 'projects.html';
        return;
    }
    
    const data = getData();
    const project = data.projects.find(p => p.id === projectId);
    
    if (!project) {
        window.location.href = 'projects.html';
        return;
    }
    
    document.title = `${project.title} | 摄影师`;
    
    const titleEl = document.getElementById('projectTitle');
    const descEl = document.getElementById('projectDesc');
    const imagesEl = document.getElementById('projectImages');
    
    if (titleEl) titleEl.textContent = project.title;
    if (descEl) descEl.textContent = project.description;
    
    if (imagesEl) {
        imagesEl.innerHTML = '';
        project.images.forEach(img => {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'project-image-container fade-in';
            
            const imgEl = document.createElement('img');
            imgEl.src = getImageSrc(img.src || img);
            imgEl.alt = project.title;
            imgEl.className = 'project-image';
            imgEl.onerror = function() { this.src = 'images/placeholder.svg'; };
            
            const descEl = document.createElement('p');
            descEl.className = 'project-image-description';
            descEl.textContent = img.description || '@Lokavid';
            
            imgContainer.appendChild(imgEl);
            imgContainer.appendChild(descEl);
            imagesEl.appendChild(imgContainer);
        });
    }
    
    observeFadeIn();
}

function loadAbout() {
    const contentEl = document.getElementById('aboutContent');
    const photoEl = document.getElementById('aboutPhoto');
    
    const data = getData();
    
    if (contentEl && data.about.content) {
        contentEl.innerHTML = data.about.content;
    }
    
    if (photoEl && data.about.photo) {
        photoEl.src = data.about.photo;
    }
}

function loadContact() {
    const container = document.getElementById('contactContainer');
    if (!container) return;
    
    const data = getData();
    
    container.innerHTML = `
        <div class="contact-item">
            <p class="contact-label">EMAIL</p>
            <p class="contact-value"><a href="mailto:${data.contact.email}">${data.contact.email}</a></p>
        </div>
        <div class="contact-item">
            <p class="contact-label">XIAOHONGSHU</p>
            <p class="contact-value">${data.contact.xiaohongshuLink ? `<a href="${data.contact.xiaohongshuLink}" target="_blank">${data.contact.xiaohongshu}</a>` : data.contact.xiaohongshu}</p>
        </div>
        <div class="contact-item">
            <p class="contact-label">WEIBO</p>
            <p class="contact-value">${data.contact.weiboLink ? `<a href="${data.contact.weiboLink}" target="_blank">${data.contact.weibo}</a>` : data.contact.weibo}</p>
        </div>
    `;
}

function loadSiteSettings() {
    const data = getData();
    
    // 更新导航栏logo
    const logo = document.querySelector('.logo');
    if (logo) {
        if (data.site.logoImage) {
            // 使用图片logo
            logo.innerHTML = `<img src="${getImageSrc(data.site.logoImage)}" alt="${data.site.name || 'Logo'}" style="height: 24px; filter: grayscale(100%);">`;
        } else {
            // 使用文字logo
            logo.textContent = data.site.name || 'NIU';
        }
    }
    
    // 更新footer版权信息
    const footerText = document.querySelector('.footer-text');
    if (footerText) {
        const currentYear = new Date().getFullYear();
        footerText.textContent = `© ${currentYear} ${data.site.name || 'NIU'}. All rights reserved.`;
    }
    
    // 更新页面标题
    document.title = `${data.site.name || '摄影师'} | 社会纪实摄影`;
}

function loadHero() {
    const heroImage = document.getElementById('heroImage');
    if (heroImage) {
        // 滚动播放项目图片
        startHeroImageSlider();
    }
}

function startHeroImageSlider() {
    const heroImage = document.getElementById('heroImage');
    const data = getData();
    
    if (!heroImage || !data.projects || data.projects.length === 0) {
        // 如果没有项目，使用默认图片
        heroImage.src = 'images/hero.svg';
        return;
    }
    
    // 收集所有项目的图片和对应的项目ID
    const projectImages = [];
    data.projects.forEach(project => {
        // 优先使用封面图
        if (project.cover) {
            projectImages.push({
                src: project.cover,
                id: project.id
            });
        }
        // 如果没有封面图，使用项目中的第一张图片
        else if (project.images && project.images.length > 0) {
            projectImages.push({
                src: project.images[0],
                id: project.id
            });
        }
    });
    
    if (projectImages.length === 0) {
        // 如果没有项目图片，使用默认图片
        heroImage.src = 'images/hero.svg';
        return;
    }
    
    let currentIndex = 0;
    
    function nextImage() {
        currentIndex = (currentIndex + 1) % projectImages.length;
        heroImage.src = getImageSrc(projectImages[currentIndex].src);
    }
    
    // 初始显示第一张图片
    heroImage.src = getImageSrc(projectImages[0].src);
    
    // 添加点击事件，跳转到对应项目
    heroImage.style.cursor = 'pointer';
    heroImage.addEventListener('click', function() {
        window.location.href = `project-detail.html?id=${projectImages[currentIndex].id}`;
    });
    
    // 每5秒切换一次图片
    setInterval(nextImage, 5000);
}

function observeFadeIn() {
    const elements = document.querySelectorAll('.fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });
    
    elements.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', function() {
    initNavbar();
    loadSiteSettings();
    loadHero();
    observeFadeIn();
});
