import React, { useState } from "react";
import Card from "./Cards";

const HospitalGrid = ({ hospitals }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const totalPages = Math.ceil(hospitals.length / perPage) || 1;
  const startIndex = (currentPage - 1) * perPage;
  const currentHospitals = hospitals.slice(startIndex, startIndex + perPage);

  return (
    <div className="flex flex-col ">
  {/* Grid of cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white ">
    {currentHospitals.length === 0 ? (
      <div className="col-span-full text-center text-gray-500 py-10">No hospitals found.</div>
    ) : (
      currentHospitals.map((hospital, idx) => (
        <Card key={idx} hospital={hospital} />
      ))
    )}
  </div>


 
    </div>
  );
};

export default HospitalGrid;
