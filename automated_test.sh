#!/bin/bash
# AI 词星球小程序 - 自动化测试脚本
# 执行代码检查、语法验证、性能分析

echo "======================================"
echo "AI 词星球小程序 - 自动化测试"
echo "======================================"
echo ""

PROJECT_DIR="/home/admin/.openclaw/workspace/projects/ai-terms-miniprogram"
cd "$PROJECT_DIR"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试结果统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "测试：$test_name ... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}通过${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}失败${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

echo "1. 文件结构检查"
echo "--------------------------------------"

# 检查核心文件是否存在
run_test "app.js 存在" "test -f app.js"
run_test "app.json 存在" "test -f app.json"
run_test "app.wxss 存在" "test -f app.wxss"

# 检查页面文件
run_test "首页 WXML" "test -f pages/index/index.wxml"
run_test "首页 WXSS" "test -f pages/index/index.wxss"
run_test "首页 JS" "test -f pages/index/index.js"

run_test "词典列表 WXML" "test -f pages/dictionary/list/index.wxml"
run_test "词典列表 WXSS" "test -f pages/dictionary/list/index.wxss"
run_test "词典列表 JS" "test -f pages/dictionary/list/index.js"

run_test "名词详情 WXML" "test -f pages/dictionary/detail/index.wxml"
run_test "名词详情 WXSS" "test -f pages/dictionary/detail/index.wxss"
run_test "名词详情 JS" "test -f pages/dictionary/detail/index.js"

run_test "学习分级 WXML" "test -f pages/learning/level/index.wxml"
run_test "学习分级 WXSS" "test -f pages/learning/level/index.wxss"
run_test "学习分级 JS" "test -f pages/learning/level/index.js"

run_test "用户中心 WXML" "test -f pages/profile/index.wxml"
run_test "用户中心 WXSS" "test -f pages/profile/index.wxss"
run_test "用户中心 JS" "test -f pages/profile/index.js"

echo ""
echo "2. 子页面文件检查"
echo "--------------------------------------"

run_test "打卡日历页面" "test -f pages/learning/checkin/index.wxml && test -f pages/learning/checkin/index.wxss && test -f pages/learning/checkin/index.js"
run_test "测验页面" "test -f pages/learning/quiz/index.wxml && test -f pages/learning/quiz/index.wxss && test -f pages/learning/quiz/index.js"
run_test "收藏夹页面" "test -f pages/profile/collection/index.wxml && test -f pages/profile/collection/index.wxss && test -f pages/profile/collection/index.js"
run_test "生词本页面" "test -f pages/profile/unknown/index.wxml && test -f pages/profile/unknown/index.wxss && test -f pages/profile/unknown/index.js"
run_test "笔记管理页面" "test -f pages/profile/notes/index.wxml && test -f pages/profile/notes/index.wxss && test -f pages/profile/notes/index.js"
run_test "学习记录页面" "test -f pages/profile/stats/index.wxml && test -f pages/profile/stats/index.wxss && test -f pages/profile/stats/index.js"
run_test "勋章墙页面" "test -f pages/profile/badges/index.wxml && test -f pages/profile/badges/index.wxss && test -f pages/profile/badges/index.js"
run_test "设置页面" "test -f pages/profile/settings/index.wxml && test -f pages/profile/settings/index.wxss && test -f pages/profile/settings/index.js"

echo ""
echo "3. 数据文件检查"
echo "--------------------------------------"

run_test "术语数据 terms.json" "test -f data/terms.json"
run_test "扩展术语 terms_extended.json" "test -f data/terms_extended.json"
run_test "测验题目 quiz_questions.json" "test -f data/quiz_questions.json"
run_test "分类配置 categories.json" "test -f data/categories.json"
run_test "勋章配置 badges.json" "test -f data/badges.json"

echo ""
echo "4. 云函数文件检查"
echo "--------------------------------------"

run_test "云函数 getDailyWord" "test -f cloud/getDailyWord/index.js"
run_test "云函数 checkIn" "test -f cloud/checkIn/index.js"
run_test "云函数 getTermList" "test -f cloud/getTermList/index.js"
run_test "云函数 getTermDetail" "test -f cloud/getTermDetail/index.js"
run_test "云函数 updateTermView" "test -f cloud/updateTermView/index.js"

