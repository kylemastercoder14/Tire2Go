import { motion } from "framer-motion";
import { useState } from "react";

export default function Stepper() {
  const [step, setStep] = useState(1);

  const steps = [
    { key: "width", label: "Width" },
    { key: "ratio", label: "Ratio" },
    { key: "diameter", label: "Diameter" },
  ];

  return (
    <div className="bg-[#2C0D00] w-[300px] rounded-2xl p-8 flex flex-col items-start">
      <h3 className="text-white text-lg font-semibold mb-6">
        About your Dimension
      </h3>

      {/* Timeline */}
      <div className="relative flex flex-col items-start">
        {/* Yellow line (animated) */}
        <motion.div
          className="absolute left-[9px] top-2 w-[3px] bg-yellow-400 rounded-full"
          animate={{ height: step * 80 }} // grows with step
          initial={{ height: 20 }}
          transition={{ duration: 0.5 }}
        />

        {/* Steps */}
        {steps.map((item, index) => (
          <div key={item.key} className="flex items-center mb-10 relative z-10">
            {/* Circle */}
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                index < step
                  ? "bg-yellow-400 border-yellow-400"
                  : "bg-gray-300 border-gray-400"
              }`}
            >
              {index < step && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </div>
            {/* Label */}
            <span className="ml-3 text-white">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Buttons for demo */}
      <div className="mt-10 flex gap-2">
        <button
          onClick={() => setStep((prev) => Math.min(prev + 1, steps.length))}
          className="px-3 py-1 bg-yellow-400 text-black rounded"
        >
          Next
        </button>
        <button
          onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
          className="px-3 py-1 bg-gray-500 text-white rounded"
        >
          Back
        </button>
      </div>
    </div>
  );
}
