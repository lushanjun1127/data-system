// 数据管理类
class DataManager {
    constructor() {
        this.dailyDataKey = 'dailyData';
        this.monthlyDataKey = 'monthlyData';
        this.membersDataKey = 'membersData';
    }

    // 保存日数据到localStorage
    saveDailyData(data) {
        const dailyData = this.getDailyData();
        // 使用 Map 来优化查找性能 - 使用日期和上报人组合做唯一标识
        const dataIndex = new Map();
        dailyData.forEach((item, index) => {
            const key = `${item.date}_${item.reporter}`;
            dataIndex.set(key, index);
        });

        const key = `${data.date}_${data.reporter}`;
        const existingIndex = dataIndex.get(key);
        if (existingIndex !== undefined) {
            dailyData[existingIndex] = data;
        } else {
            dailyData.push(data);
        }
        localStorage.setItem(this.dailyDataKey, JSON.stringify(dailyData));
        // 更新缓存
        this._cachedDailyData = dailyData;
        return dailyData;
    }
    
    // 更新日数据
    updateDailyData(data) {
        const dailyData = this.getDailyData();
        const key = `${data.date}_${data.reporter}`;
        // 查找相同日期和上报人的数据
        const index = dailyData.findIndex(item => `${item.date}_${item.reporter}` === key);
        if (index !== -1) {
            dailyData[index] = data;
            localStorage.setItem(this.dailyDataKey, JSON.stringify(dailyData));
            // 更新缓存
            this._cachedDailyData = dailyData;
        }
        return dailyData;
    }

    // 获取日数据 - 添加缓存机制
    getDailyData() {
        if (!this._cachedDailyData) {
            const data = localStorage.getItem(this.dailyDataKey);
            this._cachedDailyData = data ? JSON.parse(data) : [];
        }
        return this._cachedDailyData;
    }

    // 清除日数据缓存
    _clearDailyDataCache() {
        delete this._cachedDailyData;
    }

    // 删除特定日期和上报人的日数据
    deleteDailyData(date, reporter) {
        const dailyData = this.getDailyData();
        const index = dailyData.findIndex(item => item.date === date && item.reporter === reporter);
        if (index !== -1) {
            dailyData.splice(index, 1);
            localStorage.setItem(this.dailyDataKey, JSON.stringify(dailyData));
            // 更新缓存
            this._cachedDailyData = dailyData;
        }
        return dailyData;
    }

    // 清空所有日数据
    clearDailyData() {
        localStorage.removeItem(this.dailyDataKey);
        // 清除缓存
        this._cachedDailyData = [];
        return [];
    }

    // 获取月数据 - 添加缓存机制
    getMonthlyData() {
        if (!this._cachedMonthlyData) {
            const data = localStorage.getItem(this.monthlyDataKey);
            this._cachedMonthlyData = data ? JSON.parse(data) : [];
        }
        return this._cachedMonthlyData;
    }

    // 清除月数据缓存
    _clearMonthlyDataCache() {
        delete this._cachedMonthlyData;
    }

    // 清空月数据
    clearMonthlyData() {
        localStorage.removeItem(this.monthlyDataKey);
        this._clearMonthlyDataCache(); // 清除缓存
    }

    // 删除特定月份和上报人的月数据
    deleteMonthlyData(month, reporter) {
        let monthlyData = this.getMonthlyData();
        monthlyData = monthlyData.filter(item => !(item.month === month && item.reporter === reporter));
        localStorage.setItem(this.monthlyDataKey, JSON.stringify(monthlyData));
        this._cachedMonthlyData = monthlyData;
        return monthlyData;
    }

    // 新增：保存成员数据（仅保留姓名字段）
    saveMember(member) {
        const membersData = this.getMembersData();
        // 使用 Map 来优化查找性能
        const memberIndex = new Map();
        membersData.forEach((item, index) => {
            memberIndex.set(item.name, index);
        });

        const existingIndex = memberIndex.get(member.name);
        if (existingIndex !== undefined) {
            membersData[existingIndex] = { name: member.name }; // 只保留姓名
        } else {
            membersData.push({ name: member.name }); // 只保存姓名
        }
        localStorage.setItem(this.membersDataKey, JSON.stringify(membersData));
        this._clearMembersDataCache(); // 清除缓存
        return membersData;
    }