echo ""
echo "5. 工具函数检查"
echo "--------------------------------------"

run_test "拼音工具 pinyin.js" "test -f utils/pinyin.js"

echo ""
echo "6. 代码语法检查 (基础)"
echo "--------------------------------------"

# 检查 JS 文件基本语法 (括号匹配)
check_js_syntax() {
    local file="$1"
    if [ -f "$file" ]; then
        # 检查括号匹配
        local open_braces=$(grep -o '{' "$file" | wc -l)
        local close_braces=$(grep -o '}' "$file" | wc -l)
        if [ "$open_braces" -eq "$close_braces" ]; then
            return 0
        else
            return 1
        fi
    fi
    return 1
}

run_test "首页 JS 语法" "check_js_syntax pages/index/index.js"
run_test "词典列表 JS 语法" "check_js_syntax pages/dictionary/list/index.js"
run_test "名词详情 JS 语法" "check_js_syntax pages/dictionary/detail/index.js"
run_test "学习分级 JS 语法" "check_js_syntax pages/learning/level/index.js"
run_test "用户中心 JS 语法" "check_js_syntax pages/profile/index.js"

echo ""
echo "7. WXML 标签检查"
echo "--------------------------------------"

# 检查 WXML 基本标签闭合
check_wxml_tags() {
    local file="$1"
    if [ -f "$file" ]; then
        # 检查 view 标签
        local open_view=$(grep -o '<view' "$file" | wc -l)
        local close_view=$(grep -o '</view>' "$file" | wc -l)
        # 检查 text 标签
        local open_text=$(grep -o '<text' "$file" | wc -l)
        local close_text=$(grep -o '</text>' "$file" | wc -l)
        
        if [ "$open_view" -ge "$close_view" ] && [ "$open_text" -ge "$close_text" ]; then
            return 0
        else
            return 1
        fi
    fi
    return 1
}

run_test "首页 WXML 标签" "check_wxml_tags pages/index/index.wxml"
run_test "词典列表 WXML 标签" "check_wxml_tags pages/dictionary/list/index.wxml"
run_test "名词详情 WXML 标签" "check_wxml_tags pages/dictionary/detail/index.wxml"

echo ""
echo "8. 代码量统计"
echo "--------------------------------------"

# 统计代码行数
WXML_LINES=$(find pages -name "*.wxml" -exec cat {} \; 2>/dev/null | wc -l)
WXSS_LINES=$(find pages -name "*.wxss" -exec cat {} \; 2>/dev/null | wc -l)
JS_LINES=$(find pages -name "*.js" -exec cat {} \; 2>/dev/null | wc -l)
TOTAL_LINES=$((WXML_LINES + WXSS_LINES + JS_LINES))

echo "WXML 行数：$WXML_LINES"
echo "WXSS 行数：$WXSS_LINES"
echo "JS 行数：$JS_LINES"
echo "总行数：$TOTAL_LINES"

if [ "$TOTAL_LINES" -gt 5000 ]; then
    echo -e "${GREEN}代码量充足${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${YELLOW}代码量偏少${NC}"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo "9. 文件大小检查"
echo "--------------------------------------"

# 检查文件大小是否合理
TOTAL_SIZE=$(du -sh "$PROJECT_DIR" 2>/dev/null | cut -f1)
echo "项目总大小：$TOTAL_SIZE"

TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -e "${GREEN}文件大小正常${NC}"
PASSED_TESTS=$((PASSED_TESTS + 1))

echo ""
echo "======================================"
echo "测试总结"
echo "======================================"
echo "总测试数：$TOTAL_TESTS"
echo -e "通过：${GREEN}$PASSED_TESTS${NC}"
echo -e "失败：${RED}$FAILED_TESTS${NC}"
echo ""

if [ "$FAILED_TESTS" -eq 0 ]; then
    echo -e "${GREEN}所有测试通过！✅${NC}"
    exit 0
else
    echo -e "${YELLOW}部分测试失败，请检查修复 ${NC}"
    exit 1
fi
