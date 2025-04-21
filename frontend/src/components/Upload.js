import React, { useState } from 'react';
import {
  Upload,
  Button,
  Card,
  Radio,
  Progress,
  Typography,
  Space,
  Divider,
  message,
  Tooltip
} from 'antd';
import {
  UploadOutlined,
  InboxOutlined,
  FileOutlined,
  CloudUploadOutlined,
  FileDoneOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import '../App.css';
import axios from 'axios';

const { Dragger } = Upload;
const { Text, Title } = Typography;

const UploadComponent = ({ onUploadSuccess }) => {
  const [uploadMode, setUploadMode] = useState('dragger');
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState(null);

  // 处理文件上传
  const handleUpload = async (info) => {
    // 更新文件列表
    let newFileList = [...info.fileList].slice(-3);
    setFileList(newFileList);
    
    // 处理上传状态变化
    const { status } = info.file;
    if (status === 'uploading') {
      setUploading(true);
      const percent = Math.round((info.file.percent || 0) * 100);
      setUploadProgress(percent);
    } else if (status === 'done') {
      message.success(`${info.file.name} 上传成功`);
      setUploading(false);
      setUploadProgress(100);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } else if (status === 'error') {
      message.error(`${info.file.name} 上传失败`);
      setUploading(false);
    }
  };

  // 文件上传前的检查
  const beforeUpload = (file) => {
    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      message.error('文件必须小于50MB！');
      return false;
    }
    setFile(file);
    return true;
  };

  // 手动上传文件
  const handleManualUpload = async () => {
    if (!file) {
      message.error('请先选择文件');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      await axios.post('/api/files/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      message.success('上传成功');
      setUploading(false);
      setUploadProgress(100);
      setFile(null);
      setFileList([]);
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('上传失败:', error);
      message.error('上传失败');
      setUploading(false);
    }
  };

  // 上传组件的配置
  const uploadProps = {
    name: 'file',
    multiple: false,
    action: '/api/files/upload',
    onChange: handleUpload,
    fileList,
    beforeUpload,
    showUploadList: {
      showRemoveIcon: !uploading,
      showDownloadIcon: false,
    },
    onRemove: () => {
      setFile(null);
      setUploadProgress(0);
    }
  };

  const renderUploadComponent = () => {
    if (uploadMode === 'dragger') {
      return (
        <Dragger {...uploadProps} disabled={uploading} className="fade-in">
          <div style={{ padding: '32px 0' }}>
            <p className="ant-upload-drag-icon">
              <CloudUploadOutlined className="upload-icon" />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持单个文件上传，文件大小不超过50MB
            </p>
          </div>
        </Dragger>
      );
    } else {
      return (
        <div className="fade-in">
          <Upload {...uploadProps} disabled={uploading}>
            <Button 
              type="primary" 
              icon={<UploadOutlined />} 
              className="upload-button"
              loading={uploading}
              disabled={uploading}
            >
              选择文件
            </Button>
          </Upload>
          
          {file && (
            <Button
              type="primary"
              onClick={handleManualUpload}
              loading={uploading}
              icon={<CloudUploadOutlined />}
              style={{ marginTop: 16 }}
              className="upload-btn"
            >
              {uploading ? '上传中...' : '开始上传'}
            </Button>
          )}
          
          <div className="upload-tip">
            <Space>
              <InfoCircleOutlined />
              <Text type="secondary">支持单个文件上传，文件大小不超过50MB</Text>
            </Space>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="upload-container fade-in">
      <Card 
        style={{ 
          borderRadius: '12px', 
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}
        title={
          <div className="card-title-container">
            <FileDoneOutlined className="card-title-icon" />
            <span>文件上传</span>
          </div>
        }
        bordered={false}
      >
        <div className="mode-selector">
          <Text strong className="mode-label">上传模式：</Text>
          <Radio.Group 
            value={uploadMode} 
            onChange={(e) => setUploadMode(e.target.value)}
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value="dragger">拖拽上传</Radio.Button>
            <Radio.Button value="button">按钮上传</Radio.Button>
          </Radio.Group>
        </div>
        
        {renderUploadComponent()}
        
        {uploading && (
          <div className="upload-progress-container fade-in">
            <Divider>
              <Space>
                <FileOutlined />
                <Text>上传进度</Text>
              </Space>
            </Divider>
            <Progress 
              percent={uploadProgress} 
              status="active" 
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default UploadComponent; 