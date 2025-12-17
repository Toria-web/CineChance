import Sidebar from './components/Sidebar';
// ... остальные импорты

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-gray-900 text-white min-h-screen">
        <Sidebar />
        <main className="md:ml-64"> {/* Отступ слева на десктопе для sidebar */}
          {children}
        </main>
      </body>
    </html>
  );
}