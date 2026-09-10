import './globals.css';
import '../styles/preflight.css';
import '@mantine/core/styles.css';
import { UserContextProvider } from '@/context/Usercontext';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Providers from './providers';
import React from 'react';

// const poppins = Poppins({
//   subsets: ['latin'],
//   weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
// });

export const metadata: Metadata = {
  title: 'RCA APP',
  description: 'This is the rca application for students,teachers and administration',
};

// interface Props {
//   children: React.ReactNode;
//   modal?: React.ReactNode;
// }

const RootLayout = async ({ children, modal }: any) => {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/logo.png" type="image/x-icon" />
      </head>
      <body className={` bg-[#F7F8FD]`}>
        <div className="bg-[#F7F8FD] w-full h-screen">
          <UserContextProvider>
            <Providers>
              {children}
              {modal}
            </Providers>
            <Toaster position="top-right" reverseOrder={false} />
          </UserContextProvider>
        </div>
      </body>
    </html>
  );
};
export default RootLayout;
