import axios from 'axios';

const API = {
  // 文件上传 - 普通上传
  uploadFile: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    return axios.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
  },

  // 文件上传 - 初始化分片上传
  initMultiPartUpload: (fileName, fileSize) => {
    return axios.post('/api/files/upload/init', null, {
      params: {
        fileName,
        fileSize,
      },
    });
  },

  // 文件上传 - 上传分片
  uploadPart: (uploadId, partNumber, file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    return axios.post('/api/files/upload/part', formData, {
      params: {
        uploadId,
        partNumber,
      },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
  },

  // 文件上传 - 完成分片上传
  completeMultiPartUpload: (uploadId, fileName, parts) => {
    return axios.post('/api/files/upload/complete', parts, {
      params: {
        uploadId,
        fileName,
      },
    });
  },

  // 获取文件列表
  listFiles: () => {
    return axios.get('/api/files/list');
  },

  // 获取文件URL
  getFileUrl: (fileName) => {
    return axios.get('/api/files/url', {
      params: { fileName },
    });
  },

  // 删除文件
  deleteFile: (fileName) => {
    return axios.delete(`/api/files/${fileName}`);
  },
};

export default API; 