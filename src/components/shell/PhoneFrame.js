'use client';

/* Les écrans patient ont été dessinés pour un téléphone : on les centre dans un cadre sur grand écran. */
export default function PhoneFrame({ children }) {
    return (
        <div style={{ minHeight: '100vh', background: 'radial-gradient(900px 500px at 12% 0%,rgba(125,189,244,0.55),transparent 70%),linear-gradient(180deg,#d3e7fb 0%,#eaf4fd 40%,#f7fbff 100%)', display: 'flex', justifyContent: 'center', padding: '0 0 0' }}>
            <div style={{ width: '100%', maxWidth: 430, minHeight: '100vh', background: '#f4f9ff', boxShadow: '0 0 80px -20px rgba(28,95,178,0.35)' }}>
                {children}
            </div>
        </div>
    );
}
