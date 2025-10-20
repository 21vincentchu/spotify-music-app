function LoadingSpinner({ message = "Loading..." }) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '40px',
        flexDirection: 'column'
      }}>
        <div className="spinner" />
        <p style={{ marginTop: '16px', color: '#666' }}>{message}</p>
        <style>{`
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #1DB954;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  export default LoadingSpinner;