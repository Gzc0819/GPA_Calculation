// 全局变量
let courses = []; // 存储课程数据的数组
let currentEditId = null; // 当前正在编辑的课程ID，null表示非编辑状态

// 事件监听器
// 为添加/更新按钮添加点击事件
// 根据currentEditId状态决定是添加新课程还是更新现有课程
document.getElementById('addCourse').addEventListener('click', function() {
    if (currentEditId) {
        updateCourse(); // 如果是编辑状态，执行更新操作
    } else {
        addCourse(); // 如果是非编辑状态，执行添加操作
    }
});

// 为计算按钮添加点击事件
document.getElementById('calculateGPA').addEventListener('click', calculateGPA);

/**
 * 添加新课程
 * 功能：获取表单数据，验证，创建课程对象，添加到数组，渲染列表，清空表单
 */
function addCourse() {
    // 获取表单输入值
    const courseName = document.getElementById('courseName').value.trim();
    const credits = parseFloat(document.getElementById('credits').value);
    const score = parseFloat(document.getElementById('score').value);

    // 验证输入
    if (!courseName || isNaN(credits) || isNaN(score)) {
        alert('请填写完整的课程信息');
        return;
    }

    if (credits <= 0) {
        alert('学分必须大于0');
        return;
    }

    if (score < 0 || score > 100) {
        alert('分数必须在0-100之间');
        return;
    }

    // 创建课程对象
    const course = {
        id: Date.now(), // 使用时间戳作为唯一ID
        name: courseName,
        credits: credits,
        score: score
    };

    // 添加到课程数组
    courses.push(course);
    // 重新渲染课程列表
    renderCourseList();
    // 清空表单
    clearInputs();
}

/**
 * 删除课程
 * 功能：从课程数组中移除指定ID的课程，重新渲染列表
 * @param {number} id - 要删除的课程ID
 */
function deleteCourse(id) {
    // 检查是否删除的是正在编辑的课程
    if (id === currentEditId) {
        alert('正在编辑的课程不能删除');
        return;
    }
    
    // 使用filter方法过滤掉要删除的课程
    courses = courses.filter(course => course.id !== id);
    // 重新渲染课程列表
    renderCourseList();
}

/**
 * 编辑课程
 * 功能：根据课程ID获取课程信息，填充到表单，进入编辑状态
 * @param {number} id - 要编辑的课程ID
 */
function editCourse(id) {
    // 查找要编辑的课程
    const course = courses.find(course => course.id === id);
    if (course) {
        // 填充表单
        document.getElementById('courseName').value = course.name;
        document.getElementById('credits').value = course.credits;
        document.getElementById('score').value = course.score;
        // 设置当前编辑ID
        currentEditId = id;
        // 更改按钮文本
        document.getElementById('addCourse').textContent = '更新课程';
    }
}

/**
 * 更新课程
 * 功能：获取表单数据，验证，更新课程信息，重新渲染列表，退出编辑状态
 */
function updateCourse() {
    // 获取表单输入值
    const courseName = document.getElementById('courseName').value.trim();
    const credits = parseFloat(document.getElementById('credits').value);
    const score = parseFloat(document.getElementById('score').value);

    // 验证输入
    if (!courseName || isNaN(credits) || isNaN(score)) {
        alert('请填写完整的课程信息');
        return;
    }

    if (credits <= 0) {
        alert('学分必须大于0');
        return;
    }

    if (score < 0 || score > 100) {
        alert('分数必须在0-100之间');
        return;
    }

    // 查找要更新的课程索引
    const index = courses.findIndex(course => course.id === currentEditId);
    if (index !== -1) {
        // 更新课程信息
        courses[index] = {
            id: currentEditId,
            name: courseName,
            credits: credits,
            score: score
        };
        // 重新渲染课程列表
        renderCourseList();
        // 清空表单
        clearInputs();
        // 退出编辑状态
        currentEditId = null;
        // 恢复按钮文本
        document.getElementById('addCourse').textContent = '添加课程';
    }
}

/**
 * 渲染课程列表
 * 功能：根据courses数组动态生成表格行
 */
function renderCourseList() {
    // 获取表格 tbody 元素
    const tbody = document.getElementById('courseTableBody');
    // 清空现有内容
    tbody.innerHTML = '';

    // 遍历课程数组，为每个课程创建一行
    courses.forEach(course => {
        const row = document.createElement('tr');
        // 设置行内容，包含课程信息和操作按钮
        row.innerHTML = `
            <td>${course.name}</td>
            <td>${course.credits}</td>
            <td>${course.score}</td>
            <td>
                <button class="edit-btn" onclick="editCourse(${course.id})">修改</button>
                <button class="delete-btn" onclick="deleteCourse(${course.id})">删除</button>
            </td>
        `;
        // 添加到表格
        tbody.appendChild(row);
    });
}

/**
 * 清空表单
 * 功能：将所有输入框的值设为空
 */
function clearInputs() {
    document.getElementById('courseName').value = '';
    document.getElementById('credits').value = '';
    document.getElementById('score').value = '';
}

/**
 * 计算GPA
 * 功能：将课程数据发送到后端，获取计算结果并显示
 */
async function calculateGPA() {
    // 检查是否有课程数据
    if (courses.length === 0) {
        alert('请先添加课程');
        return;
    }

    try {
        // 发送POST请求到后端API
        const response = await fetch('http://localhost:5000/api/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // 设置请求头
            },
            body: JSON.stringify({ courses: courses }) // 发送课程数据
        });

        // 检查响应状态
        if (!response.ok) {
            throw new Error('计算失败');
        }

        // 解析响应数据
        const data = await response.json();
        // 显示计算结果
        displayResult(data.gpa, data.weightedAverage, data.totalCredits);
    } catch (error) {
        // 捕获错误
        console.error('Error:', error);
        alert('计算GPA时出错，请确保后端服务器正在运行');
    }
}

/**
 * 显示计算结果
 * 功能：将计算结果显示在结果区域
 * @param {number} gpa - 平均学分绩点
 * @param {number} weightedAverage - 加权平均分
 * @param {number} totalCredits - 总学分
 */
function displayResult(gpa, weightedAverage, totalCredits) {
    // 获取结果显示容器
    const resultDiv = document.getElementById('result');
    // 设置结果内容
    resultDiv.innerHTML = `
        <div>您的 GPA: ${gpa.toFixed(2)}</div>
        <div style="font-size: 0.8em; margin-top: 10px; color: #667eea;">加权平均分: ${weightedAverage.toFixed(2)}</div>
        <div style="font-size: 0.6em; margin-top: 10px; color: #666;">总学分: ${totalCredits}</div>
    `;
    // 添加show类，显示结果（带动画效果）
    resultDiv.classList.add('show');
}