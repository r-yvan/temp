'use client';
import React, { useEffect, useState } from 'react';
import { useUserContext } from '@/context/Usercontext';
import { notifications } from '@mantine/notifications';
import { AuthApi } from '@/utils/constants';
import { useError } from '@/hooks/useError';
import Link from 'next/link';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import Announcements from '@/components/dashboard/Announcements';
import DashboardTable from '@/components/dashboard/DashboardTable';
import { getAcademicYears, getTermsInYear } from '@/utils/funcs';
import { getCurrentYear } from '@/utils/funcs/func2';

const TeacherDashboard = () => {
  const [loading, setLoading] = useState(true);
  const meString = localStorage.getItem('rcaappuser');
  const [data, setData] = useState<any>();
  const [err, setErr] = useState<any>();
  const [thisYearTerms, setThisYearTerms] = useState<any>([]);
  const me = meString ? JSON.parse(meString) : null;
  const { profile } = useUserContext();

  const getDashboard = (id: string) => {
    AuthApi.get(`/dashboard/logged-in-teacher/${id}`)
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
  const coursesPerformanceColumns = [
    {
      name: 'Course',
      getter: (data: any) => `${data?.course?.courseName} `,
    },
    {
      name: 'CAT',
      getter: (data: any) =>
        typeof data.catOverAll === 'number' ? data.catOverAll.toFixed(2) + '%' : '100%',
    },
    {
      name: 'Exam',
      getter: (data: any) =>
        typeof data.examOverAll === 'number' ? data.examOverAll.toFixed(2) + '%' : '100%',
    },
  ];
  const classesPerformanceColumns = [
    {
      name: 'Class',
      getter: (data: any) => `${data.myClass.className} `,
    },
    {
      name: 'CAT',
      getter: (data: any) => data.catOverAll.toFixed(2) + '%' || '100%',
    },
    {
      name: 'Exam',
      getter: (data: any) => data.examOverAll.toFixed(2) + '%' || '100%',
    },
  ];
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
              {data?.classTeacher &&
                !data?.classTeacher.includes('You are not a class Teacher') && (
                  <Link
                    href={'/staff/'}
                    className=" mx-1.5 bg-[rgba(82,56,115,0.17)] border  border-[rgba(82,56,115,0.55)] text-[rgba(82,56,115,0.55)] rounded-md  py-10  p-5 flex flex-col  gap-3 items-end justify-center h-full"
                  >
                    <p className="font-extrabold text-[27px] text-right">
                      {loading ? '--' : data && data?.classTeacher}
                    </p>
                    <p className="font-extrabold text-xs text-right">Your Class</p>
                  </Link>
                )}
              <Link
                href={'/staff/courses'}
                className=" mx-1.5 bg-[rgba(82,56,115,0.17)] border  border-[rgba(82,56,115,0.55)] text-[rgba(82,56,115,0.55)] rounded-md  py-10  p-5 flex flex-col  gap-3 items-end justify-center h-full"
              >
                <p className="font-extrabold text-[27px] text-right">
                  {loading ? '--' : data && data.coursesNumber ? data.coursesNumber : '0'}
                </p>
                <p className="font-extrabold text-xs text-right">Courses</p>
              </Link>
              <Link
                href={'/'}
                className=" mx-1.5 bg-[rgba(82,56,115,0.17)] border  border-[rgba(82,56,115,0.55)] text-[rgba(82,56,115,0.55)] rounded-md  py-10  p-5 flex flex-col  gap-3 items-end justify-center h-full"
              >
                <p className="font-extrabold text-[27px] text-right">
                  {' '}
                  {loading ? '--' : data && data.classesNumber ? data.classesNumber : '0'}
                </p>
                <p className="font-extrabold text-xs text-right">Classes</p>
              </Link>
              <Link
                href={'/staff/appeals'}
                className=" mx-1.5 bg-[rgba(8,40,210,0.09)] border  border-[rgba(8,40,210,0.47)]  text-[rgba(8,40,210,0.47)] rounded-md  py-10  p-5 flex flex-col  gap-3 items-end justify-center h-full"
              >
                <p className="font-extrabold text-[27px] text-right">
                  {loading ? '--' : data && data.myAppealsNumber ? data.myAppealsNumber : '0'}
                </p>

                <p className="font-extrabold text-xs text-right">Appeals</p>
              </Link>
              {/* <Link
                href={'/'}
                className=" mx-1.5 bg-[rgba(82,56,115,0.17)] border  border-[rgba(82,56,115,0.55)] text-[rgba(82,56,115,0.55)] rounded-md  py-10  p-5 flex flex-col  gap-3 items-end justify-center h-full"
              >
                <p className="font-extrabold text-[27px] text-right">
                  {' '}
                  {loading ? '--' : data && data.studentsNumber ? data.studentsNumber : '0'}
                </p>
                <p className="font-extrabold text-xs text-right">Students (you teach)</p>
              </Link> */}
              {data?.overAllMarksForCourses
                ?.filter(
                  (item: any) =>
                    item.catOverAll !== null &&
                    item.catOverAll !== undefined &&
                    !isNaN(item.catOverAll),
                )
                .map((marks: any, i: number) => {
                  return (
                    <Link
                      key={i}
                      href={'/'}
                      className=" mx-1.5 bg-[rgba(82,56,115,0.17)] border border-[rgba(82,56,115,0.55)] text-[rgba(82,56,115,0.55)] rounded-md py-10 p-5 flex flex-col gap-3 items-end justify-center h-full"
                    >
                      <p className="font-extrabold text-[27px] text-right">
                        {marks.catOverAll.toFixed(2)}%
                      </p>
                      <p className="font-extrabold text-xs text-right">
                        {marks.course.courseName} Exam
                      </p>
                    </Link>
                  );
                })}

              {data?.overAllMarksForCourses
                ?.filter(
                  (item: any) =>
                    item.examOverAll !== null &&
                    item.examOverAll !== undefined &&
                    !isNaN(item.examOverAll),
                )
                .map((marks: any, i: number) => {
                  return (
                    <Link
                      key={i}
                      href={'/'}
                      className=" mx-1.5 bg-[rgba(82,56,115,0.17)] border border-[rgba(82,56,115,0.55)] text-[rgba(82,56,115,0.55)] rounded-md py-10 p-5 flex flex-col gap-3 items-end justify-center h-full"
                    >
                      <p className="font-extrabold text-[27px] text-right">
                        {marks.examOverAll.toFixed(2)}%
                      </p>
                      <p className="font-extrabold text-xs text-right">
                        {marks.course.courseName} Exam
                      </p>
                    </Link>
                  );
                })}
            </Carousel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
              <DashboardTable
                columns={classesPerformanceColumns}
                data={(data?.overAllMarksForClasses || [])
                  .filter(
                    (item: any) =>
                      item.catOverAll !== null &&
                      item.examOverAll !== null &&
                      item.catOverAll !== undefined &&
                      item.examOverAll !== undefined &&
                      !isNaN(item.catOverAll) &&
                      !isNaN(item.examOverAll),
                  )
                  .sort((a: any, b: any) => {
                    const avgA = (a.catOverAll + a.examOverAll) / 2;
                    const avgB = (b.catOverAll + b.examOverAll) / 2;
                    return avgB - avgA;
                  })}
                loading={loading}
                filter={thisYearTerms}
                onFilterchange={async (id: string) => {
                  setLoading(true);
                  await getDashboard(id);
                  setLoading(false);
                }}
                selectedFilter={thisYearTerms.length >= 2 ? thisYearTerms[1] : thisYearTerms[0]}
                title="Classes with Outstanding Performance"
              />
              <DashboardTable
                columns={coursesPerformanceColumns}
                data={(data?.overAllMarksForCourses || [])
                  .filter(
                    (item: any) =>
                      item.catOverAll !== null &&
                      item.examOverAll !== null &&
                      item.catOverAll !== undefined &&
                      item.examOverAll !== undefined &&
                      !isNaN(item.catOverAll) &&
                      !isNaN(item.examOverAll),
                  )
                  .sort((a: any, b: any) => {
                    const avgA = (a.catOverAll + a.examOverAll) / 2;
                    const avgB = (b.catOverAll + b.examOverAll) / 2;
                    return avgB - avgA;
                  })}
                loading={loading}
                filter={thisYearTerms}
                onFilterchange={async (id: string) => {
                  setLoading(true);
                  await getDashboard(id);
                  setLoading(false);
                }}
                selectedFilter={thisYearTerms.length >= 2 ? thisYearTerms[1] : thisYearTerms[0]}
                title="Highest Performing Courses"
              />
            </div>
          </div>
        </>
      </div>
    </div>
  );
};

export default TeacherDashboard;
