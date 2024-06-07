import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col w-full justify-center items-center gap-[30px]">
      <Image
        className=""
        src="/error.png"
        height="400"
        width="400"
        alt="Error"
      />
      <h1 className="text-7xl font-bold">Let's Get Tweet</h1>
    </div>
  );
}
