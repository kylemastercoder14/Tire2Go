"use client";
import React from "react";
import { CarFront, CircleDot, SearchIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SEARCH_BY_CAR, SEARCH_BY_SIZE } from "@/constants";

const TABS = [
  { id: "size", label: "Search by size", icon: CircleDot },
  { id: "car", label: "Search by car", icon: CarFront },
];

const TireSearch = ({ isHomepage = true }: { isHomepage?: boolean }) => {
  const [activeTab, setActiveTab] = React.useState("size");

  // --- STATE FOR SEARCH BY SIZE ---
  const [selectedWidth, setSelectedWidth] = React.useState("");
  const [selectedAspect, setSelectedAspect] = React.useState("");
  const [selectedRim, setSelectedRim] = React.useState("");

  // --- STATE FOR SEARCH BY CAR ---
  const [selectedBrand, setSelectedBrand] = React.useState("");
  const [selectedModel, setSelectedModel] = React.useState("");
  const [selectedYear, setSelectedYear] = React.useState("");

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
    if (activeTab === "size") {
      console.log("Search by size:", {
        selectedWidth,
        selectedAspect,
        selectedRim,
      });
    } else {
      console.log("Search by car:", {
        selectedBrand,
        selectedModel,
        selectedYear,
      });
    }
  };

  if (isHomepage) {
    return (
      <div className="w-full h-[465px] p-5 rounded-3xl bg-white border shadow">
        <h3 className="text-primary text-center text-4xl font-semibold tracking-tight">
          Tire shopping made easy
        </h3>

        <div className="w-full h-[360px] border rounded-2xl mt-5 overflow-hidden">
          {/* Tabs */}
          <div className="flex w-full border-b items-center justify-center">
            {TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 w-full cursor-pointer ${
                    isActive ? "hover:bg-primary/5" : "bg-gray-100"
                  } flex flex-col items-center justify-center gap-1 ${
                    tab.id === "car" ? "rounded-tr-2xl" : "rounded-tl-2xl"
                  }`}
                >
                  <tab.icon
                    className={`size-5 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <p
                    className={`uppercase tracking-tight ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    } font-medium`}
                  >
                    {tab.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Animated Tab Content */}
          <div className="relative w-full h-full">
            <AnimatePresence mode="wait">
              {/* ---- SEARCH BY SIZE ---- */}
              {activeTab === "size" && (
                <motion.div
                  key="size"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 50, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full flex flex-col items-center justify-start"
                >
                  <div className="relative w-full h-full flex justify-center">
                    <Image
                      src="/tab-size.png"
                      alt="Search by Size"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl">
                      <div className="grid grid-cols-3 gap-3 w-full">
                        {/* Width */}
                        <Select
                          value={selectedWidth}
                          onValueChange={(val) => {
                            setSelectedWidth(val);
                            setSelectedAspect("");
                            setSelectedRim("");
                          }}
                        >
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Width *" />
                          </SelectTrigger>
                          <SelectContent>
                            {widthOptions.map((w) => (
                              <SelectItem key={w} value={w}>
                                {w}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Aspect Ratio */}
                        <Select
                          value={selectedAspect}
                          onValueChange={(val) => {
                            setSelectedAspect(val);
                            setSelectedRim("");
                          }}
                          disabled={!selectedWidth}
                        >
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Aspect Ratio *" />
                          </SelectTrigger>
                          <SelectContent>
                            {aspectOptions.map((ar) => (
                              <SelectItem key={ar} value={ar}>
                                {ar}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Rim Diameter */}
                        <Select
                          value={selectedRim}
                          onValueChange={setSelectedRim}
                          disabled={!selectedAspect}
                        >
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Rim Diameter *" />
                          </SelectTrigger>
                          <SelectContent>
                            {rimOptions.map((r) => (
                              <SelectItem key={r} value={String(r)}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mt-3 w-full">
                        <Button
                          className="cursor-pointer disabled:bg-primary disabled:opacity-80 disabled:cursor-not-allowed w-full"
                          size="lg"
                          onClick={handleSearch}
                          disabled={
                            !selectedWidth || !selectedAspect || !selectedRim
                          }
                        >
                          <SearchIcon className="size-4" />
                          Search for Tires
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ---- SEARCH BY CAR ---- */}
              {activeTab === "car" && (
                <motion.div
                  key="car"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full flex flex-col items-center justify-start"
                >
                  <div className="relative w-full h-full flex justify-center">
                    <div className="relative w-full h-[200px]">
                      <Image
                        src="/tab-car.jpg"
                        alt="Search by Car"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl">
                      <div className="grid grid-cols-3 gap-3 w-full">
                        {/* Brand */}
                        <Select
                          value={selectedBrand}
                          onValueChange={(val) => {
                            setSelectedBrand(val);
                            setSelectedModel("");
                            setSelectedYear("");
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Brand *" />
                          </SelectTrigger>
                          <SelectContent>
                            {brandOptions.map((brand) => (
                              <SelectItem key={brand} value={brand}>
                                {brand}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Model */}
                        <Select
                          value={selectedModel}
                          onValueChange={(val) => {
                            setSelectedModel(val);
                            setSelectedYear("");
                          }}
                          disabled={!selectedBrand}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Model *" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(modelOptions).map((m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Year */}
                        <Select
                          value={selectedYear}
                          onValueChange={setSelectedYear}
                          disabled={!selectedModel}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Year *" />
                          </SelectTrigger>
                          <SelectContent>
                            {yearOptions.map((y) => (
                              <SelectItem key={y} value={String(y)}>
                                {y}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mt-3 w-full">
                        <Button
                          className="cursor-pointer w-full"
                          size="lg"
                          onClick={handleSearch}
                          disabled={
                            !selectedBrand || !selectedModel || !selectedYear
                          }
                        >
                          <SearchIcon className="size-4" />
                          Search for Tires
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px]">
      <div className="w-full h-full bg-white border shadow-xl rounded-2xl mt-5 overflow-hidden">
        {/* Tabs */}
        <div className="flex w-full border-b items-center justify-center">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 w-full cursor-pointer ${
                  isActive ? "hover:bg-primary/5" : "bg-gray-100"
                } flex flex-col items-center justify-center gap-1 ${
                  tab.id === "car" ? "rounded-tr-2xl" : "rounded-tl-2xl"
                }`}
              >
                <tab.icon
                  className={`size-5 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <p
                  className={`uppercase tracking-tight ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  } font-medium`}
                >
                  {tab.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Animated Tab Content */}
        <div className="relative w-full h-full">
          <AnimatePresence mode="wait">
            {/* ---- SEARCH BY SIZE ---- */}
            {activeTab === "size" && (
              <motion.div
                key="size"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full flex flex-col items-center justify-start"
              >
                <div className="relative w-full h-full flex justify-center">
                  <Image
                    src="/tab-size.png"
                    alt="Search by Size"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full px-10">
                    <div className="grid grid-cols-3 gap-3 w-full">
                      {/* Width */}
                      <Select
                        value={selectedWidth}
                        onValueChange={(val) => {
                          setSelectedWidth(val);
                          setSelectedAspect("");
                          setSelectedRim("");
                        }}
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Width *" />
                        </SelectTrigger>
                        <SelectContent>
                          {widthOptions.map((w) => (
                            <SelectItem key={w} value={w}>
                              {w}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Aspect Ratio */}
                      <Select
                        value={selectedAspect}
                        onValueChange={(val) => {
                          setSelectedAspect(val);
                          setSelectedRim("");
                        }}
                        disabled={!selectedWidth}
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Aspect Ratio *" />
                        </SelectTrigger>
                        <SelectContent>
                          {aspectOptions.map((ar) => (
                            <SelectItem key={ar} value={ar}>
                              {ar}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Rim Diameter */}
                      <Select
                        value={selectedRim}
                        onValueChange={setSelectedRim}
                        disabled={!selectedAspect}
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Rim Diameter *" />
                        </SelectTrigger>
                        <SelectContent>
                          {rimOptions.map((r) => (
                            <SelectItem key={r} value={String(r)}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="mt-3 w-full">
                      <Button
                        className="cursor-pointer disabled:bg-primary disabled:opacity-80 disabled:cursor-not-allowed w-full"
                        size="lg"
                        onClick={handleSearch}
                      >
                        <SearchIcon className="size-4" />
                        Search for Tires
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ---- SEARCH BY CAR ---- */}
            {activeTab === "car" && (
              <motion.div
                key="car"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full flex flex-col items-center justify-start"
              >
                <div className="relative w-full h-full flex justify-center">
                  <div className="relative w-full h-[200px]">
                    <Image
                      src="/tab-car.jpg"
                      alt="Search by Car"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full px-10">
                    <div className="grid grid-cols-3 gap-3 w-full">
                      {/* Brand */}
                      <Select
                        value={selectedBrand}
                        onValueChange={(val) => {
                          setSelectedBrand(val);
                          setSelectedModel("");
                          setSelectedYear("");
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Brand *" />
                        </SelectTrigger>
                        <SelectContent>
                          {brandOptions.map((brand) => (
                            <SelectItem key={brand} value={brand}>
                              {brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Model */}
                      <Select
                        value={selectedModel}
                        onValueChange={(val) => {
                          setSelectedModel(val);
                          setSelectedYear("");
                        }}
                        disabled={!selectedBrand}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Model *" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(modelOptions).map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Year */}
                      <Select
                        value={selectedYear}
                        onValueChange={setSelectedYear}
                        disabled={!selectedModel}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Year *" />
                        </SelectTrigger>
                        <SelectContent>
                          {yearOptions.map((y) => (
                            <SelectItem key={y} value={String(y)}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="mt-3 w-full">
                      <Button
                        className="cursor-pointer w-full"
                        size="lg"
                        onClick={handleSearch}
                      >
                        <SearchIcon className="size-4" />
                        Search for Tires
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TireSearch;
