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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl border border-gray-100"
          >
            <Loader className="size-10 text-primary animate-spin" />
            <p className="text-lg font-semibold text-gray-800">Loading search results...</p>
            <p className="text-sm text-gray-500">Please wait a moment</p>
          </motion.div>
        </motion.div>
      )}

      {/* ---- MODAL ---- */}
      {isOpen.toggle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex flex-col items-center pt-20 sm:pt-30 w-full overflow-y-auto z-50"
          style={{
            background: 'linear-gradient(135deg, #c02b2b 0%, #8b1a1a 25%, #6b0f0f 50%, #8b1a1a 75%, #a02020 100%)',
            minHeight: '100vh',
            height: 'auto',
            paddingBottom: '2rem',
          }}
        >
          {/* Multi-layer gradient overlay for depth */}
          <div
            className="fixed inset-0 w-full"
            style={{
              background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.8) 0%, rgba(185, 28, 28, 0.9) 30%, rgba(153, 27, 27, 1) 60%, rgba(127, 29, 29, 0.9) 100%)',
              minHeight: '100vh',
              height: '100%',
              zIndex: -1,
            }}
          ></div>

          {/* Complementary color accents */}
          <div
            className="fixed inset-0 w-full opacity-30"
            style={{
              background: 'radial-gradient(circle at 20% 30%, rgba(251, 146, 60, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)',
              minHeight: '100vh',
              height: '100%',
              zIndex: -1,
            }}
          ></div>

          {/* Animated background pattern overlay */}
          <div className="fixed inset-0 w-full opacity-10" style={{ minHeight: '100vh', height: '100%', zIndex: -1 }}>
            <div className="absolute inset-0 w-full h-full" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}></div>
          </div>

          {/* Animated gradient orbs with complementary colors */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.2, 0.1],
              x: [0, 50, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="fixed top-20 left-10 w-96 h-96 rounded-full blur-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(251, 146, 60, 0.4) 0%, rgba(220, 38, 38, 0.2) 50%, transparent 100%)',
              zIndex: 0,
            }}
          ></motion.div>
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.1, 0.25, 0.1],
              x: [0, -30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="fixed bottom-20 right-10 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(185, 28, 28, 0.2) 50%, transparent 100%)',
              zIndex: 0,
            }}
          ></motion.div>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, rgba(153, 27, 27, 0.1) 50%, transparent 100%)',
              zIndex: 0,
            }}
          ></motion.div>
          <motion.button
            onClick={() => setIsOpen({ toggle: false, key: null })}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            className="fixed size-10 sm:size-12 top-4 right-4 sm:top-7 sm:right-7 border-2 border-white/80 rounded-full flex items-center justify-center cursor-pointer z-[100] bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all shadow-xl hover:shadow-2xl"
          >
            <XIcon className="size-5 sm:size-7 text-white font-bold" />
          </motion.button>

          {/* ---- SIZE FLOW ---- */}
          {isOpen.key === "size" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col lg:flex-row max-w-7xl gap-6 lg:gap-20 mx-auto items-start px-4 sm:px-6 lg:px-0 py-4 pb-8 relative z-10"
            >
              {/* Left preview */}
              <div className="w-full lg:w-[400px] rounded-2xl p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-red-700 via-[#c02b2b] to-red-800 shadow-2xl border border-white/10 backdrop-blur-sm relative overflow-hidden">
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none"></div>
                <div className="relative z-10">
                <h3 className="font-bold text-white text-xl mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-white/30 rounded-full"></div>
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
                ].map(({ label, value, loading }, index) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between mb-5 last:mb-0 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <span className="text-white font-medium text-base">{label}</span>
                    {value ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-gradient-to-r from-green-400 to-green-500 rounded-full py-1.5 px-4 gap-2 flex items-center shadow-lg"
                      >
                        <span className="text-white text-sm font-semibold">{value}</span>
                        {loading ? (
                          <Loader className="text-white size-4 animate-spin" />
                        ) : (
                          <IconCircleCheckFilled className="text-white size-4" />
                        )}
                      </motion.div>
                    ) : loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="bg-white/20 size-10 rounded-full flex items-center justify-center"
                      >
                        <Loader className="text-white size-5 animate-spin" />
                      </motion.div>
                    ) : (
                      <div className="bg-white/10 size-10 rounded-full flex items-center justify-center border-2 border-white/20">
                        <div className="size-2 bg-white/40 rounded-full"></div>
                      </div>
                    )}
                  </motion.div>
                ))}
                </div>
              </div>

              {/* Right side content - Wizard Style */}
              <div className="w-full lg:w-[700px]">
                {/* Wizard Progress Steps */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    {[
                      { label: "Width", value: selectedWidth, step: 1 },
                      { label: "Ratio", value: selectedAspect, step: 2 },
                      { label: "Diameter", value: selectedRim, step: 3 },
                    ].map(({ label, value, step }, index, array) => (
                      <React.Fragment key={step}>
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className={`size-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                              value
                                ? "bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg scale-110"
                                : selectedWidth && step === 2
                                ? "bg-white/20 text-white border-2 border-white/40"
                                : selectedAspect && step === 3
                                ? "bg-white/20 text-white border-2 border-white/40"
                                : step === 1
                                ? "bg-white/20 text-white border-2 border-white/40"
                                : "bg-white/10 text-white/50 border-2 border-white/20"
                            }`}
                          >
                            {value ? (
                              <IconCircleCheckFilled className="size-6" />
                            ) : (
                              step
                            )}
                          </div>
                          <span className="text-white text-xs mt-2 font-medium text-center">
                            {label}
                          </span>
                        </div>
                        {index < array.length - 1 && (
                          <div
                            className={`h-0.5 flex-1 mx-2 transition-all ${
                              value || (step === 1 && selectedWidth) || (step === 2 && selectedAspect)
                                ? "bg-gradient-to-r from-green-400 to-green-500"
                                : "bg-white/20"
                            }`}
                          ></div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Step Title */}
                <motion.h3
                  key={selectedWidth + selectedAspect + selectedRim}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-bold text-white text-2xl sm:text-3xl lg:text-4xl drop-shadow-lg mb-6 text-center"
                >
                  {selectedWidth === ""
                    ? "Select Tire Width"
                    : selectedAspect === ""
                      ? "Select Aspect Ratio"
                      : selectedRim === ""
                        ? "Select Rim Diameter"
                        : "All set! ✨"}
                </motion.h3>

                {/* Search input */}
                {(selectedWidth === "" || selectedAspect === "" || selectedRim === "") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileFocus={{ scale: 1.02 }}
                    className="flex items-center w-full bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-5 mb-6 shadow-xl border-2 border-white/30 hover:border-white/50 hover:shadow-2xl transition-all"
                  >
                    <SearchIcon className="size-5 text-gray-400 mr-3 flex-shrink-0" />
                    <input
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder={`Search ${
                        selectedWidth === ""
                          ? "width"
                          : selectedAspect === ""
                            ? "ratio"
                            : "diameter"
                      }...`}
                      className="w-full border-none outline-none text-base sm:text-lg bg-transparent placeholder:text-gray-400 focus:placeholder:text-gray-300"
                      autoFocus={false}
                      type="text"
                    />
                  </motion.div>
                )}

                {/* Paper-like Options Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 max-h-[50vh] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-white/10 [&::-webkit-scrollbar-track]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-thumb]:hover:bg-white/50">
                  {selectedWidth === "" &&
                    filterList(widthOptions, searchInput).map((item) => (
                      <PaperCard
                        key={item}
                        label={item}
                        loading={isLoadingWidth}
                        onClick={() => {
                          setIsLoadingWidth(true);
                          setSelectedWidth(item);
                          setSearchInput("");
                        }}
                      />
                    ))}

                  {selectedWidth !== "" &&
                    selectedAspect === "" &&
                    filterList(aspectOptions, searchInput).map((item) => (
                      <PaperCard
                        key={item}
                        label={item}
                        loading={isLoadingAspect}
                        onClick={() => {
                          setIsLoadingAspect(true);
                          setSelectedAspect(item);
                          setSearchInput("");
                        }}
                      />
                    ))}

                  {selectedWidth !== "" &&
                    selectedAspect !== "" &&
                    selectedRim === "" &&
                    filterList(rimOptions.map(String), searchInput).map((item) => (
                      <PaperCard
                        key={item}
                        label={item}
                        loading={isLoadingRim}
                        onClick={() => {
                          setIsLoadingRim(true);
                          setSelectedRim(item);
                          setSearchInput("");
                        }}
                      />
                    ))}
                </div>

                {/* Reset button */}
                {(selectedWidth || selectedAspect || selectedRim) && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ x: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex cursor-pointer text-white items-center gap-2 mt-6 group mx-auto"
                    onClick={() => {
                      setSelectedWidth("");
                      setSelectedAspect("");
                      setSelectedRim("");
                      setIsLoadingWidth(false);
                      setIsLoadingAspect(false);
                      setIsLoadingRim(false);
                      setSearchInput("");
                    }}
                  >
                    <ChevronLeft className="size-5 group-hover:translate-x-[-4px] transition-transform" />
                    <span className="text-sm font-medium group-hover:underline">Reset</span>
                  </motion.button>
                )}

              </div>
            </motion.div>
          )}

          {/* ---- CAR FLOW ---- */}
          {isOpen.key === "car" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col lg:flex-row max-w-7xl gap-6 lg:gap-20 mx-auto items-start px-4 sm:px-6 lg:px-0 py-4 pb-16 relative z-10"
            >
              {/* Left preview */}
              <div className="w-full lg:w-[400px] rounded-2xl p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-red-700 via-[#c02b2b] to-red-800 shadow-2xl border border-white/10 backdrop-blur-sm relative overflow-hidden">
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none"></div>
                <div className="relative z-10">
                <h3 className="font-bold text-white text-xl mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-white/30 rounded-full"></div>
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
                ].map(({ label, value, loading }, index) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between mb-5 last:mb-0 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <span className="text-white font-medium text-base">{label}</span>
                    {value ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-gradient-to-r from-green-400 to-green-500 rounded-full py-1.5 px-4 gap-2 flex items-center shadow-lg"
                      >
                        <span className="text-white text-sm font-semibold">{value}</span>
                        {loading ? (
                          <Loader className="text-white size-4 animate-spin" />
                        ) : (
                          <IconCircleCheckFilled className="text-white size-4" />
                        )}
                      </motion.div>
                    ) : loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="bg-white/20 size-10 rounded-full flex items-center justify-center"
                      >
                        <Loader className="text-white size-5 animate-spin" />
                      </motion.div>
                    ) : (
                      <div className="bg-white/10 size-10 rounded-full flex items-center justify-center border-2 border-white/20">
                        <div className="size-2 bg-white/40 rounded-full"></div>
                      </div>
                    )}
                  </motion.div>
                ))}
                </div>
              </div>

              {/* Right side - Wizard Style */}
              <div className="w-full lg:w-[700px] relative z-10">
                {/* Wizard Progress Steps */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    {[
                      { label: "Brand", value: selectedBrand, step: 1 },
                      { label: "Model", value: selectedModel, step: 2 },
                      { label: "Year", value: selectedYear, step: 3 },
                    ].map(({ label, value, step }, index, array) => (
                      <React.Fragment key={step}>
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className={`size-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                              value
                                ? "bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg scale-110"
                                : selectedBrand && step === 2
                                ? "bg-white/20 text-white border-2 border-white/40"
                                : selectedModel && step === 3
                                ? "bg-white/20 text-white border-2 border-white/40"
                                : step === 1
                                ? "bg-white/20 text-white border-2 border-white/40"
                                : "bg-white/10 text-white/50 border-2 border-white/20"
                            }`}
                          >
                            {value ? (
                              <IconCircleCheckFilled className="size-6" />
                            ) : (
                              step
                            )}
                          </div>
                          <span className="text-white text-xs mt-2 font-medium text-center">
                            {label}
                          </span>
                        </div>
                        {index < array.length - 1 && (
                          <div
                            className={`h-0.5 flex-1 mx-2 transition-all ${
                              value || (step === 1 && selectedBrand) || (step === 2 && selectedModel)
                                ? "bg-gradient-to-r from-green-400 to-green-500"
                                : "bg-white/20"
                            }`}
                          ></div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Step Title */}
                <motion.h3
                  key={selectedBrand + selectedModel + selectedYear}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-bold text-white text-2xl sm:text-3xl lg:text-4xl drop-shadow-lg mb-6 text-center"
                >
                  {selectedBrand === ""
                    ? "Select Car Brand"
                    : selectedModel === ""
                      ? "Select Car Model"
                      : selectedYear === ""
                        ? "Select Year"
                        : "All set! ✨"}
                </motion.h3>

                {/* Search input */}
                {(selectedBrand === "" || selectedModel === "" || selectedYear === "") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileFocus={{ scale: 1.02 }}
                    className="flex items-center w-full bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-5 mb-6 shadow-xl border-2 border-white/30 hover:border-white/50 hover:shadow-2xl transition-all"
                  >
                    <SearchIcon className="size-5 text-gray-400 mr-3 flex-shrink-0" />
                    <input
                      value={searchCarInput}
                      onChange={(e) => setSearchCarInput(e.target.value)}
                      placeholder={`Search ${
                        selectedBrand === ""
                          ? "brand"
                          : selectedModel === ""
                            ? "model"
                            : "year"
                      }...`}
                      className="w-full border-none outline-none text-base sm:text-lg bg-transparent placeholder:text-gray-400 focus:placeholder:text-gray-300"
                      autoFocus={false}
                      type="text"
                    />
                  </motion.div>
                )}

                {/* Paper-like Options Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 max-h-[50vh] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-white/10 [&::-webkit-scrollbar-track]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-thumb]:hover:bg-white/50">
                  {selectedBrand === "" &&
                    filterList(brandOptions, searchCarInput).map((item) => (
                      <PaperCard
                        key={item}
                        label={item}
                        loading={isLoadingBrand}
                        onClick={() => {
                          setIsLoadingBrand(true);
                          setSelectedBrand(item);
                          setSearchCarInput("");
                        }}
                      />
                    ))}

                  {selectedBrand !== "" &&
                    selectedModel === "" &&
                    filterList(Object.keys(modelOptions), searchCarInput).map((item) => (
                      <PaperCard
                        key={item}
                        label={item}
                        loading={isLoadingModel}
                        onClick={() => {
                          setIsLoadingModel(true);
                          setSelectedModel(item);
                          setSearchCarInput("");
                        }}
                      />
                    ))}

                  {selectedModel !== "" &&
                    selectedYear === "" &&
                    yearOptions.length > 0 &&
                    filterList(yearOptions.map(String), searchCarInput).map((item) => (
                      <PaperCard
                        key={item}
                        label={item}
                        loading={isLoadingYear}
                        onClick={() => {
                          setIsLoadingYear(true);
                          setSelectedYear(item);
                          setSearchCarInput("");
                        }}
                      />
                    ))}
                </div>

                {/* Reset button */}
                {(selectedBrand || selectedModel || selectedYear) && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ x: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex cursor-pointer text-white items-center gap-2 mt-6 group mx-auto"
                    onClick={() => {
                      setSelectedBrand("");
                      setSelectedModel("");
                      setSelectedYear("");
                      setIsLoadingBrand(false);
                      setIsLoadingModel(false);
                      setIsLoadingYear(false);
                      setSearchCarInput("");
                    }}
                  >
                    <ChevronLeft className="size-5 group-hover:translate-x-[-4px] transition-transform" />
                    <span className="text-sm font-medium group-hover:underline">Reset</span>
                  </motion.button>
                )}

              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ---- MAIN CARD ---- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full h-[200px] max-w-4xl mx-auto ${className}`}
      >
        <div className="w-full px-5 h-full bg-gradient-to-br from-primary via-primary/95 to-red-700 shadow-2xl rounded-2xl py-5 overflow-hidden relative border border-white/10 hover:shadow-3xl transition-shadow duration-300">
          {/* Decorative elements */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl"
          ></motion.div>
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl"
          ></motion.div>
          <div className="relative z-10">
            {/* Tabs */}
            <div className="flex w-full border-b border-white/20 gap-5 items-center">
            {TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "size" | "car")}
                  className={`py-2 px-5 cursor-pointer transition-all ${
                    isActive ? "border-b-2 border-white shadow-sm" : "bg-transparent hover:bg-white/5"
                  } flex items-center gap-2.5 rounded-t-lg`}
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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative bg-white/95 backdrop-blur-sm mt-5 w-full px-5 py-5 rounded-2xl shadow-lg border border-white/30 hover:shadow-xl transition-shadow"
            >
            <AnimatePresence mode="wait">
              {activeTab === "size" && (
                <motion.div
                  key="size"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 50, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full cursor-pointer flex items-center justify-between group"
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
                  className="w-full cursor-pointer flex items-center justify-between group"
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
            </motion.div>
          </div>
        </div>
      </motion.div>
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
  <motion.div
    whileHover={{ scale: 1.02, x: 5 }}
    whileTap={{ scale: 0.98 }}
    className={`flex rounded-xl cursor-pointer items-center justify-between bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl px-5 py-4 transition-all group ${
      loading ? "opacity-70 pointer-events-none" : ""
    }`}
    onClick={onClick}
  >
    <span className="text-white font-semibold text-base group-hover:text-white/90">{label}</span>
    {loading ? (
      <Loader className="size-5 text-white animate-spin" />
    ) : (
      <ChevronRight className="size-5 text-white group-hover:translate-x-1 transition-transform" />
    )}
  </motion.div>
);

/* ---- PAPER-LIKE CARD COMPONENT ---- */
const PaperCard = ({
  label,
  onClick,
  loading,
}: {
  label: string;
  onClick: () => void;
  loading?: boolean;
}) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    disabled={loading}
    className={`relative bg-white/95 backdrop-blur-sm rounded-xl p-4 sm:p-5 cursor-pointer border-2 border-white/40 shadow-lg hover:shadow-2xl transition-all group overflow-hidden ${
      loading ? "opacity-70 pointer-events-none" : "hover:border-white/60"
    }`}
    onClick={onClick}
    style={{
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
    }}
  >
    {/* Paper texture effect */}
    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)`,
    }}></div>

    {/* Content */}
    <div className="relative z-10 flex flex-col items-center justify-center min-h-[80px]">
      {loading ? (
        <Loader className="size-6 text-primary animate-spin" />
      ) : (
        <>
          <span className="text-gray-800 font-bold text-lg sm:text-xl group-hover:text-primary transition-colors">
            {label}
          </span>
          <div className="mt-2 w-8 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </>
      )}
    </div>
  </motion.button>
);

const CardItem = ({ label, img }: { label: string; img: string }) => (
  <>
    <motion.div
      whileHover={{ x: 5 }}
      className="flex items-center gap-5"
    >
      <motion.div
        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
        transition={{ duration: 0.5 }}
        className="relative size-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl p-3 border-2 border-primary/30 shadow-md"
      >
        <Image src={img} alt={label} fill className="object-contain" />
      </motion.div>
      <div>
        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Search by</p>
        <p className="font-bold text-xl text-gray-800 mt-1">{label}</p>
      </div>
    </motion.div>
    <motion.div
      whileHover={{ scale: 1.1, rotate: -5 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button size="icon" className="rounded-full p-6 bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-600/90 shadow-lg hover:shadow-xl transition-all">
        <ChevronRight className="size-7" />
      </Button>
    </motion.div>
  </>
);
