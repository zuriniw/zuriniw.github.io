#!/bin/bash

# CV PDF 构建脚本
# 使用 pandoc 将 Markdown CV 转换为 PDF

# 检查依赖
if ! command -v pandoc &> /dev/null; then
    echo "错误: pandoc 未安装。请先安装 pandoc:"
    echo "macOS: brew install pandoc"
    echo "Ubuntu: sudo apt install pandoc"
    exit 1
fi

# 设置路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CV_MD="$PROJECT_ROOT/cv.md"
CV_PDF="$PROJECT_ROOT/data/CV_Ziru_Wei.pdf"
LATEX_TEMPLATE="$PROJECT_ROOT/scripts/cv_template.tex"

echo "开始构建 CV PDF..."

# 检查源文件是否存在
if [ ! -f "$CV_MD" ]; then
    echo "错误: 找不到 cv.md 文件"
    exit 1
fi

# 创建 data 目录（如果不存在）
mkdir -p "$PROJECT_ROOT/data"

# 设置模板和预处理文件路径
TEMPLATE="$SCRIPT_DIR/pandoc_cv_template_simple.tex"
PREPROCESSED_CV="$PROJECT_ROOT/data/cv_preprocessed.md"

# 预处理CV markdown文件
echo "预处理CV markdown文件..."
"$SCRIPT_DIR/preprocess_cv.sh" "$CV_MD" "$PREPROCESSED_CV"

# 生成PDF
if [ -f "$TEMPLATE" ]; then
    echo "使用自定义模板生成PDF: $TEMPLATE"
    pandoc "$PREPROCESSED_CV" \
        --from=markdown+raw_html \
        --template="$TEMPLATE" \
        --pdf-engine=lualatex \
        --metadata=title:"Ziru Wei - CV" \
        -o "$CV_PDF"
else
    echo "模板文件不存在，使用默认设置"
    pandoc "$PREPROCESSED_CV" \
        --pdf-engine=lualatex \
        --variable=geometry:margin=0.75in \
        --variable=fontsize=9pt \
        --variable=documentclass=extarticle \
        --variable=colorlinks=true \
        --variable=linkcolor=blue \
        --variable=urlcolor=blue \
        --variable=author="Ziru Wei" \
        --variable=title="Ziru Wei" \
        --metadata=title:"Ziru Wei - CV" \
        -o "$CV_PDF"
fi

if [ $? -eq 0 ]; then
    echo "✅ CV PDF 构建成功: $CV_PDF"
    echo "📄 文件大小: $(du -h "$CV_PDF" | cut -f1)"
    
    # 保留预处理文件供检查
    if [ -f "$PREPROCESSED_CV" ]; then
        echo "📝 预处理后的文件已保留: $PREPROCESSED_CV"
    fi
else
    echo "❌ CV PDF 构建失败"
    # 清理临时文件（即使失败也要清理）
    if [ -f "$PREPROCESSED_CV" ]; then
        rm "$PREPROCESSED_CV"
    fi
    exit 1
fi
