'use client';
import ReportCard, { ReportCardImage } from '@/components/academics/report-cards/ReportCard';
import { useApp } from '@/context/AppContext';
import { useUserContext } from '@/context/Usercontext';
import useGet from '@/hooks/useGet';
import { DsReport, IReportCard } from '@/types/marks.type';
import { ITerm } from '@/types/other.type';
import { AuthApi } from '@/utils/constants';
import { genReportCardQrCode } from '@/utils/funcs/func3';
import { Button, Skeleton } from '@mantine/core';
import { pdf } from '@react-pdf/renderer';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { BiDownload } from 'react-icons/bi';
import { Document, Page, pdfjs } from 'react-pdf';

// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.js',
//   import.meta.url,
// ).toString();
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

interface Props {
  reportCardInfo: IReportCard;
}

const ReportsIndex = ({ reportCardInfo }: Props) => {
  const [pdfUrl, setPdfUrl] = React.useState('');
  const params = useParams();
  const { user } = useUserContext();
  const { setReportCard } = useApp();
  const [generating, setGenerating] = React.useState(false);
  const [studentClassTermData, setStudentClassTermData] = React.useState<any>(null);

  const { data: terms, loading: termsLoading } = useGet<ITerm[]>(
    `/terms/all/academic-year/${params.id}`,
    {
      defaultData: [],
      paginated: false,
      query: {
        academicYearId: params.id,
      },
    },
  );
  const { data: dsMarks, loading: loadingDS } = useGet<DsReport>(
    `/deductions/ds-marks/loggedIn-student
`,
    {
      query: {
        academicYearId: params.id,
      },
    },
  );

  useEffect(() => {
    if (!reportCardInfo) return;
    setReportCard(reportCardInfo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportCardInfo]);

  const allLoading = termsLoading || loadingDS;

  const downloadReport = () => {
    // const canvas = document.querySelector('canvas');
    // if (!canvas) return;
    // const image = canvas.toDataURL('image/png');
    // pdf(<ReportCardImage reportCardInfo={reportCardInfo} image={image} />)
    //   .toBlob()
    //   .then((blob) => {
    //     const pdfUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute(
      'download',
      `${reportCardInfo?.studentInfo?.firstName}-${reportCardInfo?.studentInfo?.lastName}-report-card.pdf`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    // });
  };

  const genReportCard = async () => {
    if (!reportCardInfo || !user) return;
    setGenerating(true);
    try {
      const res2 = await AuthApi.get(
        `/student-class-term/student/${reportCardInfo?.studentInfo?.id}`,
      );
      setStudentClassTermData(res2.data.data);
      const qrCode = await genReportCardQrCode({
        studentId: user?.id,
        academicYearId: params.id as string,
        token: reportCardInfo.parents?.[0]?.reportCardToken ?? '',
      });
      const blob = await pdf(
        <ReportCard
          qrCodeImageUrl={qrCode}
          info={reportCardInfo!}
          terms={terms!}
          dsMarks={dsMarks!}
          studentClassTermData={res2.data.data}
        />,
      ).toBlob();

      setPdfUrl(URL.createObjectURL(blob));

      // const file = new File([blob], 'report-card.pdf', { type: 'application/pdf' });
      // setFile(file);
    } catch (err) {
      console.error(err);
    }
    setGenerating(false);
  };

  useEffect(() => {
    if (allLoading) return;
    if (reportCardInfo) {
      genReportCard();
    }
  }, [allLoading]);

  return (
    <div className="w-full overflow-auto  p-2 text-sm border-[2px] rounded-lg">
      <header className="text-[#000000B2] font-semibold flex sm:flex-row flex-col justify-between items-center mx-1 my-2">
        <h1>Report Card for Academic Year {reportCardInfo?.academicYearInfo?.name}</h1>
        <Button onClick={downloadReport}>
          <BiDownload className="mr-2" />
          Download Report
        </Button>
      </header>
      {allLoading && (
        <div className="h-[80vh]">
          <Skeleton className="w-full" h={'100%'} />
        </div>
      )}
      <div className="w-fit mx-auto">
        {!allLoading && reportCardInfo && pdfUrl && (
          <>
            {/* <PDFViewer
            width={'100%'}
            height={'100vh'}
            className="w-full max-w-[1000px] min-h-[88vh] mx-auto flex flex-col"
          >
            <ReportCard info={reportCardInfo!} terms={terms!} dsMarks={dsMarks!} />
          </PDFViewer> */}
            <Document file={pdfUrl} onLoadError={(error) => {}}>
              <Page pageNumber={1} />
            </Document>
          </>
        )}
        {generating && <span className=" text-center">Generating Report Card ...</span>}
        {!allLoading && !reportCardInfo && (
          <div className="h-[80vh] flex justify-center items-center">
            <div className="text-[#000000B2] font-semibold mx-1 my-2">
              No report card found for you
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsIndex;
