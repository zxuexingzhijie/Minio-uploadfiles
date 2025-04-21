import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, message, Modal, Image, Tag, Tooltip, Empty } from 'antd';
import { 
  DownloadOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  FileOutlined,
  PictureOutlined,
  FileZipOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileMarkdownOutlined,
  VideoCameraOutlined,
  SoundOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import axios from 'axios';

const FileList = ({ refreshTrigger }) => {
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // 获取文件列表
  const fetchFileList = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/files/list');
      // 数据处理，添加文件类型
      const files = response.data.map(file => ({
        ...file,
        key: file.fileName,
        type: getFileType(file.fileName),
        size: formatFileSize(file.fileSize)
      }));
      setFileList(files);
    } catch (error) {
      console.error('获取文件列表失败:', error);
      message.error('获取文件列表失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 初次加载和刷新触发时获取文件列表
  useEffect(() => {
    fetchFileList();
  }, [refreshTrigger]);

  // 删除文件
  const handleDelete = async (fileName) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除文件 "${fileName}" 吗？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await axios.delete(`/api/files/${fileName}`);
          message.success('删除成功');
          fetchFileList();
        } catch (error) {
          console.error('删除文件失败:', error);
          message.error('删除文件失败: ' + (error.response?.data?.error || error.message));
        }
      }
    });
  };

  // 预览文件
  const handlePreview = (file) => {
    if (isImage(file.fileName)) {
      setPreviewImage(file.url);
      setPreviewTitle(file.fileName);
      setPreviewVisible(true);
    } else {
      window.open(file.url, '_blank');
    }
  };

  // 判断是否是图片文件
  const isImage = (fileName) => {
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
  };

  // 获取文件类型
  const getFileType = (fileName) => {
    if (/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName)) {
      return 'image';
    } else if (/\.(mp4|webm|avi|mov|wmv|flv)$/i.test(fileName)) {
      return 'video';
    } else if (/\.(mp3|wav|ogg|flac|aac)$/i.test(fileName)) {
      return 'audio';
    } else if (/\.(pdf)$/i.test(fileName)) {
      return 'pdf';
    } else if (/\.(doc|docx)$/i.test(fileName)) {
      return 'word';
    } else if (/\.(xls|xlsx)$/i.test(fileName)) {
      return 'excel';
    } else if (/\.(ppt|pptx)$/i.test(fileName)) {
      return 'ppt';
    } else if (/\.(zip|rar|7z|tar|gz)$/i.test(fileName)) {
      return 'archive';
    } else if (/\.(txt|md|json|xml|html|css|js)$/i.test(fileName)) {
      return 'text';
    } else {
      return 'other';
    }
  };

  // 获取文件图标
  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return <PictureOutlined className="file-icon" style={{ color: '#1890ff' }} />;
      case 'video':
        return <VideoCameraOutlined className="file-icon" style={{ color: '#ff4d4f' }} />;
      case 'audio':
        return <SoundOutlined className="file-icon" style={{ color: '#faad14' }} />;
      case 'pdf':
        return <FilePdfOutlined className="file-icon" style={{ color: '#ff4d4f' }} />;
      case 'word':
        return <FileWordOutlined className="file-icon" style={{ color: '#1890ff' }} />;
      case 'excel':
        return <FileExcelOutlined className="file-icon" style={{ color: '#52c41a' }} />;
      case 'ppt':
        return <FilePptOutlined className="file-icon" style={{ color: '#fa8c16' }} />;
      case 'archive':
        return <FileZipOutlined className="file-icon" style={{ color: '#8c8c8c' }} />;
      case 'text':
        return <FileTextOutlined className="file-icon" style={{ color: '#1890ff' }} />;
      case 'markdown':
        return <FileMarkdownOutlined className="file-icon" style={{ color: '#722ed1' }} />;
      default:
        return <FileOutlined className="file-icon" style={{ color: '#8c8c8c' }} />;
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 获取文件类型标签
  const getTypeTag = (type) => {
    const typeMap = {
      'image': { color: 'blue', text: '图片' },
      'video': { color: 'red', text: '视频' },
      'audio': { color: 'orange', text: '音频' },
      'pdf': { color: 'red', text: 'PDF' },
      'word': { color: 'blue', text: 'Word' },
      'excel': { color: 'green', text: 'Excel' },
      'ppt': { color: 'orange', text: 'PPT' },
      'archive': { color: 'default', text: '压缩包' },
      'text': { color: 'cyan', text: '文本' },
      'other': { color: 'default', text: '其他' }
    };
    const info = typeMap[type] || typeMap.other;
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  // 提取文件名（不含时间戳和UUID）
  const extractOriginalFileName = (fileName) => {
    // 时间戳_UUID.扩展名 格式
    const match = fileName.match(/\d{14}_[a-f0-9]{32}\.(.+)$/);
    if (match) {
      return `文件.${match[1]}`;
    }
    return fileName;
  };

  // 表格列配置
  const columns = [
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (text, record) => (
        <div className="file-name-cell">
          {getFileIcon(record.type)}
          <Tooltip title={text}>
            <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
              {extractOriginalFileName(text)}
            </span>
          </Tooltip>
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: type => getTypeTag(type),
      responsive: ['md'],
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      responsive: ['sm'],
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <div className="file-actions">
          <Tooltip title="预览">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
              className="file-action-btn"
            />
          </Tooltip>
          <Tooltip title="下载">
            <Button
              type="link"
              icon={<DownloadOutlined />}
              onClick={() => window.open(record.url, '_blank')}
              className="file-action-btn"
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.fileName)}
              className="file-action-btn"
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="file-list-container fade-in">
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FileOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <span>文件列表</span>
          </div>
        }
        bordered={false}
        extra={
          <Button 
            type="primary" 
            onClick={fetchFileList} 
            icon={<ReloadOutlined />}
            loading={loading}
          >
            刷新
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={fileList}
          loading={loading}
          pagination={{
            defaultPageSize: 8,
            showSizeChanger: true,
            pageSizeOptions: ['8', '16', '32'],
            showTotal: (total) => `共 ${total} 个文件`
          }}
          locale={{ 
            emptyText: (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description="暂无文件，请上传" 
              />
            )
          }}
          rowClassName="file-table-row"
        />
      </Card>
      
      <Modal
        visible={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
        destroyOnClose
      >
        <Image
          alt={previewTitle}
          style={{ width: '100%' }}
          src={previewImage}
          preview={false}
        />
      </Modal>
    </div>
  );
};

export default FileList; 