    // 新增：获取成员数据 - 添加缓存机制
    getMembersData() {
        if (!this._cachedMembersData) {
            const data = localStorage.getItem(this.membersDataKey);
            this._cachedMembersData = data ? JSON.parse(data) : [];
        }
        return this._cachedMembersData;
    }

    // 清除成员数据缓存
    _clearMembersDataCache() {
        delete this._cachedMembersData;
    }

    // 新增：删除成员数据
    deleteMember(name) {
        let membersData = this.getMembersData();
        membersData = membersData.filter(item => item.name !== name);
        localStorage.setItem(this.membersDataKey, JSON.stringify(membersData));
        this._clearMembersDataCache(); // 清除缓存
        return membersData;
    }

    // 新增：清空成员数据
    clearMembersData() {
        localStorage.removeItem(this.membersDataKey);
        this._clearMembersDataCache(); // 清除缓存
    }

    // 计算月度数据
    calculateMonthlyData() {
        const dailyData = this.getDailyData();
        const monthlyDataMap = new Map();

        // 按月份和上报人分组计算
        for (const item of dailyData) {
            const date = new Date(item.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const compositeKey = `${monthKey}_${item.reporter}`; // 月+上报人作为唯一键

            if (!monthlyDataMap.has(compositeKey)) {
                monthlyDataMap.set(compositeKey, {
                    month: monthKey,
                    reporter: item.reporter,
                    totalDataCount: 0,
                    sumActiveAccounts: 0,
                    sumActualData: 0,
                    sumReplyRate: 0,
                    sumBannedAccounts: 0,
                    sumRestrictedAccounts: 0,
                    sumDrainageCount: 0,
                    daysCount: 0
                });
            }

            const monthData = monthlyDataMap.get(compositeKey);
            monthData.totalDataCount++;
            monthData.sumActiveAccounts += item.activeAccounts || 0;
            monthData.sumActualData += item.actualData || 0;
            monthData.sumReplyRate += item.replyRate || 0;
            monthData.sumBannedAccounts += item.bannedAccounts || 0;
            monthData.sumRestrictedAccounts += item.restrictedAccounts || 0;
            monthData.sumDrainageCount += item.drainageCount || 0;
            monthData.daysCount++;
        }

        // 计算平均值并构建最终的月数据
        const monthlyData = Array.from(monthlyDataMap.values()).map(item => ({
            month: item.month,
            reporter: item.reporter,
            totalDataCount: item.totalDataCount,
            averageActiveAccounts: Math.round(item.sumActiveAccounts / item.daysCount * 100) / 100,
            averageActualData: Math.round(item.sumActualData / item.daysCount * 100) / 100,
            averageReplyRate: Math.round(item.sumReplyRate / item.daysCount * 100) / 100,
            averageBannedAccounts: Math.round(item.sumBannedAccounts / item.daysCount * 100) / 100,
            averageRestrictedAccounts: Math.round(item.sumRestrictedAccounts / item.daysCount * 100) / 100,
            averageDrainageCount: Math.round(item.sumDrainageCount / item.daysCount * 100) / 100
        }));

        // 保存月数据
        localStorage.setItem(this.monthlyDataKey, JSON.stringify(monthlyData));
        this._clearMonthlyDataCache(); // 清除缓存
        return monthlyData;
    }

    // 导出为CSV格式
    exportToCSV(data, filename) {
        if (!data || data.length === 0) {
            alert('没有数据可导出');
            return;
        }

        let csvContent = '';
        
        // 添加表头 - 使用全中文表头
        const headers = Object.keys(data[0]);
        const chineseHeaders = headers.map(header => this._getChineseHeader(header));
        csvContent += chineseHeaders.join(',') + '\n';
        
        // 添加数据行 - 优化大数据集处理
        const batchSize = 1000; // 分批处理，避免阻塞UI
        let rowIndex = 0;
        
        const processBatch = () => {
            const batchEnd = Math.min(rowIndex + batchSize, data.length);
            for (; rowIndex < batchEnd; rowIndex++) {
                const row = data[rowIndex];
                const values = headers.map(header => {
                    let value = row[header];
                    // 如果值包含逗号或引号，需要特殊处理
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        value = '"' + value.replace(/"/g, '""') + '"';
                    }
                    return value;
                });
                csvContent += values.join(',') + '\n';
            }
            
            if (rowIndex < data.length) {
                // 继续处理下一批
                setTimeout(processBatch, 0);
            } else {
                // 处理完成，创建下载链接
                const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // 释放blob URL
                URL.revokeObjectURL(url);
            }
        };
        
        processBatch();
    }
    
    // 获取中文表头
    _getChineseHeader(englishHeader) {
        const headerMap = {
            'date': '日期',
            'reporter': '上报人',
            'dataCount': '当月数据数量',
            'activeAccounts': '当日账号存活数量',
            'actualData': '当日实际打出数据',
            'replyRate': '回复率 (%)',
            'bannedAccounts': '当日封号数量',
            'restrictedAccounts': '当日限制数量',
            'drainageCount': '当日引流数量',
            'monthlyDrainageTotal': '当月引流总数量',
            'monthlyTotal': '月总计',
            'dailyTotal': '每日总计',
            'name': '姓名',
            'month': '月份',
            'totalDataCount': '总当月数据数量',
            'averageActiveAccounts': '平均账号存活',
            'averageActualData': '平均实际打出数据',
            'averageReplyRate': '平均回复率 (%)',
            'averageBannedAccounts': '平均账号封禁',
            'averageRestrictedAccounts': '平均账号限制',
            'averageDrainageCount': '平均引流数量'
        };
        
        return headerMap[englishHeader] || englishHeader;
    }
    
    // 获取英文表头（与中文表头对应）
    _getEnglishHeader(chineseHeader) {
        const reverseHeaderMap = {
            '日期': 'date',
            '上报人': 'reporter',
            '当月数据数量': 'dataCount',
            '当日账号存活数量': 'activeAccounts',
            '当日实际打出数据': 'actualData',
            '回复率 (%)': 'replyRate',
            '当日封号数量': 'bannedAccounts',
            '当日限制数量': 'restrictedAccounts',
            '当日引流数量': 'drainageCount',
            '当月引流总数量': 'monthlyDrainageTotal',
            '月总计': 'monthlyTotal',
            '每日总计': 'dailyTotal',
            '姓名': 'name',
            '月份': 'month',
            '总当月数据数量': 'totalDataCount',
            '平均账号存活': 'averageActiveAccounts',
            '平均实际打出数据': 'averageActualData',
            '平均回复率 (%)': 'averageReplyRate',
            '平均账号封禁': 'averageBannedAccounts',
            '平均账号限制': 'averageRestrictedAccounts',
            '平均引流数量': 'averageDrainageCount'
        };
        
        return reverseHeaderMap[chineseHeader] || chineseHeader;
    }

    _hasExcelLibrary() {
        return typeof XLSX !== 'undefined' && XLSX && XLSX.utils;
    }

    _getExcelLibraryErrorMessage() {
        return 'Excel处理库未加载，请检查网络连接或改为本地引入 SheetJS 文件。';
    }

    _showExcelLibraryError() {
        alert(this._getExcelLibraryErrorMessage());
    }
    
    // 根据自定义排序导出Excel
    exportToExcelWithCustomOrder(data, filename, customOrder, dataType) {
        if (!data || data.length === 0) {
            alert('没有数据可导出');
            return;
        }

        if (!this._hasExcelLibrary()) {
            this._showExcelLibraryError();
            return;
        }

        let mappedData;
        
        if (dataType === 'daily') {
            // 计算每个成员每个月的引流总数，保持与日数据表展示一致
            const monthlyDrainageMap = new Map();
            for (const item of data) {
                const date = new Date(item.date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const compositeKey = `${monthKey}_${item.reporter}`;
                
                if (!monthlyDrainageMap.has(compositeKey)) {
                    monthlyDrainageMap.set(compositeKey, 0);
                }
                
                monthlyDrainageMap.set(compositeKey, monthlyDrainageMap.get(compositeKey) + (Number(item.drainageCount) || 0));
            }
            
            // 为每条记录添加当月引流总数量
            const processedData = data.map(item => {
                const date = new Date(item.date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const compositeKey = `${monthKey}_${item.reporter}`;
                return {
                    ...item,
                    monthlyDrainageTotal: monthlyDrainageMap.get(compositeKey)
                };
            });
            
            // 根据自定义排序映射数据
            mappedData = processedData.map(item => {
                const mappedItem = {};
                customOrder.forEach(field => {
                    const chineseKey = this._getChineseHeader(field);
                    mappedItem[chineseKey] = item[field];
                });
                return mappedItem;
            });
        } else if (dataType === 'monthly') {
            // 根据自定义排序映射月数据
            mappedData = data.map(item => {
                const mappedItem = {};
                customOrder.forEach(field => {
                    const chineseKey = this._getChineseHeader(field);
                    mappedItem[chineseKey] = item[field];
                });
                return mappedItem;
            });
        } else {
            // 默认行为：使用完整数据映射
            mappedData = data.map(item => {
                const mappedItem = {};
                for (const [key, value] of Object.entries(item)) {
                    const chineseKey = this._getChineseHeader(key);
                    mappedItem[chineseKey] = value;
                }
                return mappedItem;
            });
        }
        
        const ws = XLSX.utils.json_to_sheet(mappedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        
        // 导出文件
        XLSX.writeFile(wb, filename);
    }

    // 导出为JSON格式
    exportToJSON(data, filename) {
        if (!data) {
            alert('没有数据可导出');
            return;
        }

        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 释放blob URL
        URL.revokeObjectURL(url);
    }
    
    // 导出日数据为Excel格式，包含中文表头和指定的数据列
    exportDailyDataToExcel(data, filename) {
        if (!data || data.length === 0) {
            alert('没有数据可导出');
            return;
        }

        if (!this._hasExcelLibrary()) {
            this._showExcelLibraryError();
            return;
        }

        // 计算每个成员每个月的引流总数
        const monthlyDrainageMap = new Map();
        for (const item of data) {
            const date = new Date(item.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const compositeKey = `${monthKey}_${item.reporter}`;
            
            if (!monthlyDrainageMap.has(compositeKey)) {
                monthlyDrainageMap.set(compositeKey, 0);
            }
            
            monthlyDrainageMap.set(compositeKey, monthlyDrainageMap.get(compositeKey) + (Number(item.drainageCount) || 0));
        }
        
        // 为每条记录添加当月引流总数量
        const processedData = data.map(item => {
            const date = new Date(item.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const compositeKey = `${monthKey}_${item.reporter}`;
            return {
                ...item,
                monthlyDrainageTotal: monthlyDrainageMap.get(compositeKey)
            };
        });
        
        // 重新映射数据以符合要求的列顺序
        const mappedData = processedData.map(item => ({
            '姓名': item.reporter,
            '当日实际打出数据': item.actualData,
            '当日引流数量': item.drainageCount,
            '当月引流数量': item.monthlyDrainageTotal,
            '当日账号存活数量': item.activeAccounts,
            '当日封号数量': item.bannedAccounts,
            '当日限制数量': item.restrictedAccounts
        }));
        
        // 使用映射后的数据创建工作表
        const ws = XLSX.utils.json_to_sheet(mappedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        
        // 导出文件
        XLSX.writeFile(wb, filename);
    }
    
    // 导出成员数据为Excel格式，只包含姓名
    exportMembersToExcel(data, filename) {
        if (!data || data.length === 0) {
            alert('没有数据可导出');
            return;
        }

        if (!this._hasExcelLibrary()) {
            this._showExcelLibraryError();
            return;
        }

        const mappedData = data.map(item => ({
            '姓名': item.name
        }));
        
        const ws = XLSX.utils.json_to_sheet(mappedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        
        // 导出文件
        XLSX.writeFile(wb, filename);
    }
    
    exportToExcel(data, filename) {
        if (!data || data.length === 0) {
            alert('没有数据可导出');
            return;
        }

        if (!this._hasExcelLibrary()) {
            this._showExcelLibraryError();
            return;
        }

        // 如果是成员数据，使用专门的成员导出方法
        if (filename.includes('member') || filename.includes('成员')) {
            this.exportMembersToExcel(data, filename);
            return;
        }

        // 如果是日数据，使用专门的日数据导出方法
        if (filename.includes('daily') || filename.includes('日数据')) {
            this.exportDailyDataToExcel(data, filename);
            return;
        }

        // 对于其他类型的数据，使用默认方式，但转换为中文表头
        const mappedData = data.map(item => {
            const mappedItem = {};
            for (const [key, value] of Object.entries(item)) {
                const chineseKey = this._getChineseHeader(key);
                mappedItem[chineseKey] = value;
            }
            return mappedItem;
        });
        
        const ws = XLSX.utils.json_to_sheet(mappedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        
        // 导出文件
        XLSX.writeFile(wb, filename);
    }
    
    _readFileAsArrayBuffer(file) {
        if (file instanceof ArrayBuffer) {
            return Promise.resolve(file);
        }

        if (ArrayBuffer.isView(file)) {
            return Promise.resolve(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
        }

        if (file && typeof file.arrayBuffer === 'function') {
            return file.arrayBuffer();
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            
            reader.onerror = () => {
                reject(new Error('读取文件失败'));
            };
            
            reader.readAsArrayBuffer(file);
        });
    }

    async _readWorkbook(file) {
        if (!this._hasExcelLibrary()) {
            throw new Error(this._getExcelLibraryErrorMessage());
        }

        const buffer = await this._readFileAsArrayBuffer(file);
        const data = new Uint8Array(buffer);
        return XLSX.read(data, { type: 'array', cellDates: true });
    }

    _normalizeDateValue(value) {
        if (value instanceof Date) {
            return value.toISOString().slice(0, 10);
        }

        if (typeof value === 'number' && Number.isFinite(value)) {
            const excelEpoch = Date.UTC(1899, 11, 30);
            return new Date(excelEpoch + value * 86400000).toISOString().slice(0, 10);
        }

        const text = String(value || '').trim();
        const match = text.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
        if (match) {
            return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
        }

        return text;
    }

    _normalizeImportedRow(row, dataType) {
        const normalized = {};

        for (const [key, value] of Object.entries(row)) {
            let englishKey = this._getEnglishHeader(String(key).trim());
            if (dataType === 'daily' && englishKey === 'name') {
                englishKey = 'reporter';
            }
            normalized[englishKey] = value;
        }

        if (dataType === 'daily') {
            const numericFields = ['activeAccounts', 'actualData', 'replyRate', 'bannedAccounts', 'restrictedAccounts', 'drainageCount'];
            normalized.date = this._normalizeDateValue(normalized.date);
            if (normalized.reporter !== undefined) {
                normalized.reporter = String(normalized.reporter).trim();
            }
            numericFields.forEach(field => {
                if (normalized[field] !== undefined && normalized[field] !== '') {
                    normalized[field] = Number(normalized[field]);
                }
            });
        } else if (dataType === 'monthly') {
            const numericFields = ['totalDataCount', 'averageActiveAccounts', 'averageActualData', 'averageReplyRate', 'averageBannedAccounts', 'averageRestrictedAccounts', 'averageDrainageCount'];
            if (normalized.month !== undefined) {
                normalized.month = String(normalized.month).trim();
            }
            if (normalized.reporter !== undefined) {
                normalized.reporter = String(normalized.reporter).trim();
            }
            numericFields.forEach(field => {
                if (normalized[field] !== undefined && normalized[field] !== '') {
                    normalized[field] = Number(normalized[field]);
                }
            });
        } else if (dataType === 'members' && normalized.name !== undefined) {
            normalized.name = String(normalized.name).trim();
        }

        return normalized;
    }

    _hasRequiredFields(row, requiredFields) {
        return requiredFields.every(field => row[field] !== undefined && row[field] !== null && row[field] !== '');
    }

    _filterValidRows(jsonData, dataType) {
        const requiredFieldsMap = {
            daily: ['date', 'reporter', 'activeAccounts', 'actualData', 'replyRate', 'bannedAccounts', 'restrictedAccounts', 'drainageCount'],
            monthly: ['month', 'reporter', 'totalDataCount'],
            members: ['name']
        };
        const requiredFields = requiredFieldsMap[dataType];
        const normalizedData = jsonData.map(row => this._normalizeImportedRow(row, dataType));

        if (!requiredFields) {
            return normalizedData;
        }

        return normalizedData.filter(row => this._hasRequiredFields(row, requiredFields));
    }

    // 从Excel导入数据
    async importFromExcel(file, dataType) {
        try {
            const workbook = await this._readWorkbook(file);
            
            // 获取第一个工作表
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // 将工作表转换为JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            const validData = this._filterValidRows(jsonData, dataType);
            
            if (validData.length !== jsonData.length) {
                console.warn(`导入了${validData.length}条有效数据，跳过了${jsonData.length - validData.length}条无效数据`);
            }
            
            return validData;
        } catch (error) {
            throw error;
        }
    }
    
    // 从Excel加载所有数据（日数据、月数据和成员数据）
    async loadFromExcel(file) {
        const workbook = await this._readWorkbook(file);
        
        const result = {
            dailyData: [],
            monthlyData: [],
            membersData: []
        };
        
        // 检查工作表名称
        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            const normalizedSheetName = sheetName.toLowerCase();
            
            if (normalizedSheetName.includes('日数据') || normalizedSheetName.includes('daily')) {
                result.dailyData = this._filterValidRows(jsonData, 'daily');
            } else if (normalizedSheetName.includes('月数据') || normalizedSheetName.includes('monthly')) {
                result.monthlyData = this._filterValidRows(jsonData, 'monthly');
            } else if (normalizedSheetName.includes('成员') || normalizedSheetName.includes('member')) {
                result.membersData = this._filterValidRows(jsonData, 'members');
            }
        }
        
        return result;
    }
    
    // 保存所有数据到Excel
    saveAllToExcel(dailyData, monthlyData, membersData) {
        if (!this._hasExcelLibrary()) {
            this._showExcelLibraryError();
            return;
        }

        // 创建工作簿
        const wb = XLSX.utils.book_new();
        
        // 添加日数据工作表
        if (dailyData && dailyData.length > 0) {
            // 将日数据转换为中文表头
            const dailyMappedData = dailyData.map(item => {
                const mappedItem = {};
                for (const [key, value] of Object.entries(item)) {
                    const chineseKey = this._getChineseHeader(key);
                    mappedItem[chineseKey] = value;
                }
                return mappedItem;
            });
            const dailyWS = XLSX.utils.json_to_sheet(dailyMappedData);
            XLSX.utils.book_append_sheet(wb, dailyWS, "日数据");
        }
        
        // 添加月数据工作表
        if (monthlyData && monthlyData.length > 0) {
            // 将月数据转换为中文表头
            const monthlyMappedData = monthlyData.map(item => {
                const mappedItem = {};
                for (const [key, value] of Object.entries(item)) {
                    const chineseKey = this._getChineseHeader(key);
                    mappedItem[chineseKey] = value;
                }
                return mappedItem;
            });
            const monthlyWS = XLSX.utils.json_to_sheet(monthlyMappedData);
            XLSX.utils.book_append_sheet(wb, monthlyWS, "月数据");
        }
        
        // 添加成员数据工作表 - 只包含姓名
        if (membersData && membersData.length > 0) {
            const membersMappedData = membersData.map(item => ({ '姓名': item.name }));
            const membersWS = XLSX.utils.json_to_sheet(membersMappedData);
            XLSX.utils.book_append_sheet(wb, membersWS, "成员数据");
        }
        
        // 生成文件名（包含当前时间）
        const now = new Date();
        const fileName = `数据_${now.getFullYear()}${String(now.getMonth()+1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.xlsx`;
        
        // 导出文件
        XLSX.writeFile(wb, fileName);
    }
}
