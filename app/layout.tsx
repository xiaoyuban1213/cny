import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "春节倒计时 - 新年快乐",
  description: "春节倒计时",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hans">
      <head>
        {/* 提前与对象存储建立连接，缩短壁纸与音乐的加载时间 */}
        <link rel="preconnect" href="https://api-yuban.cn-nb1.rains3.com" />
        <link rel="dns-prefetch" href="https://api-yuban.cn-nb1.rains3.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
