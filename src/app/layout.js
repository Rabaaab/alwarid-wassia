import "./globals.css";

export const metadata = {
  title: "Alwarid — Know the Patient in Seconds",
  description: "Alwarid est une plateforme d'aide à la décision médicale : dossier patient, visualisation 3D du corps, WassIA et coordination des soins.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="aw-refine" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
