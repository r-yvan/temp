import { ApiResponse } from '@/types/base.type';
import { IAcademicYear } from '@/types/other.type';
import { AuthApi, fetcher } from '@/utils/constants';
import { Metadata } from 'next';
import React from 'react';
import AcademicYear from './_indexPage';

export const revalidate = 15; // seconds

export const metadata: Metadata = {
  title: 'Academic Year',
  description: 'View and manage academic years',
};

const AcademicYearPage = async () => {
  return <AcademicYear academicYears={[]} />;
};

export default AcademicYearPage;
