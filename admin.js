function initAdmin() {
    const data = getData();
    
    document.getElementById('siteName').value = data.site.name || '';
    document.getElementById('siteSubtitle').value = data.site.subtitle || '';
    document.getElementById('heroImageInput').value = data.site.heroImage || '';
    document.getElementById('logoImageInput').value = data.site.logoImage || '';
    
    // 更新首页背景图片预览
    updateHeroImagePreview();
    
    // 更新logo图片预览
    updateLogoImagePreview();
    
    document.getElementById('aboutPhotoInput').value = data.about.photo || '';
    document.getElementById('aboutContent').value = data.about.content || '';
    
    // 更新个人照片预览
    updateAboutPhotoPreview();
    
    document.getElementById('contactEmail').value = data.contact.email || '';
    document.getElementById('contactXiaohongshu').value = data.contact.xiaohongshu || '';
    document.getElementById('contactXiaohongshuLink').value = data.contact.xiaohongshuLink || '';
    document.getElementById('contactWeibo').value = data.contact.weibo || '';
    document.getElementById('contactWeiboLink').value = data.contact.weiboLink || '';
    
    // 初始化云服务设置
    initCloudSettings();
    
    renderProjectsList();
}

function initCloudSettings() {
    // 加载云服务配置
    const savedConfig = localStorage.getItem('cloudServiceConfig');
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            document.getElementById('cloudEnabled').checked = config.enabled || false;
            document.getElementById('cloudApiUrl').value = config.apiUrl || '';
            document.getElementById('cloudApiKey').value = config.apiKey || '';
            document.getElementById('cloudSyncInterval').value = config.syncInterval ? config.syncInterval / 1000 : 60;
        } catch (e) {
            console.error('加载云服务配置失败:', e);
        }
    }
    
    // 更新云服务状态
    updateCloudStatus();
}

function updateCloudStatus() {
    const statusText = document.getElementById('cloudStatusText');
    const lastSync = document.getElementById('cloudLastSync');
    
    if (typeof cloudService !== 'undefined') {
        const status = cloudService.getStatus();
        statusText.textContent = status.enabled ? '已启用' : '未启用';
        lastSync.textContent = status.lastSync || '从未';
    } else {
        statusText.textContent = '未初始化';
        lastSync.textContent = '从未';
    }
}

function saveCloudSettings() {
    if (typeof cloudService === 'undefined') {
        alert('云服务模块未加载');
        return;
    }
    
    const config = {
        enabled: document.getElementById('cloudEnabled').checked,
        apiUrl: document.getElementById('cloudApiUrl').value,
        apiKey: document.getElementById('cloudApiKey').value,
        syncInterval: parseInt(document.getElementById('cloudSyncInterval').value) * 1000
    };
    
    cloudService.saveConfig(config);
    
    if (config.enabled) {
        cloudService.startAutoSync();
    } else {
        cloudService.stopAutoSync();
    }
    
    updateCloudStatus();
    alert('云服务设置已保存');
}

async function syncToCloud() {
    if (typeof cloudService === 'undefined') {
        alert('云服务模块未加载');
        return;
    }
    
    const success = await cloudService.syncToCloud();
    if (success) {
        updateCloudStatus();
        alert('数据同步到云服务器成功');
    } else {
        alert('数据同步到云服务器失败');
    }
}

async function syncFromCloud() {
    if (typeof cloudService === 'undefined') {
        alert('云服务模块未加载');
        return;
    }
    
    const success = await cloudService.syncFromCloud();
    if (success) {
        updateCloudStatus();
        // 重新初始化管理界面
        initAdmin();
        alert('从云服务器同步数据成功');
    } else {
        alert('从云服务器同步数据失败');
    }
}

async function migrateToCloud() {
    if (typeof cloudService === 'undefined') {
        alert('云服务模块未加载');
        return;
    }
    
    if (confirm('确定要将所有数据迁移到云服务器吗？')) {
        const success = await cloudService.migrateToCloud();
        if (success) {
            updateCloudStatus();
            alert('数据迁移到云服务器成功');
        } else {
            alert('数据迁移到云服务器失败');
        }
    }
}

function getImageSrc(src) {
    const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages') || '{}');
    return uploadedImages[src] || src;
}

