"use client";
import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SEARCH_BY_CAR, SEARCH_BY_SIZE } from "@/constants";
import {
  IconCarFilled,
  IconCircleCheckFilled,
  IconWheel,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const TABS = [
  { id: "size", label: "Search by size", icon: IconWheel },
  { id: "car", label: "Search by car", icon: IconCarFilled },
];

const TireSearch = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"size" | "car">("size");
  const [isOpen, setIsOpen] = React.useState<{
    toggle: boolean;
    key: "size" | "car" | null;
  }>({
    toggle: false,
    key: null,
  });

  // --- STATE FOR SEARCH BY SIZE ---
  const [selectedWidth, setSelectedWidth] = React.useState("");
  const [selectedAspect, setSelectedAspect] = React.useState("");
  const [selectedRim, setSelectedRim] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");

  // --- STATE FOR SEARCH BY CAR ---
  const [selectedBrand, setSelectedBrand] = React.useState("");
  const [selectedModel, setSelectedModel] = React.useState("");
  const [selectedYear, setSelectedYear] = React.useState("");
  const [searchCarInput, setSearchCarInput] = React.useState("");

  // --- DERIVED OPTIONS FOR SIZE ---
  const widthOptions = Object.keys(SEARCH_BY_SIZE);
  const aspectOptions =
    selectedWidth && SEARCH_BY_SIZE[selectedWidth]
      ? Object.keys(SEARCH_BY_SIZE[selectedWidth])
      : [];
  const rimOptions =
    selectedWidth &&
    selectedAspect &&
    SEARCH_BY_SIZE[selectedWidth][selectedAspect]
      ? SEARCH_BY_SIZE[selectedWidth][selectedAspect]
      : [];

  // --- DERIVED OPTIONS FOR CAR ---
  const brandOptions = SEARCH_BY_CAR.map((b) => b.make);
  const modelOptions =
    selectedBrand !== ""
      ? SEARCH_BY_CAR.find((b) => b.make === selectedBrand)?.models || {}
      : {};
  const yearOptions =
    selectedModel !== "" ? modelOptions[selectedModel] || [] : [];

  const handleSearch = () => {
    if (isOpen.key === "size") {
      if (selectedWidth && selectedAspect && selectedRim) {
        const query = `/tire-search?width=${selectedWidth}&ratio=${selectedAspect}&diameter=${selectedRim}`;
        router.push(query);
      }
    } else if (isOpen.key === "car") {
      if (selectedBrand && selectedModel && selectedYear) {
        const query = `/tire-search?brand=${selectedBrand}&model=${selectedModel}&year=${selectedYear}`;
        router.push(query);
      }
    }
  };

  // --- HELPERS FOR FILTERING ---
  const filterList = (list: string[], search: string) => {
    return list.filter((item) =>
      item.toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <>
      {/* ---- MODAL ---- */}
      {isOpen.toggle && (
        <div className="bg-primary fixed inset-0 flex flex-col items-center pt-30 w-full overflow-hidden h-screen z-50">
          <div
            onClick={() => setIsOpen({ toggle: false, key: null })}
            className="absolute size-12 top-7 right-7 border border-white rounded-full flex items-center justify-center cursor-pointer"
          >
            <XIcon className="size-7 text-white" />
          </div>

          {/* ---- SIZE FLOW ---- */}
          {isOpen.key === "size" && (
            <div className="flex max-w-7xl gap-20 mx-auto items-start">
              {/* Left preview */}
              <div className="bg-[#c02b2b] w-[400px] rounded-2xl p-8">
                <h3 className="font-semibold text-white text-lg mb-5">
                  About your Dimension
                </h3>
                {/* Steps preview */}
                {[
                  { label: "Width", value: selectedWidth },
                  { label: "Ratio", value: selectedAspect },
                  { label: "Diameter", value: selectedRim },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between mb-5 last:mb-0"
                  >
                    <span className="text-zinc-200">{label}</span>
                    {value ? (
                      <div className="bg-[#e8f5e5] rounded-full py-1 px-2 gap-1 flex items-center">
                        <span className="text-[#2e7d32] text-sm">{value}</span>
                        <IconCircleCheckFilled className="text-[#2e7d32] size-4" />
                      </div>
                    ) : (
                      <div className="bg-zinc-200 size-8 rounded-full flex items-center justify-center">
                        <Loader className="text-red-500 size-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Right side content */}
              <div className="w-[700px]">
                {/* Reset */}
                <div
                  className="flex cursor-pointer text-white items-center gap-2"
                  onClick={() => {
                    setSelectedWidth("");
                    setSelectedAspect("");
                    setSelectedRim("");
                  }}
                >
                  <ChevronLeft className="size-7" />
                  Reset my search
                </div>

                <div className="flex items-start -mt-5 justify-between">
                  {/* Step Title */}
                  <h3 className="font-semibold mt-14 text-white text-2xl">
                    {selectedWidth === ""
                      ? "Please enter the width..."
                      : selectedAspect === ""
                      ? "Please enter the ratio..."
                      : selectedRim === ""
                      ? "Please enter the diameter..."
                      : "All set!"}
                  </h3>

                  <div className="relative size-60">
                    <Image
                      src="https://adzktgbqdq.cloudimg.io/https://dgaddcosprod.blob.core.windows.net/cxf-multisite/clsnd2leu002711ow8tgx7mfc/attachments/g1op4dopzho9s4qrm03ynut2-ts-ref-tyre-4w-step-02.one-third.png"
                      alt="Tire Size"
                      fill
                      className="object-contain size-full"
                    />
                  </div>
                </div>

                {/* Search input */}
                <div className="flex items-center w-full -mt-13 bg-white rounded-2xl px-5 py-4">
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={`Select your tire ${
                      selectedWidth === ""
                        ? "width"
                        : selectedAspect === ""
                        ? "ratio"
                        : "diameter"
                    }...`}
                    className="w-full border-none outline-none"
                  />
                  <SearchIcon className="ml-auto size-5" />
                </div>

                {/* Options list */}
                <div className="space-y-3 overflow-y-auto mt-5 pr-5 max-h-[50vh]">
                  {selectedWidth === "" &&
                    filterList(widthOptions, searchInput).map((item) => (
                      <OptionItem
                        key={item}
                        label={item}
                        onClick={() => setSelectedWidth(item)}
                      />
                    ))}

                  {selectedWidth !== "" &&
                    selectedAspect === "" &&
                    filterList(aspectOptions, searchInput).map((item) => (
                      <OptionItem
                        key={item}
                        label={item}
                        onClick={() => setSelectedAspect(item)}
                      />
                    ))}

                  {selectedWidth !== "" &&
                    selectedAspect !== "" &&
                    selectedRim === "" &&
                    filterList(rimOptions.map(String), searchInput).map(
                      (item) => (
                        <OptionItem
                          key={item}
                          label={item}
                          onClick={() => setSelectedRim(item)}
                        />
                      )
                    )}
                </div>

                {/* Final search */}
                {selectedWidth && selectedAspect && selectedRim && (
                  <Button variant="secondary" className="mt-6" onClick={handleSearch}>
                    Search
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* ---- CAR FLOW ---- */}
          {isOpen.key === "car" && (
            <div className="flex max-w-7xl gap-20 mx-auto items-start">
              {/* Left preview */}
              <div className="bg-[#c02b2b] w-[400px] rounded-2xl p-8">
                <h3 className="font-semibold text-white text-lg mb-5">
                  About your Car
                </h3>
                {[
                  { label: "Brand", value: selectedBrand },
                  { label: "Model", value: selectedModel },
                  { label: "Year", value: selectedYear },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between mb-5 last:mb-0"
                  >
                    <span className="text-zinc-200">{label}</span>
                    {value ? (
                      <div className="bg-[#e8f5e5] rounded-full py-1 px-2 gap-1 flex items-center">
                        <span className="text-[#2e7d32] text-sm">{value}</span>
                        <IconCircleCheckFilled className="text-[#2e7d32] size-4" />
                      </div>
                    ) : (
                      <div className="bg-zinc-200 size-8 rounded-full flex items-center justify-center">
                        <Loader className="text-red-500 size-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Right side */}
              <div className="w-[700px]">
                {/* Reset */}
                <div
                  className="flex cursor-pointer text-white items-center gap-2"
                  onClick={() => {
                    setSelectedBrand("");
                    setSelectedModel("");
                    setSelectedYear("");
                  }}
                >
                  <ChevronLeft className="size-7" />
                  Reset my search
                </div>

                <div className="flex items-start -mt-5 justify-between">
                  <h3 className="font-semibold mt-14 text-white text-2xl">
                    {selectedBrand === ""
                      ? "Please select the brand..."
                      : selectedModel === ""
                      ? "Please select the model..."
                      : selectedYear === ""
                      ? "Please select the year..."
                      : "All set!"}
                  </h3>
                  <div className="relative size-64">
                    <Image
                      src="/car.png"
                      alt="Car"
                      fill
                      className="object-contain size-full"
                    />
                  </div>
                </div>

                {/* Search input */}
                <div className="flex items-center w-full -mt-22 bg-white rounded-2xl px-5 py-4">
                  <input
                    value={searchCarInput}
                    onChange={(e) => setSearchCarInput(e.target.value)}
                    placeholder={`Select your car ${
                      selectedBrand === ""
                        ? "brand"
                        : selectedModel === ""
                        ? "model"
                        : "year"
                    }...`}
                    className="w-full border-none outline-none"
                  />
                  <SearchIcon className="ml-auto size-5" />
                </div>

                {/* Options */}
                <div className="space-y-3 overflow-y-auto mt-5 pr-5 max-h-[50vh]">
                  {selectedBrand === "" &&
                    filterList(brandOptions, searchCarInput).map((item) => (
                      <OptionItem
                        key={item}
                        label={item}
                        onClick={() => setSelectedBrand(item)}
                      />
                    ))}

                  {selectedBrand !== "" &&
                    selectedModel === "" &&
                    filterList(Object.keys(modelOptions), searchCarInput).map(
                      (item) => (
                        <OptionItem
                          key={item}
                          label={item}
                          onClick={() => setSelectedModel(item)}
                        />
                      )
                    )}

                  {selectedModel !== "" &&
                    selectedYear === "" &&
                    filterList(yearOptions.map(String), searchCarInput).map(
                      (item) => (
                        <OptionItem
                          key={item}
                          label={item}
                          onClick={() => setSelectedYear(item)}
                        />
                      )
                    )}
                </div>

                {/* Final search */}
                {selectedBrand && selectedModel && selectedYear && (
                  <Button className="mt-6" onClick={handleSearch}>
                    Search
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---- MAIN CARD ---- */}
      <div className="w-full h-[200px] max-w-4xl mx-auto">
        <div className="w-full px-5 h-full bg-primary shadow-xl rounded-2xl py-5 overflow-hidden">
          {/* Tabs */}
          <div className="flex w-full border-b gap-5 items-center">
            {TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "size" | "car")}
                  className={`py-2 px-5 cursor-pointer ${
                    isActive ? "border-b-2" : "bg-transparent"
                  } flex items-center gap-2.5`}
                >
                  <tab.icon
                    className={`size-7 ${
                      isActive ? "text-white" : "text-zinc-300"
                    }`}
                  />
                  {isActive && (
                    <p
                      className={`tracking-tight ${
                        isActive ? "text-white" : "text-zinc-300"
                      } font-medium`}
                    >
                      {tab.label}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Animated Tab Content */}
          <div className="relative bg-white mt-5 w-full px-5 py-5 rounded-2xl">
            <AnimatePresence mode="wait">
              {activeTab === "size" && (
                <motion.div
                  key="size"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 50, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full cursor-pointer flex items-center justify-between"
                  onClick={() => setIsOpen({ toggle: true, key: "size" })}
                >
                  <CardItem label="Dimension" img="/tire.svg" />
                </motion.div>
              )}
              {activeTab === "car" && (
                <motion.div
                  key="car"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full cursor-pointer flex items-center justify-between"
                  onClick={() => setIsOpen({ toggle: true, key: "car" })}
                >
                  <CardItem label="Car" img="/car.svg" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default TireSearch;

/* ---- REUSABLE SUB-COMPONENTS ---- */
const OptionItem = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <div
    className="flex rounded-2xl cursor-pointer items-center justify-between hover:bg-zinc-200/50 px-3 py-2"
    onClick={onClick}
  >
    <span className="text-white">{label}</span>
    <ChevronRight className="size-5 text-white" />
  </div>
);

const CardItem = ({ label, img }: { label: string; img: string }) => (
  <>
    <div className="flex items-center gap-5">
      <div className="relative size-12">
        <Image src={img} alt={label} fill className="object-contain" />
      </div>
      <div>
        <p className="text-muted-foreground text-sm">Search by</p>
        <p className="font-medium">{label}</p>
      </div>
    </div>
    <Button size="icon" className="rounded-full p-5">
      <ChevronRight className="size-7" />
    </Button>
  </>
);
