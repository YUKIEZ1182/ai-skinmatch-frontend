import React from 'react';

export default function LoadingSpinner() {
  return (
    <div style={styles.container}>
      <div className="spinner"></div>
      <p style={styles.text}>กำลังโหลดข้อมูล...</p>
      
      {/* ใส่ Style tag ตรงนี้เลยเพื่อให้ง่ายต่อการก็อปปี้ */}
      <style>{`
        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #fe8585ff; /* สีดำธีมเว็บคุณ */
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    width: '100%',
  },
  text: {
    color: '#666',
    fontSize: '1.2rem',
    fontWeight: '500'
  }
};