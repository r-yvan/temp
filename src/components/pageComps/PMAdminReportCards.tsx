'use client';
import ViewReportCard from '@/components/academics/ViewReportCard';
import { DataTable } from '@/components/core/data-table';
import MainModal from '@/components/core/modals/modal';
import AsyncSelect from '@/components/core/selects/AsyncSelect';
import { AuthApi, baseUrl } from '@/utils/constants';
import useGet from '@/hooks/useGet';
import { IClass } from '@/types/class.type';
import { IAcademicYear, ITerm } from '@/types/other.type';
import { Student } from '@/types/student.types';
import { ActionIcon, Button, Input, Select, Modal, Table, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { HiDocumentReport } from 'react-icons/hi';
import { ClipLoader } from 'react-spinners';
import ReportReleasingExportPerformance from './ReportReleasing';
import { getCookie } from 'cookies-next';
import { CiSearch } from 'react-icons/ci';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';
interface Props {
  canRelease?: boolean;
}

const PMAdminReportCards = ({ canRelease }: Props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeClass, setActiveClass] = useState<string | null>(null);
  const [openReport, setOpenReport] = useState({
    status: false,
    student: null as Student | null,
    academicYearId: '',
  });
  const [openRelease, setOpenRelease] = useState<any>('');
  const [_error, setError] = useState('');
  const [loadingExport, setLoadingExport] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);
  const [validationResults, setValidationResults] = useState<{ [key: string]: boolean } | null>(
    null,
  );
  console.log('validation results', validationResults);

  const [validationModalOpen, setValidationModalOpen] = useState(false);

  const [selectedFilters, setSelectedFilters] = useState({
    academicYear: '',
    term: '',
    classId: '',
  });

  const { data: academicYears, get: fetchAcademicYears } = useGet<IAcademicYear[]>(
    '/academic-years/all',
    {
      defaultData: [],
    },
  );
  const { data: terms, get: fetchTerms } = useGet<ITerm[]>(
    selectedFilters.academicYear
      ? `/terms/all/academic-year/${selectedFilters.academicYear}`
      : '/terms/all',
    {
      defaultData: [],
    },
  );
  const { data: classes, get: fetchClasses } = useGet<IClass[]>(
    selectedFilters.academicYear
      ? `/classes/all/year/${selectedFilters.academicYear}`
      : '/classes/all',
    {
      defaultData: [],
    },
  );

  useEffect(() => {
    if (academicYears && selectedFilters.academicYear) {
      fetchTerms();
      setSelectedFilters((prev) => ({ ...prev, term: '' }));
    }
  }, [selectedFilters.academicYear, academicYears]);
  useEffect(() => {
    if (selectedFilters.academicYear) {
      fetchClasses();
      setSelectedFilters((prev) => ({ ...prev, classId: '' }));
    }
  }, [selectedFilters.academicYear]);
  useEffect(() => {
    if (academicYears)
      setSelectedFilters((prev) => ({
        ...prev,
        academicYear: academicYears?.filter((year) => year.status == 'ACTIVE')[0]?.id || '',
      }));
  }, [academicYears]);

  const {
    data: students,
    getPaginated,
    loading,
    paginateOpts,
    setPaginateOpts,
    setData,
    error,
  } = useGet<Student[]>('/students/student/search', {
    defaultData: [],
    paginated: true,
    pagination: {
      limit: 30,
    },
    query: {
      academicYearId: selectedFilters.academicYear,
      classId: selectedFilters.classId,
      termId: selectedFilters.term,
      searchQuery,
    },
  });

  useEffect(() => {
    getPaginated();
  }, [selectedFilters, searchQuery]);

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: 'firstName',
      header: 'First Name',
      cell: ({ row }) => <div>{row.getValue('firstName')}</div>,
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name',
      cell: ({ row }) => <div>{row.getValue('lastName')}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <div>{row.getValue('email')}</div>,
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ row }) => <div>{row.getValue('gender')}</div>,
    },
    {
      accessorKey: 'currentClass',
      header: 'Current Class',
      cell: ({ row }) => <div>{row.getValue<IClass>('currentClass')?.className}</div>,
    },
    {
      header: 'View Report',
      cell: ({ row }) => (
        <ActionIcon
          variant="transparent"
          onClick={() =>
            setOpenReport({
              status: true,
              student: row.original,
              academicYearId: selectedFilters.academicYear,
            })
          }
        >
          <HiDocumentReport size={25} />
        </ActionIcon>
      ),
    },
  ];

  const onReleaseReportExportPerformance = (action: string) => {
    setError('');
    setOpenRelease(action);
  };

  const handleValidateReportCards = async () => {
    if (!selectedFilters.academicYear || !selectedFilters.term || !selectedFilters.classId) {
      notifications.show({
        title: 'Error',
        message: 'Please select academic year, term, and class',
        color: 'red',
      });
      return;
    }

    setValidating(true);
    try {
      const response = await AuthApi.post('/report-cards/validate', {
        academicYearId: selectedFilters.academicYear,
        termId: selectedFilters.term,
        classId: selectedFilters.classId,
      });

      if (response.data?.success) {
        const results = response.data.data.results;
        setValidationResults(results);

        // Count valid/invalid results
        const total = Object.keys(results).length;
        const validCount = Object.values(results).filter(Boolean).length;
        const invalidCount = total - validCount;

        // Always show notification and modal
        const notificationMessage =
          invalidCount === 0
            ? `All ${total} report cards are valid and ready for release!`
            : `Found ${invalidCount} invalid report cards out of ${total}`;

        notifications.show({
          title: invalidCount === 0 ? 'Success' : 'Validation Complete',
          message: notificationMessage,
          color: invalidCount === 0 ? 'green' : 'yellow',
        });

        // Always open the modal to show results
        setValidationModalOpen(true);
      }
    } catch (error: any) {
      console.error('Error validating report cards:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to validate report cards',
        color: 'red',
      });
    } finally {
      setValidating(false);
    }
  };

  const FilterDropDown = ({
    placeholderText,
    data,
    filterKey,
  }: {
    placeholderText: string;
    data: any[];
    filterKey: keyof typeof selectedFilters;
  }) => {
    const displayValue = selectedFilters[filterKey] === 'All' ? '' : selectedFilters[filterKey];
    return (
      <Select
        data={data}
        placeholder={placeholderText}
        value={displayValue}
        onChange={(value) => setSelectedFilters((prev) => ({ ...prev, [filterKey]: value }))}
        className="w-full md:w-fit px-3 py-2 text-base text-black font-semibold  border-none outline-none"
      />
    );
  };

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-2 text-sm">
      <MainModal
        isOpen={openReport.status}
        title={`Report Card for ${openReport.student?.firstName} ${openReport.student?.lastName}`}
        onClose={() =>
          setOpenReport({
            status: false,
            student: null,
            academicYearId: '',
          })
        }
        size="1000"
        closeOnClickOutside={false}
      >
        <ViewReportCard
          student={openReport.student}
          viewAll={canRelease}
          // academicYearId={selectedFilters.academicYear}
        />
      </MainModal>
      {/* {_error && <div className="text-red-500 tex">{_error}</div>} */}
      <MainModal
        title={openRelease === 'release' ? 'Release Report Cards' : 'Export Performance'}
        tittleP="px-0"
        isOpen={openRelease}
        onClose={() => setOpenRelease(null)}
      >
        <ReportReleasingExportPerformance
          action={openRelease}
          // term={selectedFilters.term as any}
          // terms={terms as any}
          academicYear={academicYears?.find((year) => year.id === selectedFilters.academicYear)}
          setOpenRelease={setOpenRelease}
        />
      </MainModal>

      {/* Validation Results Modal */}
      <Modal
        opened={validationModalOpen}
        onClose={() => setValidationModalOpen(false)}
        title="Report Card Validation Results"
        size="xl"
        className="max-w-5xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-700 font-medium">Valid Report Cards</div>
              <div className="text-2xl font-bold text-green-700">
                {validationResults
                  ? Object.values(validationResults).filter(
                      (student: any) => !student.needsSecondSitting,
                    ).length
                  : 0}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-red-700 font-medium">Needs Second Sitting</div>
              <div className="text-2xl font-bold text-red-700">
                {validationResults
                  ? Object.values(validationResults).filter(
                      (student: any) => student.needsSecondSitting,
                    ).length
                  : 0}
              </div>
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {validationResults &&
              Object.entries(validationResults).map(([studentId, studentData]: [string, any]) => (
                <div key={studentId} className="mb-6 border rounded-lg overflow-hidden">
                  <div
                    className={`p-3 ${studentData.needsSecondSitting ? 'bg-red-50' : 'bg-green-50'} border-b`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{studentData.studentName}</h3>
                      {studentData.needsSecondSitting ? (
                        <span className="px-2 py-1 text-sm rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                          <HiXCircle size={16} /> Needs Second Sitting
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-sm rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                          <HiCheckCircle size={16} /> Valid
                        </span>
                      )}
                    </div>
                  </div>

                  <Table>
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Marks</th>
                        <th>Weight</th>
                        <th>Percentage</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentData.subjectMarks.map((subject: any, index: number) => (
                        <tr key={`${studentId}-${subject.courseId}-${index}`}>
                          <td>{subject.courseName}</td>
                          <td>{subject.marks.toFixed(2)}</td>
                          <td>{subject.courseWeight}</td>
                          <td>{subject.percentage.toFixed(2)}%</td>
                          <td>
                            {subject.needsSecondSitting ? (
                              <span className="text-red-600 flex items-center gap-1">
                                <HiXCircle size={16} /> Needs Second Sitting
                              </span>
                            ) : (
                              <span className="text-green-600 flex items-center gap-1">
                                <HiCheckCircle size={16} /> Valid
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ))}
          </div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={() => setValidationModalOpen(false)}
              className="bg-mainPurple text-white"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <div className="hidden sm:flex flex-row justify-between mb-5">
        <p className=" text-base font-semibold">RCA Students Report Cards</p>

        <div className="flex flex-row gap-3">
          <Button
            onClick={() => onReleaseReportExportPerformance('export')}
            className="rounded-md bg-mainPurple text-white font-medium px-5 py-2"
          >
            Export Performance
          </Button>
          {canRelease && (
            <Button
              onClick={() => onReleaseReportExportPerformance('release')}
              className="rounded-md bg-mainPurple text-white font-medium px-5 py-2"
            >
              Report Cards Releasing
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-col lg:flex-row items-center gap-y-3 gap-x-10 mb-5">
        <div className="relative w-full lg:w-[20rem]">
          <span className="absolute top-4 left-4">
            <CiSearch size={25} color="" />
          </span>
          <input
            name="search"
            className="w-full p-3 py-4 pl-12 text-base text-black placeholder:text-black rounded-full bg-[#005DE908] border-none outline-none"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className=" flex flex-col md:flex-row  gap-x-2 justify-end flex-grow ">
          <FilterDropDown
            filterKey="academicYear"
            placeholderText="Select Academic Year"
            data={academicYears?.map((year) => ({ label: year.name, value: year.id })) as any}
          />
          {selectedFilters.academicYear && (
            <>
              <FilterDropDown
                filterKey="term"
                placeholderText="Select Term"
                data={
                  terms?.map((term) => ({
                    label: term.name.replace('_', ' '),
                    value: term.id,
                  })) as any
                }
              />
              <FilterDropDown
                filterKey="classId"
                placeholderText="Select Class"
                data={
                  classes?.map((classItem) => ({
                    label: classItem.className,
                    value: classItem.id,
                  })) || []
                }
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleValidateReportCards}
                  loading={validating}
                  disabled={
                    !selectedFilters.academicYear ||
                    !selectedFilters.term ||
                    !selectedFilters.classId
                  }
                >
                  Validate Report Cards
                </Button>
                {canRelease && (
                  <Button
                    className="bg-primary text-white"
                    onClick={() => onReleaseReportExportPerformance('release')}
                  >
                    Release Reports
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <DataTable
        columns={columns}
        data={students ?? []}
        loading={loading}
        noDataMessage="No students found"
        paginationProps={{
          isPaginated: true,
          setPaginateOpts,
          paginateOpts,
        }}
        limit={30}
      />
    </div>
  );
};

export default PMAdminReportCards;
