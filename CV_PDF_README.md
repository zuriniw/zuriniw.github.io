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

## 📊 技术细节

1. **预处理**: 将HTML结构转换为LaTeX友好格式
2. **模板**: 9pt字体，0.75in边距，无标题编号
3. **缩进**: 机构下内容自动缩进4空格
4. **清理**: 自动删除临时处理文件

## 🐛 故障排除

**PDF生成失败**:
```bash
# 检查依赖
pandoc --version
xelatex --version

# 手动测试
pandoc cv.md -o test.pdf --pdf-engine=xelatex
```

**格式问题**: 检查 `cv.md` 中的 `<dl><dt><dd>` 结构是否正确
