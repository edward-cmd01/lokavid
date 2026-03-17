class CloudService {
    constructor() {
        this.config = {
            enabled: false,
            apiUrl: '',
            apiKey: '',
            syncInterval: 60000 // 1分钟自动同步
        };
        
        this.init();
    }
    
    init() {
        // 从localStorage加载配置
        const savedConfig = localStorage.getItem('cloudServiceConfig');
        if (savedConfig) {
            try {
                this.config = { ...this.config, ...JSON.parse(savedConfig) };
            } catch (e) {
                console.error('加载云服务配置失败:', e);
            }
        }
        
        // 如果启用了云服务，启动自动同步
        if (this.config.enabled) {
            this.startAutoSync();
        }
    }
    
    // 保存配置
    saveConfig(config) {
        this.config = { ...this.config, ...config };
        localStorage.setItem('cloudServiceConfig', JSON.stringify(this.config));
    }
    
    // 启动自动同步
    startAutoSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }
        
        this.syncTimer = setInterval(() => {
            this.syncToCloud();
        }, this.config.syncInterval);
    }
    
    // 停止自动同步
    stopAutoSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
    }
    
    // 同步数据到云服务器
    async syncToCloud() {
        if (!this.config.enabled || !this.config.apiUrl) {
            return;
        }
        
        try {
            const data = {
                photographerData: getData(),
                uploadedImages: JSON.parse(localStorage.getItem('uploadedImages') || '{}')
            };
            
            const response = await fetch(`${this.config.apiUrl}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': this.config.apiKey
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                console.log('数据同步到云服务器成功');
                // 记录最后同步时间
                localStorage.setItem('lastCloudSync', new Date().toISOString());
            } else {
                console.error('数据同步到云服务器失败:', await response.text());
            }
        } catch (error) {
            console.error('同步到云服务器时发生错误:', error);
        }
    }
    
    // 从云服务器同步数据
    async syncFromCloud() {
        if (!this.config.enabled || !this.config.apiUrl) {
            return false;
        }
        
        try {
            const response = await fetch(`${this.config.apiUrl}/sync`, {
                headers: {
                    'X-Api-Key': this.config.apiKey
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.photographerData) {
                    saveData(data.photographerData);
                }
                
                if (data.uploadedImages) {
                    localStorage.setItem('uploadedImages', JSON.stringify(data.uploadedImages));
                }
                
                console.log('从云服务器同步数据成功');
                return true;
            } else {
                console.error('从云服务器同步数据失败:', await response.text());
                return false;
            }
        } catch (error) {
            console.error('从云服务器同步数据时发生错误:', error);
            return false;
        }
    }
    
    // 上传单个图片到云服务器
    async uploadImage(imagePath, base64Data) {
        if (!this.config.enabled || !this.config.apiUrl) {
            return false;
        }
        
        try {
            const response = await fetch(`${this.config.apiUrl}/upload-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': this.config.apiKey
                },
                body: JSON.stringify({
                    imagePath,
                    base64Data
                })
            });
            
            if (response.ok) {
                console.log('图片上传到云服务器成功:', imagePath);
                return true;
            } else {
                console.error('图片上传到云服务器失败:', await response.text());
                return false;
            }
        } catch (error) {
            console.error('上传图片到云服务器时发生错误:', error);
            return false;
        }
    }
    
    // 下载单个图片从云服务器
    async downloadImage(imagePath) {
        if (!this.config.enabled || !this.config.apiUrl) {
            return null;
        }
        
        try {
            const response = await fetch(`${this.config.apiUrl}/download-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': this.config.apiKey
                },
                body: JSON.stringify({ imagePath })
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.base64Data;
            } else {
                console.error('从云服务器下载图片失败:', await response.text());
                return null;
            }
        } catch (error) {
            console.error('从云服务器下载图片时发生错误:', error);
            return null;
        }
    }
    
    // 完全迁移到云服务器
    async migrateToCloud() {
        // 1. 同步所有数据到云服务器
        const syncSuccess = await this.syncToCloud();
        
        if (syncSuccess) {
            // 2. 标记为已迁移
            localStorage.setItem('cloudMigrationComplete', 'true');
            console.log('数据迁移到云服务器成功');
            return true;
        } else {
            console.error('数据迁移到云服务器失败');
            return false;
        }
    }
    
    // 从云服务器迁移回本地
    async migrateFromCloud() {
        // 1. 从云服务器同步所有数据
        const syncSuccess = await this.syncFromCloud();
        
        if (syncSuccess) {
            // 2. 标记为已迁移回本地
            localStorage.removeItem('cloudMigrationComplete');
            console.log('数据从云服务器迁移回本地成功');
            return true;
        } else {
            console.error('数据从云服务器迁移回本地失败');
            return false;
        }
    }
    
    // 获取云服务状态
    getStatus() {
        return {
            enabled: this.config.enabled,
            apiUrl: this.config.apiUrl,
            lastSync: localStorage.getItem('lastCloudSync'),
            migrationComplete: localStorage.getItem('cloudMigrationComplete') === 'true'
        };
    }
}

// 导出云服务实例
const cloudService = new CloudService();
