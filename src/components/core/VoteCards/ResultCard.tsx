'use client';
import Image, { StaticImageData } from 'next/image';
import { MouseEventHandler, useState } from 'react';
import { FaCircleCheck } from 'react-icons/fa6';
interface VoteCardProps {
  candidateData: {
    firstName: string;
    lastName: string;
    currentClass: string;
    image: string | StaticImageData;
    position?: string;
    onSelect?: MouseEventHandler<HTMLDivElement>;
  };
}

const ResultCard = ({ candidateData }: VoteCardProps) => {
  const { firstName, lastName, currentClass, image } = candidateData;
  const [selected, setSelected] = useState(false);
  const handleSelect = () => {
    setSelected(!selected);
  };
  return (
    <div
      className={`w-full h-full flex items-center justify-center gap-4 ${
        selected ? 'bg-[#29375A]' : 'bg-[#F2F6FF]'
      } border border-[#29375A] rounded-lg relative px-3 pb-3 cursor-pointer pt-5`}
    >
      <Image src={image} alt="" className="rounded-full" />
      <div className={`${selected ? 'text-white' : 'text-black'} flex flex-col items-start`}>
        <h4 className="font-bold text-[60%]">
          Name: <span className="font-medium">{firstName + ' ' + lastName}</span>
        </h4>
        <h4 className="font-bold text-[60%]">
          Class: <span className="font-medium">{currentClass}</span>{' '}
        </h4>
      </div>

      <span className="absolute top-2 right-2">
        <FaCircleCheck size={20} color={`${selected ? '#FFF' : '#29375A'}`} />
      </span>
    </div>
  );
};
export default ResultCard;
