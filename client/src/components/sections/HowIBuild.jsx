export default function HowIBuild() {
  const steps = [
    {
      num: "01",
      title: "Understand the Problem",
      desc: "Deep dive into constraints, user needs, and edge cases before writing code."
    },
    {
      num: "02",
      title: "Design the Solution",
      desc: "Architecture, data models, and API contracts. Measure twice, cut once."
    },
    {
      num: "03",
      title: "Build & Iterate",
      desc: "Write clean, testable, and documented code. Deploy early and gather feedback."
    },
    {
      num: "04",
      title: "Measure & Improve",
      desc: "Analyze performance, fix bottlenecks, and refine the user experience."
    }
  ];

  return (
    <section className="bg-gray-100 dark:bg-white text-gray-900 py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How I Build</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">An engineering approach to product development.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-6 left-[12%] right-[12%] h-[1px] bg-gray-300"></div>

          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-start bg-gray-100 dark:bg-white pt-2">
              <div className="w-12 h-12 rounded-full bg-cyan-accent flex items-center justify-center text-white font-bold mb-6 shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                {step.num}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
