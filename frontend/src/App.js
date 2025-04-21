import React, { useState } from 'react';
import { Layout, Typography, Divider } from 'antd';
import Upload from './components/Upload';
import FileList from './components/FileList';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshFileList = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="App">
      <header className="app-header">
        <Title level={3} className="app-title" style={{ color: 'white', margin: 0 }}>
          MinIO 文件上传系统
        </Title>
      </header>
      <main className="app-content">
        <Upload onUploadSuccess={refreshFileList} />
        <FileList refreshTrigger={refreshTrigger} />
      </main>
      <Footer style={{ textAlign: 'center', padding: '16px 0' }}>
        MinIO 文件上传系统 ©{new Date().getFullYear()} 
      </Footer>
    </div>
  );
}

export default App; 