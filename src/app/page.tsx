import Link from "next/link";
import Button from "@/components/ui/Button";

export default function HomePage() {
  return (
    <main className='flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center'>
      <Link href='/login'>
        <Button size='lg' className='mr-2'>
          Sign Up
        </Button>{" "}
        to make your notes
      </Link>
    </main>
  );
}
