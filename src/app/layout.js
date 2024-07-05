import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext"; // Certifique-se de que o caminho está correto

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AJUDARS",
  description: "Ajude doando mantimentos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
