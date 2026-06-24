/**
 * 数据备份脚本
 * 用于备份和恢复localStorage中的数据
 */

class DataBackup {
    constructor() {
        this.backupKey = 'data_backup';
    }

    /**
     * 备份所有数据到文件
     */
    backupToFile() {
        // 获取所有需要备份的数据
        const backupData = {
            dailyData: localStorage.getItem('dailyData'),
            monthlyData: localStorage.getItem('monthlyData'),
            membersData: localStorage.getItem('membersData'),
            backupTime: new Date().toISOString()
        };

        // 转换为JSON字符串
        const jsonString = JSON.stringify(backupData, null, 2);

        // 创建下载链接
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = `data_backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        console.log('数据备份完成');
        alert('数据备份完成！');
    }

    /**
     * 从文件恢复数据
     */
    restoreFromFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const backupData = JSON.parse(e.target.result);
                    
                    if (!backupData.backupTime) {
                        alert('无效的备份文件');
                        return;
                    }

                    // 确认恢复操作
                    const confirmMsg = `确认恢复备份数据？\n备份时间: ${backupData.backupTime}\n\n警告: 这将覆盖当前所有数据！`;
                    if (!confirm(confirmMsg)) return;

                    // 恢复数据
                    if (backupData.dailyData !== undefined) {
                        localStorage.setItem('dailyData', backupData.dailyData);
                    }
                    if (backupData.monthlyData !== undefined) {
                        localStorage.setItem('monthlyData', backupData.monthlyData);
                    }
                    if (backupData.membersData !== undefined) {
                        localStorage.setItem('membersData', backupData.membersData);
                    }

                    console.log('数据恢复完成');
                    alert('数据恢复完成！请刷新页面查看效果。');
                } catch (error) {
                    console.error('恢复数据失败:', error);
                    alert('恢复数据失败，请检查文件格式是否正确');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    /**
     * 导出数据到剪贴板
     */
    copyToClipboard() {
        const backupData = {
            dailyData: localStorage.getItem('dailyData'),
            monthlyData: localStorage.getItem('monthlyData'),
            membersData: localStorage.getItem('membersData'),
            backupTime: new Date().toISOString()
        };

        const jsonString = JSON.stringify(backupData, null, 2);
        
        navigator.clipboard.writeText(jsonString).then(() => {
            console.log('数据已复制到剪贴板');
            alert('数据已复制到剪贴板');
        }).catch(err => {
            console.error('复制失败:', err);
            alert('复制失败，请手动选择并复制下面的数据：\n\n' + jsonString);
        });
    }

    /**
     * 从剪贴板粘贴数据
     */
    pasteFromClipboard() {
        navigator.clipboard.readText().then(text => {
            try {
                const backupData = JSON.parse(text);
                
                if (!backupData.backupTime) {
                    alert('剪贴板中的数据不是有效的备份数据');
                    return;
                }

                // 确认恢复操作
                const confirmMsg = `确认从剪贴板恢复备份数据？\n备份时间: ${backupData.backupTime}\n\n警告: 这将覆盖当前所有数据！`;
                if (!confirm(confirmMsg)) return;

                // 恢复数据
                if (backupData.dailyData !== undefined) {
                    localStorage.setItem('dailyData', backupData.dailyData);
                }
                if (backupData.monthlyData !== undefined) {
                    localStorage.setItem('monthlyData', backupData.monthlyData);
                }
                if (backupData.membersData !== undefined) {
                    localStorage.setItem('membersData', backupData.membersData);
                }

                console.log('数据已从剪贴板恢复');
                alert('数据已从剪贴板恢复！请刷新页面查看效果。');
            } catch (error) {
                console.error('解析剪贴板数据失败:', error);
                alert('解析剪贴板数据失败，请确认剪贴板中的内容是有效的备份数据');
            }
        }).catch(err => {
            console.error('读取剪贴板失败:', err);
            alert('无法读取剪贴板，请手动粘贴数据进行恢复');
        });
    }

    /**
     * 显示当前存储使用情况
     */
    showStorageInfo() {
        let totalSize = 0;
        let storageInfo = '存储使用情况：\n\n';

        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                const size = localStorage[key].length * 2; // JavaScript strings are UTF-16
                storageInfo += `${key}: ${(size / 1024).toFixed(2)} KB\n`;
                totalSize += size;
            }
        }

        storageInfo += `\n总计: ${(totalSize / 1024).toFixed(2)} KB`;
        storageInfo += `\n可用空间估算: ${((5 * 1024 * 1024 - totalSize) / 1024).toFixed(2)} KB`; // 假设浏览器限制为5MB

        alert(storageInfo);
    }
}

// 创建全局实例以便在控制台使用
window.dataBackup = new DataBackup();

console.log('数据备份工具已加载。可通过 window.dataBackup 访问功能。');
console.log('常用方法：');
console.log('  - dataBackup.backupToFile() - 备份数据到文件');
console.log('  - dataBackup.restoreFromFile() - 从文件恢复数据');
console.log('  - dataBackup.copyToClipboard() - 复制数据到剪贴板');
console.log('  - dataBackup.pasteFromClipboard() - 从剪贴板粘贴数据');
console.log('  - dataBackup.showStorageInfo() - 显示存储使用情况');