# CV PDF 

## 🚀 快速使用

```bash
# 生成 PDF
./scripts/build_cv_pdf.sh

# 或使用 npm
npm run build:cv
```

生成的PDF将保存在 `data/cv.pdf`，并可通过网站下载。

## 📁 文件结构

```
scripts/
├── build_cv_pdf.sh                    # 主构建脚本
├── preprocess_cv.sh                   # Markdown预处理
└── pandoc_cv_template_simple.tex      # LaTeX模板

data/
├── cv.pdf                            # 生成的PDF
└── cv_template.tex                   # 原始模板（参考）

cv.html                               # 网页版CV（含下载按钮）
cv.md                                 # Markdown源文件
```

## 🔧 系统要求

- **pandoc** (`brew install pandoc`)
- **XeLaTeX** (`brew install --cask mactex`)