function renderProjectsList() {
    const data = getData();
    const container = document.getElementById('projectsList');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    data.projects.forEach((project, index) => {
        const item = document.createElement('div');
        item.className = 'project-item';
        item.innerHTML = `
            <img src="${getImageSrc(project.cover)}" alt="${project.title}" class="project-item-thumb" onerror="this.src='images/placeholder.svg'">
            <div class="project-item-info">
                <p class="project-item-title">${project.title}</p>
                <p class="project-item-count">${project.images.length} 张图片 · ${project.year}</p>
            </div>
            <div class="project-item-actions">
                <button class="btn btn-sm btn-outline" onclick="editProject(${index})">编辑</button>
                <button class="btn btn-sm btn-outline" onclick="deleteProject(${index})">删除</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function saveSiteSettings() {
    const data = getData();
    
    data.site.name = document.getElementById('siteName').value;
    data.site.logoImage = document.getElementById('logoImageInput').value;
    data.site.subtitle = document.getElementById('siteSubtitle').value;
    data.site.heroImage = document.getElementById('heroImageInput').value;
    
    saveData(data);
    alert('网站设置已保存');
}

function saveAboutSettings() {
    const data = getData();
    
    data.about.photo = document.getElementById('aboutPhotoUpload').value;
    data.about.content = document.getElementById('aboutContent').value;
    
    saveData(data);
    alert('简介已保存');
}

function saveContactSettings() {
    const data = getData();
    
    data.contact.email = document.getElementById('contactEmail').value;
    data.contact.xiaohongshu = document.getElementById('contactXiaohongshu').value;
    data.contact.xiaohongshuLink = document.getElementById('contactXiaohongshuLink').value;
    data.contact.weibo = document.getElementById('contactWeibo').value;
    data.contact.weiboLink = document.getElementById('contactWeiboLink').value;
    
    saveData(data);
    alert('联系方式已保存');
}

function addNewProject() {
    const data = getData();
    
    const newProject = {
        id: 'project-' + Date.now(),
        title: '新项目',
        year: new Date().getFullYear().toString(),
        cover: 'images/placeholder.jpg',
        description: '项目描述',
        images: [{ src: 'images/placeholder.jpg', description: '@Lokavid' }]
    };
    
    data.projects.push(newProject);
    saveData(data);
    renderProjectsList();
    
    editProject(data.projects.length - 1);
}

function editProject(index) {
    const data = getData();
    const project = data.projects[index];
    
    document.getElementById('editProjectIndex').value = index;
    document.getElementById('projectId').value = project.id;
    document.getElementById('projectTitle').value = project.title;
    document.getElementById('projectYear').value = project.year;
    document.getElementById('projectCover').value = project.cover || '';
    document.getElementById('projectDescription').value = project.description;
    
    // 处理图片数据，将对象数组转换为字符串格式
    const imagesText = project.images.map(img => {
        if (typeof img === 'object') {
            return `${img.src}|${img.description || '@Lokavid'}`;
        }
        return `${img}|@Lokavid`;
    }).join('\n');
    
    document.getElementById('projectImages').value = imagesText;
    
    // 更新图片列表显示
    updateProjectImagesList();
    
    // 显示上传状态
    const uploadStatus = document.getElementById('uploadStatus');
    if (uploadStatus) {
        uploadStatus.textContent = `已上传 ${project.images.length} 张图片`;
        setTimeout(() => {
            uploadStatus.textContent = '';
        }, 2000);
    }
    
    // 显示编辑表单
    const editForm = document.getElementById('project-edit-form');
    editForm.style.display = 'block';
    
    // 滚动到编辑区域
    editForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function saveProject() {
    const data = getData();
    const index = parseInt(document.getElementById('editProjectIndex').value);
    
    // 处理图片数据，将字符串格式转换为对象数组
    const imagesText = document.getElementById('projectImages').value.split('\n').filter(img => img.trim());
    const images = imagesText.map(imgStr => {
        const parts = imgStr.split('|');
        return {
            src: parts[0],
            description: parts[1] || '@Lokavid'
        };
    });
    
    let cover = document.getElementById('projectCover').value;
    
    // 如果用户没有设置封面，使用第一张图片作为封面
    if (!cover && images.length > 0) {
        cover = images[0].src;
    }
    
    data.projects[index] = {
        id: document.getElementById('projectId').value,
        title: document.getElementById('projectTitle').value,
        year: document.getElementById('projectYear').value,
        cover: cover,
        description: document.getElementById('projectDescription').value,
        images: images
    };
    
    saveData(data);
    renderProjectsList();
    cancelEditProject();
    alert('项目已保存');
}

function cancelEditProject() {
    document.getElementById('project-edit-form').style.display = 'none';
}

function deleteProject(index) {
    if (!confirm('确定要删除这个项目吗？')) return;
    
    const data = getData();
    data.projects.splice(index, 1);
    saveData(data);
    renderProjectsList();
}

function resetToDefault() {
    if (!confirm('确定要重置所有数据吗？这将清除所有自定义内容。')) return;
    
    localStorage.removeItem('photographerData');
    initAdmin();
    alert('已重置为默认数据');
}

function selectCoverImage(imgPath) {
    const projectCover = document.getElementById('projectCover');
    if (projectCover) {
        projectCover.value = imgPath;
        alert('已将此图片设为封面');
    }
}

function updateProjectImagesList() {
    const projectImagesTextarea = document.getElementById('projectImages');
    const imagesList = document.getElementById('projectImagesList');
    const projectCover = document.getElementById('projectCover');
    
    if (!projectImagesTextarea || !imagesList) return;
    
    const images = projectImagesTextarea.value.split('\n').filter(img => img.trim());
    const currentCover = projectCover ? projectCover.value : '';
    
    imagesList.innerHTML = '';
    
    images.forEach((imgStr, index) => {
        const parts = imgStr.split('|');
        const imgPath = parts[0];
        const description = parts[1] || '@Lokavid';
        
        const imageItem = document.createElement('div');
        imageItem.style.cssText = 'position: relative; width: 120px; height: 120px; border: 1px solid #eee; overflow: hidden; margin-bottom: 10px;';
        
        // 检查是否是当前封面
        const isCover = imgPath === currentCover;
        
        imageItem.innerHTML = `
            <img src="${getImageSrc(imgPath)}" alt="图片 ${index + 1}" style="width: 100%; height: 90px; object-fit: cover; filter: grayscale(100%);">
            <div style="position: absolute; top: 2px; right: 2px; width: 12px; height: 12px; background: ${isCover ? '#333' : 'transparent'}; border-radius: 50%; border: 1px solid ${isCover ? '#fff' : 'transparent'}; z-index: 10;"></div>
            <div style="position: absolute; bottom: 30px; left: 0; right: 0; background: rgba(0,0,0,0.7); color: white; display: flex; justify-content: space-between; padding: 4px;">
                <span style="font-size: 10px;">${index + 1}</span>
                <div>
                    <button type="button" onclick="selectCoverImage('${imgPath}')" style="background: none; border: none; color: white; cursor: pointer; font-size: 10px; margin-right: 4px;">设为封面</button>
                    <button type="button" onclick="removeProjectImage(${index})" style="background: none; border: none; color: white; cursor: pointer; font-size: 10px; margin-right: 4px;">删除</button>
                    <button type="button" onclick="replaceProjectImage(${index})" style="background: none; border: none; color: white; cursor: pointer; font-size: 10px;">替换</button>
                </div>
            </div>
            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: #f5f5f5; padding: 2px;">
                <input type="text" value="${description}" onchange="updateImageDescription(${index}, this.value)" style="width: 100%; font-size: 10px; border: 1px solid #ddd; padding: 2px; box-sizing: border-box;">
            </div>
        `;
        
        imagesList.appendChild(imageItem);
    });
}

function updateImageDescription(index, description) {
    const projectImagesTextarea = document.getElementById('projectImages');
    const images = projectImagesTextarea.value.split('\n').filter(img => img.trim());
    
    const parts = images[index].split('|');
    images[index] = `${parts[0]}|${description || '@Lokavid'}`;
    
    projectImagesTextarea.value = images.join('\n');
}

function removeProjectImage(index) {
    const projectImagesTextarea = document.getElementById('projectImages');
    const images = projectImagesTextarea.value.split('\n').filter(img => img.trim());
    
    images.splice(index, 1);
    projectImagesTextarea.value = images.join('\n');
    updateProjectImagesList();
    
    // 显示操作成功提示
    const uploadStatus = document.getElementById('uploadStatus');
    uploadStatus.textContent = '图片已删除';
    setTimeout(() => {
        uploadStatus.textContent = '';
    }, 2000);
}

let replaceImageIndex = -1;

function replaceProjectImage(index) {
    replaceImageIndex = index;
    const replaceInput = document.createElement('input');
    replaceInput.type = 'file';
    replaceInput.accept = 'image/*';
    replaceInput.onchange = function(event) {
        if (event.target.files.length > 0) {
            handleReplaceImage(event, index);
        }
    };
    replaceInput.click();
}

function handleReplaceImage(event, index) {
    const files = event.target.files;
    const uploadStatus = document.getElementById('uploadStatus');
    const projectImagesTextarea = document.getElementById('projectImages');
    
    if (!uploadStatus || !projectImagesTextarea) {
        console.error('上传状态或图片文本域未找到');
        return;
    }
    
    if (files.length === 0) return;
    
    const file = files[0];
    
    // 先检查文件大小
    if (file.size > 10 * 1024 * 1024) { // 10MB上限
        uploadStatus.textContent = '替换失败：文件大小不能超过10MB';
        return;
    }
    
    // 先检查并清理localStorage
    cleanLocalStorage();
    
    // 检查存储空间
    const quotaInfo = checkLocalStorageQuota();
    console.log('LocalStorage使用情况:', quotaInfo);
    
    // 检查是否有足够空间
    if (quotaInfo.remainingBytes < 1024 * 1024) { // 至少需要1MB空间
        uploadStatus.textContent = '替换失败：存储空间不足，请点击下方按钮清理数据后重试';
        // 显示清理按钮
        const cleanButton = document.createElement('button');
        cleanButton.type = 'button';
        cleanButton.className = 'btn btn-sm btn-outline';
        cleanButton.textContent = '清理数据';
        cleanButton.onclick = resetLocalStorage;
        cleanButton.style.marginTop = '0.5rem';
        
        // 检查是否已经有清理按钮
        const existingButton = uploadStatus.nextElementSibling;
        if (existingButton && existingButton.onclick === resetLocalStorage) {
            existingButton.style.display = 'inline-block';
        } else {
            uploadStatus.parentNode.appendChild(cleanButton);
        }
        return;
    }
    
    uploadStatus.textContent = '正在替换图片...';
    
    compressImage(file, 1200, 0.7)
        .then(base64Data => {
            try {
                const fileName = 'upload_' + Date.now() + '_' + Math.floor(Math.random() * 10000) + '.jpg';
                const virtualPath = 'images/' + fileName;
                
                // 保存到localStorage
                const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages') || '{}');
                uploadedImages[virtualPath] = base64Data;
                
                localStorage.setItem('uploadedImages', JSON.stringify(uploadedImages));
                
                // 更新图片列表，保留原有的描述
                const images = projectImagesTextarea.value.split('\n').filter(img => img.trim());
                const parts = images[index].split('|');
                const description = parts[1] || '@Lokavid';
                images[index] = `${virtualPath}|${description}`;
                projectImagesTextarea.value = images.join('\n');
                
                // 更新图片列表显示
                updateProjectImagesList();
                
                uploadStatus.textContent = '图片已替换';
                setTimeout(() => {
                    uploadStatus.textContent = '';
                    // 隐藏清理按钮
                    const cleanButton = uploadStatus.parentNode.querySelector('button[onclick="resetLocalStorage()"]');
                    if (cleanButton) {
                        cleanButton.style.display = 'none';
                    }
                }, 2000);
            } catch (error) {
                if (error.message.includes('quota')) {
                    uploadStatus.textContent = '替换失败：存储空间不足，请清理数据后重试';
                    // 显示清理按钮
                    const cleanButton = document.createElement('button');
                    cleanButton.type = 'button';
                    cleanButton.className = 'btn btn-sm btn-outline';
                    cleanButton.textContent = '清理数据';
                    cleanButton.onclick = resetLocalStorage;
                    cleanButton.style.marginTop = '0.5rem';
                    
                    const existingButton = uploadStatus.nextElementSibling;
                    if (existingButton && existingButton.onclick === resetLocalStorage) {
                        existingButton.style.display = 'inline-block';
                    } else {
                        uploadStatus.parentNode.appendChild(cleanButton);
                    }
                } else {
                    uploadStatus.textContent = '替换失败：' + error.message;
                }
                console.error('替换失败:', error);
            }
        })
        .catch(error => {
            uploadStatus.textContent = '替换失败：图片处理失败';
            console.error('图片压缩失败:', error);
        });
}

// 压缩图片函数
function compressImage(file, maxWidth = 1200, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            // 计算压缩后的尺寸
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // 绘制压缩后的图片
            ctx.drawImage(img, 0, 0, width, height);
            
            // 转换为base64
            canvas.toBlob((blob) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    resolve(e.target.result);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            }, 'image/jpeg', quality);
        };
        
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

// 检查localStorage使用情况
function checkLocalStorageQuota() {
    try {
        const used = JSON.stringify(localStorage).length;
        const quota = 5 * 1024 * 1024; // 5MB
        const remaining = quota - used;
        return {
            used: Math.round(used / 1024) + 'KB',
            remaining: Math.round(remaining / 1024) + 'KB',
            percentage: Math.round((used / quota) * 100) + '%',
            usedBytes: used,
            remainingBytes: remaining
        };
    } catch (error) {
        console.error('检查localStorage使用情况失败:', error);
        return {
            used: '未知',
            remaining: '未知',
            percentage: '未知',
            usedBytes: 0,
            remainingBytes: 0
        };
    }
}

// 清理localStorage中的冗余数据
function cleanLocalStorage() {
    try {
        // 检查并清理uploadedImages中可能的无效数据
        const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages') || '{}');
        const validImages = {};
        
        // 只保留有效的base64数据
        for (const [key, value] of Object.entries(uploadedImages)) {
            if (typeof value === 'string' && value.startsWith('data:image/')) {
                validImages[key] = value;
            }
        }
        
        // 保存清理后的数据
        localStorage.setItem('uploadedImages', JSON.stringify(validImages));
        
        // 检查photographerData是否存在
        const photographerData = localStorage.getItem('photographerData');
        if (!photographerData) {
            // 如果不存在，初始化默认数据
            localStorage.setItem('photographerData', JSON.stringify(defaultData));
        }
        
        console.log('LocalStorage清理完成');
        return true;
    } catch (error) {
        console.error('清理LocalStorage失败:', error);
        return false;
    }
}

// 强制清理所有数据（谨慎使用）
function resetLocalStorage() {
    if (confirm('确定要清空所有数据吗？这将删除所有上传的图片和设置。')) {
        try {
            localStorage.clear();
            localStorage.setItem('photographerData', JSON.stringify(defaultData));
            alert('数据已清空，已重置为默认状态');
            window.location.reload();
        } catch (error) {
            console.error('重置LocalStorage失败:', error);
            alert('重置失败，请手动清除浏览器数据');
        }
    }
}

function handleFileUpload(event) {
    const files = event.target.files;
    const uploadStatus = document.getElementById('uploadStatus');
    const projectImagesTextarea = document.getElementById('projectImages');
    
    if (!uploadStatus || !projectImagesTextarea) {
        console.error('上传状态或图片文本域未找到');
        return;
    }
    
    if (files.length === 0) return;
    
    // 先检查并清理localStorage
    cleanLocalStorage();
    
    // 检查存储空间
    const quotaInfo = checkLocalStorageQuota();
    console.log('LocalStorage使用情况:', quotaInfo);
    
    // 检查是否有足够空间
    if (quotaInfo.remainingBytes < 1024 * 1024) { // 至少需要1MB空间
        uploadStatus.textContent = '上传失败：存储空间不足，请点击下方按钮清理数据后重试';
        // 显示清理按钮
        const cleanButton = document.createElement('button');
        cleanButton.type = 'button';
        cleanButton.className = 'btn btn-sm btn-outline';
        cleanButton.textContent = '清理数据';
        cleanButton.onclick = resetLocalStorage;
        cleanButton.style.marginTop = '0.5rem';
        
        // 检查是否已经有清理按钮
        const existingButton = uploadStatus.nextElementSibling;
        if (existingButton && existingButton.onclick === resetLocalStorage) {
            existingButton.style.display = 'inline-block';
        } else {
            uploadStatus.parentNode.appendChild(cleanButton);
        }
        return;
    }
    
    uploadStatus.textContent = `正在上传 ${files.length} 张图片...`;
    
    let uploadedCount = 0;
    let hasError = false;
    
    Array.from(files).forEach((file, index) => {
        // 先检查文件大小
        if (file.size > 10 * 1024 * 1024) { // 10MB上限
            hasError = true;
            uploadStatus.textContent = '上传失败：文件大小不能超过10MB';
            return;
        }
        
        compressImage(file, 1200, 0.7)
            .then(base64Data => {
                if (hasError) return;
                
                try {
                    const timestamp = Date.now() + index; // 添加索引避免文件名重复
                    const fileName = 'upload_' + timestamp + '_' + Math.floor(Math.random() * 10000) + '.jpg';
                    const virtualPath = 'images/' + fileName;
                    
                    // 保存到localStorage
                    const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages') || '{}');
                    uploadedImages[virtualPath] = base64Data;
                    
                    localStorage.setItem('uploadedImages', JSON.stringify(uploadedImages));
                    
                    // 添加到文本框，包含默认描述
                    const currentContent = projectImagesTextarea.value;
                    const newContent = currentContent ? currentContent + '\n' + virtualPath + '|@Lokavid' : virtualPath + '|@Lokavid';
                    projectImagesTextarea.value = newContent;
                    
                    uploadedCount++;
                    
                    if (uploadedCount === files.length) {
                        // 更新图片列表显示
                        updateProjectImagesList();
                        
                        uploadStatus.textContent = `成功上传 ${files.length} 张图片`;
                        setTimeout(() => {
                            uploadStatus.textContent = '';
                            // 隐藏清理按钮
                            const cleanButton = uploadStatus.parentNode.querySelector('button[onclick="resetLocalStorage()"]');
                            if (cleanButton) {
                                cleanButton.style.display = 'none';
                            }
                        }, 2000);
                    }
                } catch (error) {
                    hasError = true;
                    if (error.message.includes('quota')) {
                        uploadStatus.textContent = '上传失败：存储空间不足，请清理数据后重试';
                        // 显示清理按钮
                        const cleanButton = document.createElement('button');
                        cleanButton.type = 'button';
                        cleanButton.className = 'btn btn-sm btn-outline';
                        cleanButton.textContent = '清理数据';
                        cleanButton.onclick = resetLocalStorage;
                        cleanButton.style.marginTop = '0.5rem';
                        
                        const existingButton = uploadStatus.nextElementSibling;
                        if (existingButton && existingButton.onclick === resetLocalStorage) {
                            existingButton.style.display = 'inline-block';
                        } else {
                            uploadStatus.parentNode.appendChild(cleanButton);
                        }
                    } else {
                        uploadStatus.textContent = '上传失败：' + error.message;
                    }
                    console.error('上传失败:', error);
                }
            })
            .catch(error => {
                hasError = true;
                uploadStatus.textContent = '上传失败：图片处理失败';
                console.error('图片压缩失败:', error);
            });
    });
}

function updateHeroImagePreview() {
    const heroImageInput = document.getElementById('heroImageInput');
    const previewContainer = document.getElementById('heroImagePreview');
    const previewImg = document.getElementById('heroImagePreviewImg');
    
    if (heroImageInput.value) {
        previewImg.src = getImageSrc(heroImageInput.value);
        previewContainer.style.display = 'block';
    } else {
        previewContainer.style.display = 'none';
    }
}

function removeHeroImage() {
    const heroImageInput = document.getElementById('heroImageInput');
    heroImageInput.value = '';
    updateHeroImagePreview();
    
    // 显示操作成功提示
    const uploadStatus = document.getElementById('heroImageUploadStatus');
    uploadStatus.textContent = '图片已删除';
    setTimeout(() => {
        uploadStatus.textContent = '';
    }, 2000);
}

function updateLogoImagePreview() {
    const logoImageInput = document.getElementById('logoImageInput');
    const previewContainer = document.getElementById('logoImagePreview');
    const previewImg = document.getElementById('logoImagePreviewImg');
    
    if (logoImageInput.value) {
        previewImg.src = getImageSrc(logoImageInput.value);
        previewContainer.style.display = 'block';
    } else {
        previewContainer.style.display = 'none';
    }
}

function removeLogoImage() {
    const logoImageInput = document.getElementById('logoImageInput');
    logoImageInput.value = '';
    updateLogoImagePreview();
    
    // 显示操作成功提示
    const uploadStatus = document.getElementById('logoImageUploadStatus');
    uploadStatus.textContent = '图片已删除';
    setTimeout(() => {
        uploadStatus.textContent = '';
    }, 2000);
}

function handleLogoImageUpload(event) {
    const files = event.target.files;
    const uploadStatus = document.getElementById('logoImageUploadStatus');
    const logoImageInput = document.getElementById('logoImageInput');
    
    if (!uploadStatus || !logoImageInput) {
        console.error('上传状态或图片输入框未找到');
        return;
    }
    
    if (files.length === 0) return;
    
    const file = files[0];
    
    // 检查文件类型
    const allowedTypes = ['image/svg+xml', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        uploadStatus.textContent = '上传失败：只支持SVG和PNG格式的图片';
        return;
    }
    
    // 先检查文件大小
    if (file.size > 5 * 1024 * 1024) { // 5MB上限
        uploadStatus.textContent = '上传失败：文件大小不能超过5MB';
        return;
    }
    
    // 先检查并清理localStorage
    cleanLocalStorage();
    
    // 检查存储空间
    const quotaInfo = checkLocalStorageQuota();
    console.log('LocalStorage使用情况:', quotaInfo);
    
    // 检查是否有足够空间
    if (quotaInfo.remainingBytes < 1024 * 1024) { // 至少需要1MB空间
        uploadStatus.textContent = '上传失败：存储空间不足，请点击下方按钮清理数据后重试';
        // 显示清理按钮
        const cleanButton = document.createElement('button');
        cleanButton.type = 'button';
        cleanButton.className = 'btn btn-sm btn-outline';
        cleanButton.textContent = '清理数据';
        cleanButton.onclick = resetLocalStorage;
        cleanButton.style.marginTop = '0.5rem';
        
        // 检查是否已经有清理按钮
        const existingButton = uploadStatus.nextElementSibling;
        if (existingButton && existingButton.onclick === resetLocalStorage) {
            existingButton.style.display = 'inline-block';
        } else {
            uploadStatus.parentNode.appendChild(cleanButton);
        }
        return;
    }
    
    uploadStatus.textContent = '正在上传图片...';
    
    // 对于SVG和PNG，不需要压缩，直接读取为base64
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const base64Data = e.target.result;
            const fileName = 'logo_' + Date.now() + (file.type === 'image/svg+xml' ? '.svg' : '.png');
            const virtualPath = 'images/' + fileName;
            
            // 保存到localStorage
            const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages') || '{}');
            uploadedImages[virtualPath] = base64Data;
            
            localStorage.setItem('uploadedImages', JSON.stringify(uploadedImages));
            
            // 更新输入框
            logoImageInput.value = virtualPath;
            
            // 更新预览
            updateLogoImagePreview();
            
            uploadStatus.textContent = '上传成功';
            setTimeout(() => {
                uploadStatus.textContent = '';
                // 隐藏清理按钮
                const cleanButton = uploadStatus.parentNode.querySelector('button[onclick="resetLocalStorage()"]');
                if (cleanButton) {
                    cleanButton.style.display = 'none';
                }
            }, 2000);
        } catch (error) {
            if (error.message.includes('quota')) {
                uploadStatus.textContent = '上传失败：存储空间不足，请清理数据后重试';
                // 显示清理按钮
                const cleanButton = document.createElement('button');
                cleanButton.type = 'button';
                cleanButton.className = 'btn btn-sm btn-outline';
                cleanButton.textContent = '清理数据';
                cleanButton.onclick = resetLocalStorage;
                cleanButton.style.marginTop = '0.5rem';
                
                const existingButton = uploadStatus.nextElementSibling;
                if (existingButton && existingButton.onclick === resetLocalStorage) {
                    existingButton.style.display = 'inline-block';
                } else {
                    uploadStatus.parentNode.appendChild(cleanButton);
                }
            } else {
                uploadStatus.textContent = '上传失败：' + error.message;
            }
            console.error('上传失败:', error);
        }
    };
    reader.onerror = function() {
        uploadStatus.textContent = '上传失败：文件读取失败';
        console.error('文件读取失败');
    };
    reader.readAsDataURL(file);
}

function updateAboutPhotoPreview() {
    const aboutPhotoInput = document.getElementById('aboutPhotoInput');
    const previewImg = document.getElementById('aboutPhotoPreview');
    
    if (aboutPhotoInput.value) {
        previewImg.src = getImageSrc(aboutPhotoInput.value);
    } else {
        previewImg.src = 'images/portrait.svg';
    }
}

function removeAboutPhoto() {
    const aboutPhotoInput = document.getElementById('aboutPhotoInput');
    aboutPhotoInput.value = '';
    updateAboutPhotoPreview();
    
    // 显示操作成功提示
    const uploadStatus = document.getElementById('aboutPhotoUploadStatus');
    uploadStatus.textContent = '图片已删除';
    setTimeout(() => {
        uploadStatus.textContent = '';
    }, 2000);
}

function handleAboutPhotoUpload(event) {
    const files = event.target.files;
    const uploadStatus = document.getElementById('aboutPhotoUploadStatus');
    const aboutPhotoInput = document.getElementById('aboutPhotoInput');
    
    if (!uploadStatus || !aboutPhotoInput) {
        console.error('上传状态或图片输入框未找到');
        return;
    }
    
    if (files.length === 0) return;
    
    const file = files[0];
    
    // 先检查文件大小
    if (file.size > 10 * 1024 * 1024) { // 10MB上限
        uploadStatus.textContent = '上传失败：文件大小不能超过10MB';
        return;
    }
    
    // 先检查并清理localStorage
    cleanLocalStorage();
    
    // 检查存储空间
    const quotaInfo = checkLocalStorageQuota();
    console.log('LocalStorage使用情况:', quotaInfo);
    
    // 检查是否有足够空间
    if (quotaInfo.remainingBytes < 1024 * 1024) { // 至少需要1MB空间
        uploadStatus.textContent = '上传失败：存储空间不足，请点击下方按钮清理数据后重试';
        // 显示清理按钮
        const cleanButton = document.createElement('button');
        cleanButton.type = 'button';
        cleanButton.className = 'btn btn-sm btn-outline';
        cleanButton.textContent = '清理数据';
        cleanButton.onclick = resetLocalStorage;
        cleanButton.style.marginTop = '0.5rem';
        
        // 检查是否已经有清理按钮
        const existingButton = uploadStatus.nextElementSibling;
        if (existingButton && existingButton.onclick === resetLocalStorage) {
            existingButton.style.display = 'inline-block';
        } else {
            uploadStatus.parentNode.appendChild(cleanButton);
        }
        return;
    }
    
    uploadStatus.textContent = '正在上传图片...';
    
    compressImage(file, 800, 0.7) // 个人照片可以小一点
        .then(base64Data => {
            try {
                const fileName = 'about_' + Date.now() + '.jpg';
                const virtualPath = 'images/' + fileName;
                
                // 保存到localStorage
                const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages') || '{}');
                uploadedImages[virtualPath] = base64Data;
                
                localStorage.setItem('uploadedImages', JSON.stringify(uploadedImages));
                
                // 更新输入框
                aboutPhotoInput.value = virtualPath;
                
                // 更新预览
                updateAboutPhotoPreview();
                
                uploadStatus.textContent = '上传成功';
                setTimeout(() => {
                    uploadStatus.textContent = '';
                    // 隐藏清理按钮
                    const cleanButton = uploadStatus.parentNode.querySelector('button[onclick="resetLocalStorage()"]');
                    if (cleanButton) {
                        cleanButton.style.display = 'none';
                    }
                }, 2000);
            } catch (error) {
                if (error.message.includes('quota')) {
                    uploadStatus.textContent = '上传失败：存储空间不足，请清理数据后重试';
                    // 显示清理按钮
                    const cleanButton = document.createElement('button');
                    cleanButton.type = 'button';
                    cleanButton.className = 'btn btn-sm btn-outline';
                    cleanButton.textContent = '清理数据';
                    cleanButton.onclick = resetLocalStorage;
                    cleanButton.style.marginTop = '0.5rem';
                    
                    const existingButton = uploadStatus.nextElementSibling;
                    if (existingButton && existingButton.onclick === resetLocalStorage) {
                        existingButton.style.display = 'inline-block';
                    } else {
                        uploadStatus.parentNode.appendChild(cleanButton);
                    }
                } else {
                    uploadStatus.textContent = '上传失败：' + error.message;
                }
                console.error('上传失败:', error);
            }
        })
        .catch(error => {
            uploadStatus.textContent = '上传失败：图片处理失败';
            console.error('图片压缩失败:', error);
        });
}

function handleHeroImageUpload(event) {
    const files = event.target.files;
    const uploadStatus = document.getElementById('heroImageUploadStatus');
    const heroImageInput = document.getElementById('heroImageInput');
    
    if (!uploadStatus || !heroImageInput) {
        console.error('上传状态或图片输入框未找到');
        return;
    }
    
    if (files.length === 0) return;
    
    const file = files[0];
    
    // 先检查文件大小
    if (file.size > 15 * 1024 * 1024) { // 15MB上限
        uploadStatus.textContent = '上传失败：文件大小不能超过15MB';
        return;
    }
    
    // 先检查并清理localStorage
    cleanLocalStorage();
    
    // 检查存储空间
    const quotaInfo = checkLocalStorageQuota();
    console.log('LocalStorage使用情况:', quotaInfo);
    
    // 检查是否有足够空间
    if (quotaInfo.remainingBytes < 1024 * 1024) { // 至少需要1MB空间
        uploadStatus.textContent = '上传失败：存储空间不足，请点击下方按钮清理数据后重试';
        // 显示清理按钮
        const cleanButton = document.createElement('button');
        cleanButton.type = 'button';
        cleanButton.className = 'btn btn-sm btn-outline';
        cleanButton.textContent = '清理数据';
        cleanButton.onclick = resetLocalStorage;
        cleanButton.style.marginTop = '0.5rem';
        
        // 检查是否已经有清理按钮
        const existingButton = uploadStatus.nextElementSibling;
        if (existingButton && existingButton.onclick === resetLocalStorage) {
            existingButton.style.display = 'inline-block';
        } else {
            uploadStatus.parentNode.appendChild(cleanButton);
        }
        return;
    }
    
    uploadStatus.textContent = '正在上传图片...';
    
    compressImage(file, 1920, 0.8) // 首页背景图片可以稍微大一点
        .then(base64Data => {
            try {
                const fileName = 'hero_' + Date.now() + '.jpg';
                const virtualPath = 'images/' + fileName;
                
                // 保存到localStorage
                const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages') || '{}');
                uploadedImages[virtualPath] = base64Data;
                
                localStorage.setItem('uploadedImages', JSON.stringify(uploadedImages));
                
                // 更新输入框
                heroImageInput.value = virtualPath;
                
                // 更新预览
                updateHeroImagePreview();
                
                uploadStatus.textContent = '上传成功';
                setTimeout(() => {
                    uploadStatus.textContent = '';
                    // 隐藏清理按钮
                    const cleanButton = uploadStatus.parentNode.querySelector('button[onclick="resetLocalStorage()"]');
                    if (cleanButton) {
                        cleanButton.style.display = 'none';
                    }
                }, 2000);
            } catch (error) {
                if (error.message.includes('quota')) {
                    uploadStatus.textContent = '上传失败：存储空间不足，请清理数据后重试';
                    // 显示清理按钮
                    const cleanButton = document.createElement('button');
                    cleanButton.type = 'button';
                    cleanButton.className = 'btn btn-sm btn-outline';
                    cleanButton.textContent = '清理数据';
                    cleanButton.onclick = resetLocalStorage;
                    cleanButton.style.marginTop = '0.5rem';
                    
                    const existingButton = uploadStatus.nextElementSibling;
                    if (existingButton && existingButton.onclick === resetLocalStorage) {
                        existingButton.style.display = 'inline-block';
                    } else {
                        uploadStatus.parentNode.appendChild(cleanButton);
                    }
                } else {
                    uploadStatus.textContent = '上传失败：' + error.message;
                }
                console.error('上传失败:', error);
            }
        })
        .catch(error => {
            uploadStatus.textContent = '上传失败：图片处理失败';
            console.error('图片压缩失败:', error);
        });
}

document.addEventListener('DOMContentLoaded', function() {
    initAdmin();
    
    // 添加项目图片上传事件监听器
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
    
    // 添加首页背景图片上传事件监听器
    const heroImageUpload = document.getElementById('heroImageUpload');
    if (heroImageUpload) {
        heroImageUpload.addEventListener('change', handleHeroImageUpload);
    }
    
    // 添加个人照片上传事件监听器
    const aboutPhotoUpload = document.getElementById('aboutPhotoUpload');
    if (aboutPhotoUpload) {
        aboutPhotoUpload.addEventListener('change', handleAboutPhotoUpload);
    }
    
    // 添加logo图片上传事件监听器
    const logoImageUpload = document.getElementById('logoImageUpload');
    if (logoImageUpload) {
        logoImageUpload.addEventListener('change', handleLogoImageUpload);
    }
    
    // 添加拖拽功能
    const uploadAreas = document.querySelectorAll('.upload-area');
    uploadAreas.forEach(uploadArea => {
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = '#333';
        });
        
        uploadArea.addEventListener('dragleave', function() {
            this.style.borderColor = '#eee';
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = '#eee';
            if (e.dataTransfer.files.length > 0) {
                const files = e.dataTransfer.files;
                
                // 判断是哪个上传区域
                if (this.querySelector('#fileInput')) {
                    // 直接调用处理函数，不需要设置files属性
                    handleFileUpload({ target: { files: files } });
                } else if (this.querySelector('#heroImageUpload')) {
                    // 直接调用处理函数，不需要设置files属性
                    handleHeroImageUpload({ target: { files: files } });
                } else if (this.querySelector('#aboutPhotoUpload')) {
                    // 直接调用处理函数，不需要设置files属性
                    handleAboutPhotoUpload({ target: { files: files } });
                } else if (this.querySelector('#logoImageUpload')) {
                    // 直接调用处理函数，不需要设置files属性
                    handleLogoImageUpload({ target: { files: files } });
                }
            }
        });
    });
});
