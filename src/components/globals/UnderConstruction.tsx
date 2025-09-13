import Image from "next/image";
import React from "react";

const UnderConstruction = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh]">
      <Image
        src="/construction.svg"
        alt="Under Construction"
        width={250}
        height={250}
      />
      <h3 className="font-semibold mt-3">
        This page is under construction. Please check back later.
      </h3>
      <p className="text-sm text-muted-foreground mt-1">
        We&apos;re working hard to bring you new features and improvements.
        Thank you for your patience!
      </p>
    </div>
  );
};

export default UnderConstruction;
