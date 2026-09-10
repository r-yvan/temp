'use client';

const DeleteTeacher = ({ teacherName, onCancel, onDelete }: any) => {
  return (
    <div className="p-12 flex flex-col gap-y-8 ">
      <p className={'text-gray-600 text-center font-medium text-[1.3rem]'}>
        Are you sure you want to delete
      </p>
      <h3 className="text-gray-600 text-center font-bold text-[2.7rem] tracking-widest">
        {teacherName ?? 'Year 3 A'}
      </h3>
      <p className="text-gray-600 text-center font-medium text-[1.3rem]">
        from RCA&apos; teachers list{' '}
      </p>
      <div className="flex justify-center gap-x-12">
        <button
          className="px-6 py-2 bg-[#52387370] border border-[#52387370] rounded-lg text-purple-950 "
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="px-6 py-2 bg-purple-950 border border-purple-950 rounded-lg text-white"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
};
export default DeleteTeacher;
