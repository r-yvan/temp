'use client';
import { useUserContext } from '@/context/Usercontext';
import { AuthApi } from '@/utils/constants';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useError } from '@/hooks/useError';
import LatestMarks from '@/components/dashboard/LatestMarks';
import Announcements from '@/components/dashboard/Announcements';
import DisciplineCases from '@/components/dashboard/DiscplineCases';
import { getAcademicYears, getTermsInYear } from '@/utils/funcs';
import { getCurrentYear, toFixed } from '@/utils/funcs/func2';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const meString = localStorage.getItem('rcaappuser');
  const [data, setData] = useState<any>();
  const [err, setErr] = useState<any>();
  const [thisYearTerms, setThisYearTerms] = useState<any>([]);
  const me = meString ? JSON.parse(meString) : null;
  const { profile } = useUserContext();
  const getDashboard = (id: string) => {
    AuthApi.get(`/dashboard/logged-in-student/${id}`)
      .then((res) => {
        setData(res.data.data);
      })
      .catch((err) => {
        setErr(true);
        notifications.show({
          title: 'Failed to get Dashboard',
          message: useError(err, 'Get Dashboard Data'),
          color: 'red',
          autoClose: 60000,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    const fetch = async () => {
      const years = await getAcademicYears();
      const currentYear = getCurrentYear(years.data);
      let terms = await getTermsInYear(currentYear?.id as any);
      terms = terms.data;
      terms.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setThisYearTerms(terms);
      const secondLastTermId = terms.length >= 2 ? terms[1].id : terms[0].id;
      getDashboard(secondLastTermId);
    };
    fetch();
  }, []);
  const getGreeting = () => {
    const currentTime = new Date().getHours();
    let greeting = '';
    if (currentTime >= 5 && currentTime < 12) {
      greeting = 'Good Morning ☀️';
    } else if (currentTime >= 12 && currentTime < 18) {
      greeting = 'Good Afternoon 🌤️';
    } else {
      greeting = 'Good Evening 🌙';
    }
    return greeting;
  };
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 5,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 3,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };
  return (
    <div className="flex flex-row gap-5  text-sm h-full">
      <div className="flex flex-col w-full p-3">
        <p className="text-[15px]  mt-2 text-slate-800">
          {getGreeting()} <span className="font-extrabold">{me ? me.username : ' '}</span>
        </p>
        <>
          <div className="">
            {/* <p className="text-[rgba(67,67,67,0.43)] my-3">
              Statistics of your performance and innovations published
            </p> */}
            <Carousel
              responsive={responsive}
              autoPlay
              arrows={false}
              transitionDuration={2000}
              className="my-3"
              infinite
            >
              <Link
                href={'/student/'}
                className="mx-1.5 h-full bg-[rgba(8,40,210,0.09)] border  border-[#0828d278]  text-[rgba(8,40,210,0.47)] rounded-md  py-10  p-5 flex flex-col  gap-3 items-end justify-center"
              >
                <p className="font-extrabold text-[27px] text-right">
                  {loading
                    ? '--'
                    : profile && profile?.currentClass?.className
                      ? profile?.currentClass?.className
                      : 'None'}
                </p>
                <p className="font-extrabold text-xs text-right">Current Class</p>
              </Link>
              <Link
                href={'/student/courses'}
                className="mx-1.5 h-full bg-[rgba(82,56,115,0.17)] border  border-[rgba(82,56,115,0.55)] text-[rgba(82,56,115,0.55)] rounded-md  py-10  p-5 flex flex-col  gap-3 items-end justify-center"
              >
                <p className="font-extrabold text-[27px] text-right">
                  {loading ? '--' : data && data.coursesNumber ? data.coursesNumber : '0'}
                </p>
                <p className="font-extrabold text-xs text-right">Courses</p>
              </Link>
              <Link
                href={'/student/deductions'}
                className="mx-1.5 h-full bg-[rgba(82,56,115,0.17)] border  border-[rgba(82,56,115,0.55)] text-[rgba(82,56,115,0.55)] rounded-md  py-10  p-5 flex flex-col  gap-3 items-end justify-center"
              >
                <p className="font-extrabold text-[27px] text-right">
                  {' '}
                  {loading ? '--' : data && data.dsAppeals ? data.dsAppeals : '0'}
                </p>
                <p className="font-extrabold text-xs text-right">Discipline Cases</p>
              </Link>
              <Link
                href={'/student/appeals'}
                className="mx-1.5 h-full bg-[rgba(8,40,210,0.09)] border  border-[rgba(8,40,210,0.47)]  text-[rgba(8,40,210,0.47)] rounded-md  py-10  p-5 flex flex-col  gap-3 items-end justify-center"
              >
                <p className="font-extrabold text-[27px] text-right">
                  {loading ? '--' : data && data.myAppealsNumber ? data.myAppealsNumber : '0'}
                </p>

                <p className="font-extrabold text-xs text-right">Appeals</p>
              </Link>
              {data?.catOverallPerformance && (
                <Link
                  href={'/student/'}
                  className="mx-1.5 h-full bg-[rgba(8,40,210,0.09)] border  border-[#0828d278]  text-[rgba(8,40,210,0.47)] rounded-md  py-10  p-5 flex flex-col  gap-3 items-end justify-center"
                >
                  <p className="font-extrabold text-[27px] text-right">
                    {loading
                      ? '--'
                      : data && data.catOverallPerformance
                        ? toFixed(data.catOverallPerformance) + '%'
                        : '0'}
                  </p>
                  <p className="font-extrabold text-xs text-right">Cat Overall (Previous Term)</p>
                </Link>
              )}
              {data?.examOverallPerformance && (
                <Link
                  href={'/student'}
                  className="mx-1.5 h-full bg-[rgba(82,56,115,0.17)] border  border-[rgba(82,56,115,0.55)] text-[rgba(82,56,115,0.55)] rounded-md  py-10  p-5 flex flex-col  gap-3 items-end justify-center"
                >
                  <p className="font-extrabold text-[27px] text-right">
                    {loading
                      ? '--'
                      : data && data.examOverallPerformance
                        ? toFixed(data.examOverallPerformance) + '%'
                        : '0'}
                  </p>
                  <p className="font-extrabold text-xs text-right">Exam Overall (Previous Term)</p>
                </Link>
              )}
            </Carousel>
            <div className="w-full flex flex-col md:flex-row my-2 gap-5">
              <div className="w-full md:w-[70%] py-3">
                <div className="flex flex-row justify-between items-center">
                  <p className="text-[rgba(67,67,67,0.43)]">Latest Marks</p>
                  <Link
                    href={'/student/performance'}
                    className="text-[#3C64CA] font-semibold text-[12px]"
                  >
                    View more
                  </Link>
                </div>
                <LatestMarks />
                <div className="flex flex-row justify-between items-center">
                  <p className="text-[rgba(67,67,67,0.43)]">Discipline Cases</p>
                  <Link
                    href={'/student/deductions'}
                    className="text-[#3C64CA] font-semibold text-[12px]"
                  >
                    View more
                  </Link>
                </div>
                <DisciplineCases />
              </div>
              <div className="w-full md:w-[30%]">
                <Announcements />
              </div>
            </div>
          </div>
        </>
      </div>
    </div>
  );
};

export default Dashboard;
