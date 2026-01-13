export default function Loading() {
    return (
        <div className="page-container" style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
            <div className="loading-spinner"></div>
            <style jsx>{`
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #e5e5e5;
                    border-top: 4px solid #58cc02;
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
