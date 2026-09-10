import useGet from '@/hooks/useGet';
import { MARK_TYPE } from '@/types/marks.type';
import { AuthApi, backend } from '@/utils/constants';
import { exportToExcel, handleFilter } from '@/utils/funcs';
import { Button } from '@mantine/core';
import { getCookie } from 'cookies-next';
import React, { useState } from 'react';
import { BsFileExcel } from 'react-icons/bs';

interface Props {
  data?: any[];
  onClose: () => void;
  tableName?: string;
  classId: string | null;
  term_id: string | null;
  weight?: number | null;
  courseId?: string | null;
}

const ExportTemplate = ({ onClose, tableName, term_id, classId, weight, courseId }: Props) => {
  const [markType, setMarkType] = useState<MARK_TYPE>(MARK_TYPE.CAT);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${backend}/exporting/students/marking-template?classId=${classId}&termId=${term_id}&markType=${markType}&weight=${weight}&courseId=${courseId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${getCookie('token')}`,
          },
        },
      );
      const data = await res.blob();
      //save file
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tableName}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      onClose();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-y-3">
      <p className=" text-center">Select mark type to be initialized</p>
      <div className="flex w-full justify-center">
        <>
          <button
            className={`py-2  text-[80%] px-5 rounded-lg ${
              markType != 'CAT'
                ? 'bg-[#43434305] text-[bg-primary] '
                : 'bg-primary text-white font-bold'
            }`}
            onClick={() => setMarkType(MARK_TYPE.CAT)}
          >
            CAT
          </button>
          <button
            className={`py-2 ml-[-10px] text-[80%] px-5 rounded-lg ${
              markType != 'EXAM'
                ? 'bg-[#43434305] text-[bg-primary] '
                : 'bg-primary text-white font-bold'
            }`}
            onClick={() => setMarkType(MARK_TYPE.EXAM)}
          >
            EXAM
          </button>
        </>
      </div>
      <Button
        className="flex items-center wf-fit mx-auto"
        color="green"
        loading={loading}
        disabled={loading}
        onClick={handleExport}
      >
        <BsFileExcel className="mr-2" />
        Export Excel
      </Button>
    </div>
  );
};

export default ExportTemplate;
