# EduLink 作品代码交付副本

整理日期：2026-09-14。正式前端目录：`EduLink-backend-handoff-2026-09-06`。

本目录只包含最新版本的运行源码和必要静态界面资源。已排除知识库、教材正文、参考文献、用户记录、上传文件、模型权重、日志、测试脚本及项目开发过程中使用的转换、同步、迁移和打包脚本。模型密钥、服务访问令牌、临时公网地址及开发机绝对路径均未写入交付副本。

## 运行源码

- `api_server.py`：FastAPI 后端入口和四大模块接口。
- `lesson_plan.py`、`lesson_visuals.py`：六艺备课、板书匹配和图片任务。
- `classroom_observation.py`、`funasr_worker.py`：课堂观察与本地语音识别。
- `teaching_reflection.py`：教学反思诊断和成果生成。
- `theory_training.py`、`theory_chat_history.py`、`theory_references.py`：专项训练、对话历史和参考文献下载。
- `rag/`：BM25 检索、知识分块和流式问答。`build_chunks.py` 是运行时缺少分块索引时的直接依赖，因此保留。
- `model_config.py`：仅从环境变量读取模型配置，不包含 API Key。
- `EduLink-backend-handoff-2026-09-06/`：最新前端源码，包含课堂观察总览的最新布局修复。

不在本目录中的 `.py` 文件均属于测试、数据转换、前端数据同步、资料规范化或打包流程，不是应用运行依赖。

## 前端预览

```powershell
python run_local.py --frontend-only
```

打开 `http://127.0.0.1:5500`。由于数据库被排除，理论目录、案例和教材资源只显示空数据或占位封面。

## 补齐数据后运行

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item config/local.env.example config/local.env
```

在 `config/local.env` 中填写自己的 `DEEPSEEK_API_KEY` 与随机生成的 `RAG_API_TOKEN`，再按《数据补齐清单》恢复业务数据：

```powershell
.\.venv\Scripts\python.exe run_local.py
```

`config/local.env` 已列入 `.gitignore`，不要提交到 GitHub。FunASR 建议使用独立 Python 环境，模型权重首次使用时由其上游服务下载。

## 检查

```powershell
python verify_delivery.py
```

该检查不调用外部 API，只检查凭据样式、数据库或语料文件、开发脚本以及 Python 语法。`delivery-manifest.json` 记录交付文件的相对路径、大小和 SHA-256。
