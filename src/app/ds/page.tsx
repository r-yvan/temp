'use client';
import { useError } from '@/hooks/useError';
import { AuthApi } from '@/utils/constants';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Button } from '@nextui-org/react';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { getAcademicYears, getTermsInYear } from '@/utils/funcs';
import { getCurrentYear } from '@/utils/funcs/func2';
import DashboardTable from '@/components/dashboard/DashboardTable';
import Image from 'next/image';
import drop from '@/assets/dropdown.svg';

const DsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const meString = localStorage.getItem('rcaappuser');
  const [allTerms, setAllTerms] = useState<any>([]);
  const [data, setData] = useState<any>();
  const [err, setErr] = useState<any>();
  const me = meString ? JSON.parse(meString) : null;
  const [activeFilter, setActiveFilter] = useState('term');
  const [activeTerm, setActiveTerm] = useState<any>();

  const getDashboard = (id: string) => {
    setLoading(true);
    AuthApi.get(`/dashboard/logged-in-ds/${id}`)
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
    activeTerm && activeTerm.id && getDashboard(activeTerm.id);
  }, [activeTerm]);

  useEffect(() => {
    const fetch = async () => {
      const years = await getAcademicYears();
      const termPromises = years.data.map((year: any) => getTermsInYear(year.id));
      const termResponses = await Promise.all(termPromises);
      const allTerms = termResponses.flatMap((response, index) =>
        response.data.map((term: any) => ({
          ...term,
          name: `${years.data[index].name} ${term.name.replace('_', ' ')}`,
        })),
      );
      allTerms.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setAllTerms(allTerms);
      // const secondLastTermId = allTerms.length >= 2 ? allTerms[1].id : allTerms[0]?.id;
      // if (secondLastTermId) {
      //   getDashboard(secondLastTermId);
      // }
      setActiveTerm(allTerms[0]);
      setActiveFilter(allTerms[0].name);
    };

    fetch();
  }, []);

  const promsColumns = [
    {
      name: 'Promotion',
      getter: (data: any) => `${data.myClass.className} `,
    },
    {
      name: 'Overall Performance',
      getter: (data: any) => (data.performance ? data.performance : '100%'),
    },
  ];

  const classesPerformanceColumns = [
    {
      name: 'Class',
      getter: (data: any) => `${data.myClass.className} `,
    },
    {
      name: 'Overall Performance',
      getter: (data: any) =>
        ((data.myClass.studentsNumber * 40 - data.disciplineMarks) /
          (data.myClass.studentsNumber * 40)) *
          100 !=
        0
          ? (
              ((data.myClass.studentsNumber * 40 - data.disciplineMarks) /
                (data.myClass.studentsNumber * 40)) *
              100
            ).toFixed(2) + '%'
          : '100%',
    },
  ];

  const groupByPromotion = (classes: any) => {
    const grouped: { Year1: any; Year2: any; Year3: any } = { Year1: [], Year2: [], Year3: [] };

    classes.forEach((classData: any) => {
      const className = classData.myClass.className;
      if (className.includes('1')) {
        grouped.Year1.push(classData);
      } else if (className.includes('2')) {
        grouped.Year2.push(classData);
      } else if (className.includes('3')) {
        grouped.Year3.push(classData);
      }
    });

    return grouped;
  };

  const calculateAveragePerformance = (classGroup: any) => {
    const totalPerformance = classGroup.reduce((acc: number, classData: any) => {
      return (
        acc +
        ((classData.myClass.studentsNumber * 40 - classData.disciplineMarks) /
          (classData.myClass.studentsNumber * 40)) *
          100
      );
    }, 0);
    return (totalPerformance / classGroup.length).toFixed(2) + '%';
  };

  const groupedClasses: any = data ? groupByPromotion(data.classDisciplineResponseDTOList) : {};

  const promotionsPerformanceData = [
    {
      myClass: { className: 'Year 1' },
      disciplineMarks: 0,
      studentsNumber: 0,
      performance: calculateAveragePerformance(groupedClasses.Year1 || []),
    },
    {
      myClass: { className: 'Year 2' },
      disciplineMarks: 0,
      studentsNumber: 0,
      performance: calculateAveragePerformance(groupedClasses.Year2 || []),
    },
    {
      myClass: { className: 'Year 3' },
      disciplineMarks: 0,
      studentsNumber: 0,
      performance: calculateAveragePerformance(groupedClasses.Year3 || []),
    },
  ];

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
  return (
    <div className="flex flex-row gap-5  text-sm h-full">
      <div className="flex flex-col w-full p-3">
        <div className="flex items-center justify-between">
          <p className="text-[15px]  mt-2 text-slate-800">
            {getGreeting()} <span className="font-extrabold">{me ? me.username : ' '}</span>
          </p>
          <div className="flex items-center gap-2 ">
            <p className="text-xs text-primary font-bold">View Analytics from </p>
            <Dropdown className="bg-[#E3E1EC]">
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  className="border-[1px] border-primary rounded-lg py-3 px-4 text-[80%]"
                >
                  Filter by <span className="ml-2 text-primary font-bold">{activeFilter}</span>
                  <Image src={drop} alt="" className="w-3 h-3 ml-2" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu className="rounded-lg">
                {allTerms?.map((term: any, i: number) => {
                  return (
                    <DropdownItem
                      key={i}
                      value={term?.name}
                      className=" hover:bg-[#52387389]"
                      onClick={() => {
                        setActiveFilter(term.name.replace('_', ' '));
                        setActiveTerm(term);
                      }}
                    >
                      {term?.name}
                    </DropdownItem>
                  );
                })}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <>
          <div className="">
            <Carousel
              responsive={responsive}
              autoPlay
              arrows={false}
              transitionDuration={2000}
              className="my-3"
              infinite
            >
              <Link
                href={'/student/appeals'}
                className="bg-[rgba(8,40,210,0.09)] border  border-[rgba(8,40,210,0.47)]  text-[rgba(8,40,210,0.47)] rounded-md  py-10  p-5 flex flex-col  gap-3 items-end justify-center mx-1.5 h-full"
              >
                <p className="font-extrabold text-[27px] text-right">
                  {loading
                    ? '--'
                    : data && data.totalMarksRegistered
                      ? `${(
                          ((40 * data.studentsNumber - data.totalMarksRegistered) /
                            (40 * data.studentsNumber)) *
                          100
                        ).toFixed(2)}%`
                      : '100%'}
                </p>

                <p className="font-extrabold text-xs text-right">School Performance</p>
              </Link>
              <Link
                href={'/student/appeals'}
                className="bg-[rgba(8,40,210,0.09)] border  border-[rgba(8,40,210,0.47)]  text-[rgba(8,40,210,0.47)] rounded-md  py-10  p-5 flex flex-col  gap-3 items-end justify-center mx-1.5 h-full"
              >
                <p className="font-extrabold text-[27px] text-right">
                  {loading ? '--' : data && data.worstClass ? data.worstClass : 'None'}
                </p>

                <p className="font-extrabold text-xs text-right">Worst Class</p>
              </Link>
              <Link
                href={'/student'}
                className="bg-[rgba(82,56,115,0.17)] border  border-[rgba(82,56,115,0.55)] text-[rgba(82,56,115,0.55)] rounded-md  py-10  p-5 flex flex-col  gap-3 items-end justify-center mx-1.5 h-full"
              >
                <p className="font-extrabold text-[27px] text-right">
                  {loading ? '--' : data && data.bestClass ? data.bestClass : 'None'}
                </p>
                <p className="font-extrabold text-xs text-right">Best Class</p>
              </Link>

              <Link
                href={'/student/deductions'}
                className="bg-[rgba(82,56,115,0.17)] border  border-[rgba(82,56,115,0.55)] text-[rgba(82,56,115,0.55)] rounded-md  py-10  p-5 flex flex-col  gap-3 items-end justify-center mx-1.5 h-full"
              >
                <p className="font-extrabold text-[27px] text-right">
                  {' '}
                  {loading ? '--' : data && data.casesNumber ? data.casesNumber : '0'}
                </p>
                <p className="font-extrabold text-xs text-right">Discipline Cases</p>
              </Link>
              <Link
                href={'/student/courses'}
                className="bg-[rgba(82,56,115,0.17)] border  border-[rgba(82,56,115,0.55)] text-[rgba(82,56,115,0.55)] rounded-md  py-10  p-5 flex flex-col  gap-3 items-end justify-center mx-1.5 h-full"
              >
                <p className="font-extrabold text-[27px] text-right">
                  {loading ? '--' : data && data.dsAppealsNumber ? data.dsAppealsNumber : '0'}
                </p>
                <p className="font-extrabold text-xs text-right">Appeals</p>
              </Link>
              <Link
                href={'/student/'}
                className="bg-[rgba(8,40,210,0.09)] border  border-[#0828d278]  text-[rgba(8,40,210,0.47)] rounded-md  py-10  p-5 flex flex-col  gap-3 items-end justify-center mx-1.5 h-full"
              >
                <p className="font-extrabold text-[27px] text-right">
                  {loading ? '--' : data && data.studentsNumber ? data.studentsNumber : '0'}
                </p>
                <p className="font-extrabold text-xs text-right">Students</p>
              </Link>
            </Carousel>
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 my-5 gap-5">
              {/* <div className="">
                <div className="flex flex-row justify-between items-center">
                  <p className="font-semibold">Cases</p>
                  <Link
                    href={'/student/performance'}
                    className="text-[#3C64CA] font-semibold text-[12px]"
                  >
                    View more
                  </Link>
                </div>
                <DiscplineCasesForDS />
              </div> */}
              <DashboardTable
                columns={promsColumns}
                data={promotionsPerformanceData}
                loading={loading}
                // filter={allTerms}
                // onFilterchange={getDashboard}
                // selectedFilter={allTerms.length >= 2 ? allTerms[1] : allTerms[0]}
                title="Promotions' Performance"
              />
              <DashboardTable
                columns={classesPerformanceColumns}
                data={(data?.classDisciplineResponseDTOList || []).sort((a: any, b: any) => {
                  const avgA =
                    ((a.myClass.studentsNumber * 40 - a.disciplineMarks) /
                      (a.myClass.studentsNumber * 40)) *
                    100;
                  const avgB =
                    ((b.myClass.studentsNumber * 40 - b.disciplineMarks) /
                      (b.myClass.studentsNumber * 40)) *
                    100;
                  return avgA - avgB;
                })}
                loading={loading}
                // filter={allTerms}
                // onFilterchange={getDashboard}
                // selectedFilter={allTerms.length >= 2 ? allTerms[1] : allTerms[0]}
                title="Classes with Worst Performance"
              />
            </div>
          </div>
        </>
      </div>
    </div>
  );
};

export default DsDashboard;
