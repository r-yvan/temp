import { IClass } from '@/types/class.type';
import { ICourse } from '@/types/course.type';
import { GroupedCourse } from '@/utils/funcs/func3';
import Link from 'next/link';
import { FC, useState } from 'react';

interface Props {
  course: GroupedCourse | null;
  academicYearId: string;
  termId: string;
}

const ViewCourseClasses: FC<Props> = ({ course, academicYearId, termId }) => {
  console.log(course);
  return (
    <div className="flex flex-col mt-5 gap-y-3">
      {course?.classes?.map((classItem, i) => {
        return (
          <Link
            href={`/staff/courses/${course?.course.courseName}/${classItem.className}?courseId=${course?.course.id}&classId=${classItem.id}&academicYearId=${academicYearId}&termId=${termId}`}
            key={i}
            className="w-full bg-mainPurple hover:bg-purple-950 duration-300 py-2 text-white rounded-md overflow-hidden"
          >
            <h6 className="  bg-inherit text-center cursor-pointer ">{classItem.className}</h6>
          </Link>
        );
      })}
      {course && course.classes.length === 0 && (
        <h1 className="text-center">No Classes assigned to this course</h1>
      )}
      {/* {loading && (
        <div className="flex flex-col gap-y-3">
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={40} />
        </div>
      )} */}
    </div>
  );
};

export default ViewCourseClasses;
