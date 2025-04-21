# MinIO文件上传系统

基于Spring Boot和React实现的文件上传系统，使用MinIO作为对象存储服务。

## 功能特点

- 支持普通文件上传
- 支持大文件分片上传
- 文件在线预览
- 文件列表展示
- 文件删除

## 技术栈

### 后端

- Java 11
- Spring Boot 2.7.5
- MinIO Java SDK
- Lombok

### 前端

- React 18
- Ant Design
- Axios
- SparkMD5 (用于计算文件MD5)

## 项目结构

```
.
├── docker-compose.yml           # Docker Compose配置
├── Dockerfile-backend           # 后端Docker构建文件
├── frontend/                    # 前端代码
│   ├── Dockerfile-frontend      # 前端Docker构建文件
│   ├── nginx.conf               # Nginx配置文件
│   ├── package.json             # 前端依赖配置
│   ├── public/                  # 静态资源
│   └── src/                     # 前端源代码
│       ├── App.js               # 主应用组件
│       ├── components/          # 组件
│       │   ├── FileList.js      # 文件列表组件
│       │   └── FileUpload.js    # 文件上传组件
│       └── utils/               # 工具类
│           └── api.js           # API调用封装
└── src/                         # 后端源代码
    └── main/
        ├── java/com/example/minio/
        │   ├── MinioFileUploadApplication.java  # 应用入口
        │   ├── config/          # 配置类
        │   │   └── MinioConfig.java
        │   ├── controller/      # 控制器
        │   │   └── FileController.java
        │   └── service/         # 服务
        │       ├── MinioService.java
        │       └── impl/
        │           └── MinioServiceImpl.java
        └── resources/
            ├── application.yml          # 应用配置
            └── application-docker.yml   # Docker环境配置
```

## 部署运行

### 方式一：使用Docker Compose (推荐)

1. 确保已安装Docker和Docker Compose
2. 克隆项目到本地
3. 在项目根目录执行：

```bash
docker-compose up -d
```

4. 访问服务：
   - 前端界面：http://localhost:3000
   - MinIO控制台：http://localhost:9001 (用户名/密码：minioadmin/minioadmin)

### 方式二：本地开发环境

#### 后端

1. 确保已安装Java 11和Maven
2. 确保MinIO服务已启动，可以使用如下命令：

```bash
docker run -d -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
```

3. 在项目根目录执行：

```bash
mvn spring-boot:run
```

#### 前端

1. 确保已安装Node.js
2. 进入frontend目录
3. 安装依赖：

```bash
npm install
```

4. 启动开发服务器：

```bash
npm start
```

5. 访问 http://localhost:3000

## 使用说明

### 上传文件

1. 点击或拖拽文件到上传区域
2. 小文件可以选择"普通上传"模式
3. 大文件推荐使用"分片上传"模式

### 查看和管理文件

在文件列表中可以：
- 预览文件（支持图片文件直接在线预览）
- 下载文件
- 删除文件

## 许可证

MIT 
=======
# Minio-uploadfiles
MInio实现大文件和图片分片上传功能
