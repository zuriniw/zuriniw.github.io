#!/bin/bash

# 预处理CV Markdown，将<dl><dt><dd>转换为更适合LaTeX的格式
# 输入: cv.md
# 输出: 临时处理后的markdown文件

INPUT_FILE="$1"
OUTPUT_FILE="$2"

# 检查输入文件
if [ ! -f "$INPUT_FILE" ]; then
    echo "错误: 输入文件 $INPUT_FILE 不存在"
    exit 1
fi

# 直接用awk处理，更好地控制跨行逻辑
sed -E '
# 移除行尾的硬换行双空格（导致松散列表的罪魁祸首）
s|[[:space:]]+$||g

# 移除<dl>和</dl>标签
s|<dl>||g
s|</dl>||g

# 转换下划线标签为LaTeX命令
s|<u>([^<]+)</u>|\\underline{\1}|g
' "$INPUT_FILE" | awk '
BEGIN { 
    indent_mode = 0
    consecutive_blanks = 0
    dt_content = ""
    in_dt = 0
}

# 处理<dt>标签 - 记录内容，等待可能的<dd>
/^[[:space:]]*<dt>([^<]+)<\/dt>[[:space:]]*$/ {
    dt_content = $0
    gsub(/^[[:space:]]*<dt>/, "", dt_content)
    gsub(/<\/dt>[[:space:]]*$/, "", dt_content)
    in_dt = 1
    next
}

# 处理<dd>标签 - 如果前面有<dt>，组合输出
/^[[:space:]]*<dd>([^<]+)<\/dd>[[:space:]]*$/ {
    if (in_dt == 1) {
        # 有配对的dt，输出机构+日期格式（无额外空行）
        dd_content = $0
        gsub(/^[[:space:]]*<dd>/, "", dd_content)
        gsub(/<\/dd>[[:space:]]*$/, "", dd_content)
        print "\n**" dt_content "** \\hfill " dd_content
        # 直接进入缩进模式
        indent_mode = 1
        print ""
        in_dt = 0
        dt_content = ""
    } else {
        # 单独的dd，直接处理
        dd_content = $0
        gsub(/^[[:space:]]*<dd>/, "", dd_content)
        gsub(/<\/dd>[[:space:]]*$/, "", dd_content)
        print " \\hfill " dd_content
        # 直接进入缩进模式
        indent_mode = 1
        print ""
    }
    next
}

# 如果遇到其他内容但还有未处理的dt，输出单独的dt（需要空行）
in_dt == 1 && !/^[[:space:]]*$/ && !/^[[:space:]]*<dd>/ {
    print "\n**" dt_content "**"
    print ""  # 添加空行
    in_dt = 0
    dt_content = ""
    # 继续处理当前行
}


# 处理独立的**标题**行（不包含\hfill的，即非机构+日期格式）
/^(\*\*.*\*\*)$/ && !/\\hfill/ {
    if (indent_mode == 1) {
        indent_mode = 0
        print ""
    }
    print $0
    print ""  # 在独立标题后添加空行
    consecutive_blanks = 1
    next
}

# 碰到新机构/新章节时，结束 bullet 块
/^(\*\*.*\*\*)$/ || /^## / {
    if (indent_mode == 1) {
        indent_mode = 0
        last_blank = 0
        print ""
    }
    print $0
    next
}

# 处理<br>标签 - 结束bullet块，不输出额外空行
/^<br>$/ {
    if (indent_mode == 1) {
        indent_mode = 0
    }
    consecutive_blanks = 0  # 重置空行计数
    next  # 不输出<br>本身
}

# 全局空行处理 - 限制连续空行数量
/^[[:space:]]*$/ {
    consecutive_blanks++
    if (consecutive_blanks <= 1) {
        print $0
    }
    next
}

# 非空行重置计数器
{
    consecutive_blanks = 0
}

# 在 bullet 块内：
indent_mode == 1 {

    if ($0 ~ /^[ ]{2,}- /) {
        # 已有嵌套二级列表，原样输出
        print $0
    } else if ($0 ~ /^- /) {
        # 已是一级列表，原样输出
        print $0
    } else if ($0 ~ /^\\/ || $0 ~ /\\hfill/) {
        # LaTeX 指令行或包含\hfill的行，直接输出不加bullet
        print $0
    } else {
        # 普通文本：前缀为一级 bullet
        print "- " $0
    }
    next
}

# 其他情况，原样输出
{
    print $0
}
' > "$OUTPUT_FILE"

echo "预处理完成: $INPUT_FILE -> $OUTPUT_FILE"
echo "预处理完成: $INPUT_FILE -> $OUTPUT_FILE"