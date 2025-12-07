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
import {
  IconCarFilled,
  IconCircleCheckFilled,
  IconWheel,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { SearchBySize, SearchByCar } from "@/types";

const TABS = [
  { id: "size", label: "Search by size", icon: IconWheel },
  { id: "car", label: "Search by car", icon: IconCarFilled },
];

interface TireSearchProps {
  className?: string;
  searchBySize: SearchBySize;
  searchByCar: SearchByCar[];
}

const TireSearch = ({ className, searchBySize, searchByCar }: TireSearchProps) => {
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

  // Refs to prevent multiple redirects
  const redirectedRef = React.useRef<string>("");

  // Loading states for each filter step
  const [isLoadingWidth, setIsLoadingWidth] = React.useState(false);
  const [isLoadingAspect, setIsLoadingAspect] = React.useState(false);
  const [isLoadingRim, setIsLoadingRim] = React.useState(false);
  const [isLoadingBrand, setIsLoadingBrand] = React.useState(false);
  const [isLoadingModel, setIsLoadingModel] = React.useState(false);
  const [isLoadingYear, setIsLoadingYear] = React.useState(false);

  // Full-screen loading state
  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  // --- DERIVED OPTIONS FOR SIZE ---
  const widthOptions = Object.keys(searchBySize);
  const aspectOptions =
    selectedWidth && searchBySize[selectedWidth]
      ? Object.keys(searchBySize[selectedWidth])
      : [];
  const rimOptions =
    selectedWidth &&
    selectedAspect &&
    searchBySize[selectedWidth] &&
    searchBySize[selectedWidth][selectedAspect]
      ? searchBySize[selectedWidth][selectedAspect]
      : [];

  // --- DERIVED OPTIONS FOR CAR ---
  const brandOptions = searchByCar.map((b) => b.make);
  const modelOptions =
    selectedBrand !== ""
      ? searchByCar.find((b) => b.make === selectedBrand)?.models || {}
      : {};
  const yearOptions =
    selectedModel !== "" ? modelOptions[selectedModel] || [] : [];


  // Auto-redirect when width is selected (if no ratio/diameter available or when selected)
  React.useEffect(() => {
    if (isOpen.key === "size") {
      // Check if there are any aspect ratios available for this width
      const hasAspectRatios = aspectOptions.length > 0;

      let redirectQuery = "";

      if (selectedWidth && !hasAspectRatios) {
        // No ratio available, redirect with just width
        setIsLoadingWidth(true);
        redirectQuery = `/tire-search?width=${selectedWidth}`;
      } else if (selectedAspect) {
        setIsLoadingAspect(true);
        // Check if there are diameters for this aspect ratio
        const hasDiameters = rimOptions.length > 0;

        if (!hasDiameters) {
          // No diameter available, redirect with width and ratio
          redirectQuery = `/tire-search?width=${selectedWidth}&ratio=${selectedAspect}`;
        } else if (selectedRim) {
          setIsLoadingRim(true);
          // All three selected, redirect
          redirectQuery = `/tire-search?width=${selectedWidth}&ratio=${selectedAspect}&diameter=${selectedRim}`;
        }
      }

      // Only redirect if we have a query and haven't already redirected for this combination
      if (redirectQuery && redirectedRef.current !== redirectQuery) {
        redirectedRef.current = redirectQuery;
        setIsFullScreenLoading(true);
        router.push(redirectQuery);
        // Reset loading states after a delay
        setTimeout(() => {
          setIsLoadingWidth(false);
          setIsLoadingAspect(false);
          setIsLoadingRim(false);
          setIsFullScreenLoading(false);
        }, 1000);
      } else if (!redirectQuery) {
        // Reset loading if no redirect needed
        if (!selectedWidth) setIsLoadingWidth(false);
        if (!selectedAspect) setIsLoadingAspect(false);
        if (!selectedRim) setIsLoadingRim(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWidth, selectedAspect, selectedRim, isOpen.key, aspectOptions.length, rimOptions.length]);

  // Auto-redirect for car search when model is selected and has no years
  React.useEffect(() => {
    if (isOpen.key === "car") {
      if (selectedBrand && selectedModel) {
        // Check if this model has any years available
        const modelData = searchByCar.find((b) => b.make === selectedBrand);
        const years = modelData?.models[selectedModel] || [];

        let redirectQuery = "";

        if (years.length === 0) {
          // No years available, redirect with just brand and model
          setIsLoadingModel(true);
          redirectQuery = `/tire-search?brand=${selectedBrand}&model=${selectedModel}`;
        } else if (selectedYear) {
          setIsLoadingYear(true);
          // Year selected, redirect
          redirectQuery = `/tire-search?brand=${selectedBrand}&model=${selectedModel}&year=${selectedYear}`;
        }

        // Only redirect if we have a query and haven't already redirected for this combination
        if (redirectQuery && redirectedRef.current !== redirectQuery) {
          redirectedRef.current = redirectQuery;
          setIsFullScreenLoading(true);
          router.push(redirectQuery);
          // Reset loading states after a delay
          setTimeout(() => {
            setIsLoadingBrand(false);
            setIsLoadingModel(false);
            setIsLoadingYear(false);
            setIsFullScreenLoading(false);
          }, 1000);
        } else if (!redirectQuery) {
          // Reset loading if no redirect needed
          if (!selectedModel) setIsLoadingModel(false);
          if (!selectedYear) setIsLoadingYear(false);
        }
      } else if (selectedBrand) {
        setIsLoadingBrand(true);
        // Brand selected, show loading briefly
        setTimeout(() => setIsLoadingBrand(false), 500);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand, selectedModel, selectedYear, isOpen.key]);

  // --- HELPERS FOR FILTERING ---
  const filterList = (list: string[], search: string) => {
    return list.filter((item) =>
      item.toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <>
      {/* Full-screen loading overlay */}
      {isFullScreenLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl">
            <Loader className="size-8 text-primary animate-spin" />
            <p className="text-lg font-medium text-gray-700">Loading search results...</p>
          </div>
        </div>
      )}

      {/* ---- MODAL ---- */}
      {isOpen.toggle && (
        <div className="bg-primary fixed inset-0 flex flex-col items-center pt-30 w-full overflow-hidden h-screen z-50">
          <div
            onClick={() => setIsOpen({ toggle: false, key: null })}
            className="absolute size-10 sm:size-12 top-4 right-4 sm:top-7 sm:right-7 border border-white rounded-full flex items-center justify-center cursor-pointer z-10"
          >
            <XIcon className="size-5 sm:size-7 text-white" />
          </div>

          {/* ---- SIZE FLOW ---- */}
          {isOpen.key === "size" && (
            <div className="flex flex-col lg:flex-row max-w-7xl gap-6 lg:gap-20 mx-auto items-start px-4 sm:px-6 lg:px-0">
              {/* Left preview */}
              <div className="bg-[#c02b2b] w-full lg:w-[400px] rounded-2xl p-4 sm:p-6 lg:p-8">
                <h3 className="font-semibold text-white text-lg mb-5">
                  About your Dimension
                </h3>
                {/* Steps preview */}
                {[
                  {
                    label: "Width",
                    value: selectedWidth,
                    loading: isLoadingWidth
                  },
                  {
                    label: "Ratio",
                    value: selectedAspect,
                    loading: isLoadingAspect
                  },
                  {
                    label: "Diameter",
                    value: selectedRim,
                    loading: isLoadingRim
                  },
                ].map(({ label, value, loading }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between mb-5 last:mb-0"
                  >
                    <span className="text-zinc-200">{label}</span>
                    {value ? (
                      <div className="bg-[#e8f5e5] rounded-full py-1 px-2 gap-1 flex items-center">
                        <span className="text-[#2e7d32] text-sm">{value}</span>
                        {loading ? (
                          <Loader className="text-[#2e7d32] size-4 animate-spin" />
                        ) : (
                          <IconCircleCheckFilled className="text-[#2e7d32] size-4" />
                        )}
                      </div>
                    ) : loading ? (
                      <div className="bg-zinc-200 size-8 rounded-full flex items-center justify-center">
                        <Loader className="text-red-500 size-4 animate-spin" />
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
              <div className="w-full lg:w-[700px]">
                {/* Reset */}
                <div
                  className="flex cursor-pointer text-white items-center gap-2 mb-4 lg:mb-0"
                  onClick={() => {
                    setSelectedWidth("");
                    setSelectedAspect("");
                    setSelectedRim("");
                    setIsLoadingWidth(false);
                    setIsLoadingAspect(false);
                    setIsLoadingRim(false);
                  }}
                >
                  <ChevronLeft className="size-5 sm:size-7" />
                  <span className="text-sm sm:text-base">Reset my search</span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-start -mt-5 sm:-mt-5 justify-between gap-4 sm:gap-0">
                  {/* Step Title */}
                  <h3 className="font-semibold mt-4 sm:mt-14 text-white text-lg sm:text-xl lg:text-2xl">
                    {selectedWidth === ""
                      ? "Please enter the width..."
                      : selectedAspect === ""
                        ? "Please enter the ratio..."
                        : selectedRim === ""
                          ? "Please enter the diameter..."
                          : "All set!"}
                  </h3>

                  <div className="relative w-full sm:w-48 lg:w-60 h-48 sm:h-48 lg:h-60">
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
                        loading={isLoadingWidth}
                        onClick={() => {
                          setIsLoadingWidth(true);
                          setSelectedWidth(item);
                        }}
                      />
                    ))}

                  {selectedWidth !== "" &&
                    selectedAspect === "" &&
                    filterList(aspectOptions, searchInput).map((item) => (
                      <OptionItem
                        key={item}
                        label={item}
                        loading={isLoadingAspect}
                        onClick={() => {
                          setIsLoadingAspect(true);
                          setSelectedAspect(item);
                        }}
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
                          loading={isLoadingRim}
                          onClick={() => {
                            setIsLoadingRim(true);
                            setSelectedRim(item);
                          }}
                        />
                      )
                    )}
                </div>

              </div>
            </div>
          )}

          {/* ---- CAR FLOW ---- */}
          {isOpen.key === "car" && (
            <div className="flex flex-col lg:flex-row max-w-7xl gap-6 lg:gap-20 mx-auto items-start px-4 sm:px-6 lg:px-0">
              {/* Left preview */}
              <div className="bg-[#c02b2b] w-full lg:w-[400px] rounded-2xl p-4 sm:p-6 lg:p-8">
                <h3 className="font-semibold text-white text-lg mb-5">
                  About your Car
                </h3>
                {[
                  {
                    label: "Brand",
                    value: selectedBrand,
                    loading: isLoadingBrand
                  },
                  {
                    label: "Model",
                    value: selectedModel,
                    loading: isLoadingModel
                  },
                  {
                    label: "Year",
                    value: selectedYear,
                    loading: isLoadingYear
                  },
                ].map(({ label, value, loading }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between mb-5 last:mb-0"
                  >
                    <span className="text-zinc-200">{label}</span>
                    {value ? (
                      <div className="bg-[#e8f5e5] rounded-full py-1 px-2 gap-1 flex items-center">
                        <span className="text-[#2e7d32] text-sm">{value}</span>
                        {loading ? (
                          <Loader className="text-[#2e7d32] size-4 animate-spin" />
                        ) : (
                          <IconCircleCheckFilled className="text-[#2e7d32] size-4" />
                        )}
                      </div>
                    ) : loading ? (
                      <div className="bg-zinc-200 size-8 rounded-full flex items-center justify-center">
                        <Loader className="text-red-500 size-4 animate-spin" />
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
              <div className="w-full lg:w-[700px]">
                {/* Reset */}
                <div
                  className="flex cursor-pointer text-white items-center gap-2 mb-4 lg:mb-0"
                  onClick={() => {
                    setSelectedBrand("");
                    setSelectedModel("");
                    setSelectedYear("");
                    setIsLoadingBrand(false);
                    setIsLoadingModel(false);
                    setIsLoadingYear(false);
                  }}
                >
                  <ChevronLeft className="size-5 sm:size-7" />
                  <span className="text-sm sm:text-base">Reset my search</span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-start -mt-5 sm:-mt-5 justify-between gap-4 sm:gap-0">
                  <h3 className="font-semibold mt-4 sm:mt-14 text-white text-lg sm:text-xl lg:text-2xl">
                    {selectedBrand === ""
                      ? "Please select the brand..."
                      : selectedModel === ""
                        ? "Please select the model..."
                        : selectedYear === ""
                          ? "Please select the year..."
                          : "All set!"}
                  </h3>
                  <div className="relative w-full sm:w-52 lg:w-64 h-52 sm:h-52 lg:h-64">
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
                        loading={isLoadingBrand}
                        onClick={() => {
                          setIsLoadingBrand(true);
                          setSelectedBrand(item);
                        }}
                      />
                    ))}

                  {selectedBrand !== "" &&
                    selectedModel === "" &&
                    filterList(Object.keys(modelOptions), searchCarInput).map(
                      (item) => (
                        <OptionItem
                          key={item}
                          label={item}
                          loading={isLoadingModel}
                          onClick={() => {
                            setIsLoadingModel(true);
                            setSelectedModel(item);
                          }}
                        />
                      )
                    )}

                  {selectedModel !== "" &&
                    selectedYear === "" &&
                    yearOptions.length > 0 &&
                    filterList(yearOptions.map(String), searchCarInput).map(
                      (item) => (
                        <OptionItem
                          key={item}
                          label={item}
                          loading={isLoadingYear}
                          onClick={() => {
                            setIsLoadingYear(true);
                            setSelectedYear(item);
                          }}
                        />
                      )
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---- MAIN CARD ---- */}
      <div className={`w-full h-[200px] max-w-4xl mx-auto ${className}`}>
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
                  onClick={() => {
                    redirectedRef.current = "";
                    setIsLoadingWidth(false);
                    setIsLoadingAspect(false);
                    setIsLoadingRim(false);
                    setIsOpen({ toggle: true, key: "size" });
                  }}
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
                  onClick={() => {
                    redirectedRef.current = "";
                    setIsLoadingBrand(false);
                    setIsLoadingModel(false);
                    setIsLoadingYear(false);
                    setIsOpen({ toggle: true, key: "car" });
                  }}
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
  loading,
}: {
  label: string;
  onClick: () => void;
  loading?: boolean;
}) => (
  <div
    className={`flex rounded-2xl cursor-pointer items-center justify-between hover:bg-zinc-200/50 px-3 py-2 ${
      loading ? "opacity-70 pointer-events-none" : ""
    }`}
    onClick={onClick}
  >
    <span className="text-white">{label}</span>
    {loading ? (
      <Loader className="size-5 text-white animate-spin" />
    ) : (
      <ChevronRight className="size-5 text-white" />
    )}
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
