import React from "react";
import TireSearch from "@/components/globals/TireSearch";
import { getTireSizesForSearch, getCarDataForSearch } from "@/actions";

const Page = async () => {
  // Fetch tire search data from database
  const [tireSizesResult, carDataResult] = await Promise.all([
    getTireSizesForSearch(),
    getCarDataForSearch(),
  ]);

  const searchBySize = tireSizesResult.data || {};
  const searchByCar = carDataResult.data || [];

  return (
    <div className="min-h-screen pt-30">
      <div className="bg-hero w-full flex flex-col items-center justify-center py-20 min-h-[70vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-10">
            <h1 className="text-white font-bold text-5xl md:text-6xl tracking-tight mb-4">
              Tire Selector
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto">
              Find the perfect tires for your vehicle by searching by size or car model
            </p>
          </div>
          <div className="flex justify-center">
            <TireSearch
              searchBySize={searchBySize}
              searchByCar={searchByCar}
              className="w-full max-w-4xl"
            />
          </div>
        </div>
      </div>

      {/* Info Section */}
      <section className="py-16 bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-primary mb-4">
                Search by Tire Size
              </h3>
              <p className="text-gray-600 mb-4">
                Know your tire dimensions? Search using width, aspect ratio, and rim diameter to find compatible tires quickly.
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Enter tire width (e.g., 205)</li>
                <li>Select aspect ratio (e.g., 50)</li>
                <li>Choose rim diameter (e.g., 16)</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-primary mb-4">
                Search by Car Model
              </h3>
              <p className="text-gray-600 mb-4">
                Not sure about tire sizes? Simply select your car brand, model, and year to see all compatible tires.
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Select your car brand</li>
                <li>Choose your car model</li>
                <li>Pick the year of your vehicle</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;

