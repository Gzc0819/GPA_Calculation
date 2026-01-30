# 导入Flask框架及相关模块
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS  # 处理跨域请求

# 创建Flask应用实例
app = Flask(__name__)
# 启用CORS，允许前端跨域访问
CORS(app)

# 根路由：返回前端主页面
@app.route('/')
def index():
    # 从当前目录发送index.html文件
    return send_from_directory('.', 'index.html')

# 静态文件路由：处理CSS、JS等静态资源
@app.route('/<path:path>')
def serve_static(path):
    # 从当前目录发送请求的静态文件
    return send_from_directory('.', path)

# API路由：处理GPA计算请求，仅接受POST方法
@app.route('/api/calculate', methods=['POST'])
def calculate_gpa():
    try:
        # 获取POST请求中的JSON数据
        data = request.get_json()
        # 提取课程数据，默认为空列表
        courses = data.get('courses', [])
        
        # 验证是否有课程数据
        if not courses:
            return jsonify({'error': '没有课程数据'}), 400  # 400错误：请求数据错误
        
        # 初始化变量
        total_credits = 0  # 总学分
        total_grade_points = 0  # 总绩点
        total_weighted_score = 0  # 总加权分数
        
        # 遍历所有课程
        for course in courses:
            # 获取课程学分和分数，默认为0
            credits = course.get('credits', 0)
            score = course.get('score', 0)
            
            # 累加总学分
            total_credits += credits
            
            # 将分数转换为绩点
            grade_point = score_to_grade_point(score)
            # 计算加权绩点并累加
            total_grade_points += credits * grade_point
            
            # 计算加权分数并累加
            total_weighted_score += credits * score
        
        # 验证总学分是否为0
        if total_credits == 0:
            return jsonify({'error': '总学分为0'}), 400  # 400错误：请求数据错误
        
        # 计算GPA（平均学分绩点）
        gpa = total_grade_points / total_credits
        # 计算加权平均分
        weighted_average = total_weighted_score / total_credits
        
        # 返回计算结果
        return jsonify({
            'gpa': gpa,  # 平均学分绩点
            'weightedAverage': weighted_average,  # 加权平均分
            'totalCredits': total_credits  # 总学分
        })
    
    except Exception as e:
        # 捕获所有异常，返回500错误
        return jsonify({'error': str(e)}), 500  # 500错误：服务器内部错误

# 分数转换为绩点的函数
# 规则：90分以上=4.0，60-89分=1.0+(分数-60)*0.1，60分以下=0.0
def score_to_grade_point(score):
    if score >= 90:
        return 4.0
    elif score >= 60:
        return 1.0 + (score - 60) * 0.1
    else:
        return 0.0

# 主函数：启动Flask服务器
if __name__ == '__main__':
    # debug=True：开启调试模式，便于开发
    # port=5000：指定端口为5000
    app.run(debug=True, port=5000)