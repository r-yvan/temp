'use client';
import { Next13ProgressBar } from 'next13-progressbar';
import React, { FC, Suspense } from 'react';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/spotlight/styles.css';
import { Notifications } from '@mantine/notifications';
import MainSpotLight from '@/components/core/spotlight';
import RiseLoader from 'react-spinners/RiseLoader';
import AppProvider from '@/context/AppContext';
import ThemeProvider from '@/context/ThemeContext';
import { DatesProvider } from '@mantine/dates';

interface Props {
  children: React.ReactNode;
}

const Providers: FC<Props> = ({ children }) => {
  return (
    <MantineProvider
      theme={{
        colors: {
          brand: [
            '#F0BBDD',
            '#ED9BCF',
            '#EC7CC3',
            '#ED5DB8',
            '#F13EAF',
            '#F71FA7',
            '#1A264A',
            '#311d4a',
            '#C50E82',
            '#AD1374',
          ],
        },
        primaryColor: 'brand',
      }}
    >
      <MainSpotLight />
      <Notifications position="top-right" />
      <Next13ProgressBar color="#1A264A" height={'3px'} options={{ showSpinner: false }} />
      <Suspense
        fallback={
          <div className="w-screen h-screen flex justify-center items-center">
            {/* <RiseLoader color="#1A264A" /> */}
          </div>
        }
      >
        <DatesProvider settings={{ timezone: 'UTC' }}>
          <AppProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </AppProvider>
        </DatesProvider>
      </Suspense>
    </MantineProvider>
  );
};

export default Providers;
