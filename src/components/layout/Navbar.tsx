import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Navbar() {
  return (
    <header className='w-full bg-(--panel)'>
      <div className='mx-auto flex h-14 max-w-6xl items-center justify-between px-4'>
        {/* Logo */}
        <Link href='/' className='flex items-center gap-2 text-lg font-semibold tracking-tight text-white'>
          <Image src='/favicon.svg' alt='Sticker logo' width={24} height={24} style={{ width: "auto" }} />
          Sticker
        </Link>

        <nav className='flex items-center gap-4 text-sm text-neutral-600'>
          <Link href='/login'>
            <Button variant='primary' size='sm'>
              Login
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
