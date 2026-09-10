import React from 'react';
import Image from 'next/image';

const RcaLogo = () => {
  return (
    <div className="flex items-center cursor-pointer h-11 w-fit ">
      <Image
        alt="Logo"
        src={'/logo.png'}
        width={50}
        height={100}
        className=" md:ml-0 ml-9 h-full"
      />
      <span className=" break-words w-full leading-[1] text-[0.5em]">
        Rwanda <br />
        <span className="text-[1.3em] font-semibold">Coding</span> <br />
        Academy
      </span>
    </div>
  );
};

export default RcaLogo;
