import Image from "next/image";
import Link from "next/link";

export default function ProjectInfoLayout({
  projectKey,
  title,
  description,
  pinout,
  components,
  working,
  procedure,
  codeSample,
  conclusion,
  referenceUrl
}) {
  const startHref = `/projects/${projectKey}/start`;
  
  // Use specific hardware images for each project, placeholder for others
  const hardwareImageSrc = projectKey === "water-level" 
    ? "/Water_level.jpg" 
    : projectKey === "home-appliances"
    ? "/Home_appliance.jpg"
    : "/hardware-placeholder.svg";

  // Use specific block diagram images for each project, placeholder for others
  const blockDiagramImageSrc = projectKey === "water-level" 
    ? "/Water_level_detector_block.png" 
    : projectKey === "home-appliances"
    ? "/Home_appliance1.png"
    : "/block-diagram-placeholder.svg";

  // Project-specific captions
  const hardwareImageCaption = projectKey === "water-level" 
    ? "Water level detection system hardware setup."
    : projectKey === "home-appliances"
    ? "Home appliances monitoring system hardware setup."
    : "Hardware setup (placeholder). Swap for your real hardware photo.";

  // Project-specific block diagram captions
  const blockDiagramCaption = projectKey === "water-level" 
    ? "Water level detection system block diagram."
    : projectKey === "home-appliances"
    ? "Home appliances monitoring system block diagram."
    : "Block diagram (placeholder). Replace with your actual diagram when available.";

  return (
    <div className="space-y-6">
      <div className="card p-6 md:p-8">
        <h1 className="mb-2 text-2xl font-semibold">{title}</h1>
        <p className="mb-4 text-sm text-slate-300">{description}</p>
        <div className="grid gap-6 lg:grid-cols-[3fr,2fr]">
          <div className="space-y-4 text-sm">
            <section>
              <h2 className="mb-1 font-semibold">Pinout</h2>
              <p className="text-slate-300">{pinout}</p>
            </section>
            <section>
              <h2 className="mb-1 font-semibold">Components</h2>
              <ul className="list-inside list-disc text-slate-300">
                {components.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="mb-1 font-semibold">Working Principle</h2>
              <p className="text-slate-300">{working}</p>
            </section>
            <section>
              <h2 className="mb-1 font-semibold">Procedure</h2>
              <p className="whitespace-pre-line text-slate-300">{procedure}</p>
            </section>
            <section>
              <h2 className="mb-1 font-semibold">Code (Example)</h2>
              <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-sky-200">
                <code>{codeSample}</code>
              </pre>
            </section>
            <section>
              <h2 className="mb-1 font-semibold">Conclusion</h2>
              <p className="text-slate-300">{conclusion}</p>
            </section>
            <section>
              <h2 className="mb-1 font-semibold">References</h2>
              <a
                href={referenceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-sky-300 underline"
              >
                Reference link
              </a>
            </section>
          </div>

          <div className="space-y-4">
            <div className="card overflow-hidden">
              <div className="relative h-44 w-full">
                <Image
                  src={blockDiagramImageSrc}
                  alt="Block diagram"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="p-3 text-xs text-slate-300">
                {blockDiagramCaption}
              </div>
            </div>
            <div className="card overflow-hidden">
              <div className="relative h-44 w-full">
                <Image
                  src={hardwareImageSrc}
                  alt="Hardware photo"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-3 text-xs text-slate-300">
                {hardwareImageCaption}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Link href={startHref} className="btn-gradient">
          Start Project
        </Link>
      </div>
    </div>
  );
}