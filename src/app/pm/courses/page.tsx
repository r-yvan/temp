import { Metadata } from 'next';
import React from 'react';
import CoursePage from './_coursePage';

export const metadata: Metadata = {
  title: 'Admin Courses - RCA',
  description: 'Admin Courses - RCA',
};

const AdminCourses = async () => {
  return <CoursePage />;
};

export default AdminCourses;
