import React, { FC, useEffect } from 'react';
import AsyncSelect from '../core/selects/AsyncSelect';
import { Student } from '@/types/student.types';
import { Button, Input, Select, Textarea } from '@mantine/core';
import InputWrapper from '../core/Input/InputWrapper';
import { useSearchParams } from 'next/navigation';
import { BiCheck } from 'react-icons/bi';
import { AuthApi } from '@/utils/constants';
import { notifications } from '@mantine/notifications';
import { getResError } from '@/utils/fetch';
import { IMark } from '@/types/marks.type';
import useGet from '@/hooks/useGet';
import { ICourse } from '@/types/course.type';

interface Props {
  student: Student | null;
  refetch: () => void;
  onClose: () => void;
}

const AddUpdateStudentMarks: FC<Props> = ({ student, onClose, refetch }) => {
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId');
  const courseId = searchParams.get('courseId');
  const acaYearId = searchParams.get('academicYearId');
  const termId = searchParams.get('termId');
  const { data: course, loading: loadingCourse } = useGet<ICourse>(`/courses/id/${courseId}`, {
    defaultData: {},
  });
  const [currentMark, setCurrentMark] = React.useState<IMark | null>(null);
  const [marks, setMarks] = React.useState({
    comment: '',
    courseId,
    markType: '',
    marks: '' as string | number,
    studentId: student?.id ?? '',
    termId: '',
    passMark:
      currentMark?.passMark ?? course?.passMark ?? (undefined as string | number | undefined),
    weight:
      currentMark?.weight ?? course?.courseWeight ?? (undefined as string | number | undefined),
  });
  const [loading, setLoading] = React.useState(false);
  const [loadingMark, setLoadingMark] = React.useState(false);
  const [savedMarks, setSavedMarks] = React.useState<IMark[]>([]);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateMarks()) return;
    setLoading(true);
    try {
      const res = await AuthApi.post('/academicMarks/create', marks);

      notifications.show({
        title: 'Marks Created',
        message: 'Marks has been created successfully',
        color: 'green',
      });
      refetch();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: getResError(error),
        color: 'red',
      });
    }
    setLoading(false);
    // refetch();
    onClose();
  };

  const getStudentMarksInCourse = async () => {
    setLoadingMark(true);
    try {
      const res = await AuthApi.get(`/academicMarks/all/academic-year/term/course/student`, {
        params: {
          student: student?.id,
          course: courseId,
          'academic-year': acaYearId,
          term: marks.termId,
        },
      });

      setSavedMarks(res?.data?.data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: getResError(error, "Failed to get student's marks"),
        color: 'red',
      });
    }
    setLoadingMark(false);
  };

  const validateMarks = () => {
    if (marks.marks > (marks.weight ?? 0)) {
      setError('Marks cannot be greater than weight');
      return false;
    }
    // check if weight,pasmark, marks are numbers
    if (
      isNaN(Number(marks.marks)) ||
      isNaN(Number(marks.weight))
      // ||isNaN(Number(marks.passMark))
    ) {
      setError('Please enter a valid numbers for marks, weight and passmark');
      return false;
    }
    return true;
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateMarks()) return;
    setLoading(true);
    try {
      const res = await AuthApi.put(`/academicMarks/update/${currentMark?.id}`, marks);

      notifications.show({
        title: 'Marks Updated',
        message: 'Marks has been updated successfully',
        color: 'green',
      });
      refetch();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: getResError(error),
        color: 'red',
      });
    }
    setLoading(false);
    // refetch();
    onClose();
  };

  useEffect(() => {
    if (!student || !marks.termId) return;
    getStudentMarksInCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student, marks.termId]);

  useEffect(() => {
    if (!marks.markType) return;
    const savedMark = savedMarks.find((mark) => mark.markType === marks.markType);

    if (savedMark) setCurrentMark(savedMark);
    else setCurrentMark(null);
  }, [savedMarks, marks]);

  useEffect(() => {
    if (!course) return;
    if (currentMark) {
      setMarks({
        ...marks,
        weight: currentMark.weight,
        passMark: currentMark.passMark,
      });
      return;
    }
    setMarks({
      ...marks,
      weight: course.courseWeight,
      passMark: course.passMark,
    });
  }, [course, currentMark]);

  return (
    <form onSubmit={currentMark ? handleUpdate : handleSubmit} className="flex mt-4 flex-col gap-2">
      {loadingMark && (
        <h1 className=" text-sm text-center opacity-70 text-mainPurple">
          Please wait while fetching student mark
        </h1>
      )}
      {!currentMark && !loadingMark && marks.markType !== '' && (
        <h1 className=" text-sm text-center opacity-70 text-mainPurple">No Current mark found</h1>
      )}
      <InputWrapper className=" w-full" label="Mark Term">
        <AsyncSelect
          datasrc={`/terms/all/academic-year/${acaYearId}`}
          variant="unstyled"
          onChange={(e) => setMarks({ ...marks, termId: e })}
          value={marks.termId}
          placeholder="Select term"
        />
      </InputWrapper>
      <InputWrapper className=" w-full" label="Mark Type">
        <Select
          data={['CAT', 'EXAM']}
          variant="unstyled"
          onChange={(e) => {
            if (!e) return;
            setMarks({ ...marks, markType: e });
          }}
          value={marks.markType}
          px={8}
          placeholder="Select Mark Type"
          required
        />
      </InputWrapper>
      {currentMark && (
        <div className="flex items-center px-2 py-1 gap-3">
          <span>
            The current mark is{' '}
            <span className="font-semibold p-2 text-xl">
              {currentMark.marks}/{currentMark?.weight}
            </span>
          </span>
        </div>
      )}
      <div className="flex justify-between gap-3">
        <InputWrapper
          className=" w-full"
          label="Marks"
          error={
            marks.marks > (marks.weight ?? 0) ? 'Marks cannot be greater than weight' : undefined
          }
        >
          <Input
            type="text"
            placeholder={loadingMark ? 'getting mark ...' : 'Mark Value'}
            variant="unstyled"
            value={marks.marks}
            px={6}
            disabled={!marks.markType || loadingMark}
            onChange={(e) => {
              setMarks({ ...marks, marks: e.target.value });
            }}
          />
        </InputWrapper>
        {/* course weight */}
        <InputWrapper className=" w-full" label="Max Marks">
          <Input
            type="text"
            placeholder={loadingMark ? 'getting mark ...' : 'Weight'}
            variant="unstyled"
            value={marks?.weight}
            defaultValue={course?.courseWeight}
            px={6}
            // disabled={!marks.markType || loadingMark}
            disabled={true}
            onChange={(e) => {
              // validate if it is a number
              if (isNaN(Number(e.target.value)) && e.target.value !== '') return;
              setMarks({ ...marks, weight: Number(e.target.value) });
            }}
          />
        </InputWrapper>
      </div>
      {currentMark?.comment && (
        <InputWrapper className=" w-full" label="Current Comment">
          <Textarea
            value={currentMark?.comment}
            placeholder={loadingMark ? 'getting mark ...' : 'Current Mark Comment'}
            disabled={true}
            p={2}
            px={6}
            variant="unstyled"
            size="md"
          />
        </InputWrapper>
      )}
      <InputWrapper className=" w-full" label="Comment">
        <Textarea
          onChange={(e) => setMarks({ ...marks, comment: e.target.value })}
          value={marks.comment}
          defaultValue={currentMark?.comment}
          // placeholder="Mark Comment"
          placeholder={loadingMark ? 'getting mark ...' : 'Mark Comment'}
          disabled={!marks.markType || loadingMark}
          p={2}
          px={6}
          variant="unstyled"
          size="md"
        />
      </InputWrapper>
      {error && <span className="text-red-700 text-sm font-semibold text-center">{error}</span>}
      <Button
        disabled={loading || loadingMark}
        type="submit"
        variant="filled"
        loading={loading}
        className=" mt-4"
        w={60}
        mx={'auto'}
      >
        <BiCheck size={25} />
      </Button>
    </form>
  );
};

export default AddUpdateStudentMarks;
