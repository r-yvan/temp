import { PageProps } from '@/types/base.type';
import { AuthApi } from '@/utils/constants';
import { getTokenData } from '@/utils/fetch';
import { notFound } from 'next/navigation';
import ReportsIndex from './_index_page';
import { cookies } from 'next/headers';

export const revalidate = 60;
// export const dynamic = 'force';

export const metadata = {
  title: 'Student Report Card',
  description: 'Student Report Card',
};

const getReportCardInfo = async (academicYearId: string, studentId: string) => {
  try {
    const res = await AuthApi.get('/academicMarks/report-card/by-loggedIn-student', {
      params: {
        academicYearId,
        studentId,
      },
      headers: {
        Authorization: `Bearer ${cookies().get('token')?.value}`,
      },
    });
    // console.log('Getting the datas');
    const finalData = res.data.data;
    return finalData;
  } catch (error) {
    return null;
  }
};

async function StudentReportPage({ params }: PageProps) {
  const academicYearId = params?.id;
  const token = cookies().get('token');
  const studentInfo = getTokenData(token?.value);

  if (!academicYearId || !studentInfo) return notFound();

  const studentId = studentInfo.userId;

  const reportCardInfo = await getReportCardInfo(academicYearId, studentId);
  if (!reportCardInfo) return notFound();

  return <ReportsIndex reportCardInfo={reportCardInfo} />;
}

export default StudentReportPage;
