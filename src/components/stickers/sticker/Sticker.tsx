"use client";

import { useDraggable } from "@dnd-kit/react";
import { type StickerProps } from "@/types/sticker";

function Sticker({ id, x, y, zIndex, content, onActivate }: StickerProps) {
  const { ref, handleRef, isDragging } = useDraggable({
    id,
    data: { id },
  });

  return (
    <div
      ref={ref}
      className='absolute z-1 h-100 w-100 overflow-hidden shadow-[0_0_12px_#301e42]'
      style={{ left: x, top: y, zIndex }}
      onPointerDown={onActivate(id)}
    >
      <div
        ref={handleRef}
        className='flex cursor-grab items-center bg-(--primary) px-2.5 py-1.25 active:cursor-grabbing'
      >
        <div className='panel-buttons flex items-center font-size-0'>
          <button className='mr-1.5 w-3 h-3 bg-(--removeNote) rounded-full cursor-pointer relative before:absolute before:top-1/2 before:-translate-y-1/2 before:left-[50%] before:-translate-x-1/2 before:w-2 before:h-0.5 before:bg-black before:opacity-0 before:transition-opacity before:rotate-45 after:absolute after:top-1/2 after:-translate-y-1/2 after:left-[50%] after:-translate-x-1/2 after:w-0.5 after:h-2 after:bg-black after:opacity-0 after:transition-opacity after:rotate-45 hover:before:opacity-100 hover:after:opacity-100' />
          <button className='mr-1.5 w-3 h-3 bg-(--minimize) rounded-full cursor-pointer relative before:absolute before:top-1/2 before:-translate-y-1/2 before:left-[50%] before:-translate-x-1/2 before:w-2 before:h-0.5 before:bg-black before:opacity-0 before:transition-opacity hover:before:opacity-100' />
        </div>
        <div className='grow'>
          <input
            defaultValue='Sticker'
            disabled
            className='bg-transparent w-full px-2 font-sans text-[16px] font-bold text-white outline-none disabled:pointer-events-none disabled:text-white'
          />
        </div>
        <button type='button' className='flex cursor-pointer text-white' aria-label='Edit sticker'>
          <svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='currentColor' viewBox='0 0 16 16'>
            <path d='M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z' />
          </svg>
        </button>
      </div>

      <textarea
        className='block h-[calc(100%-34px)] w-full resize-none border-2 border-t-0 border-[rgba(70,74,84,0.34)] bg-[#1b1d1d82] p-5 backdrop-blur-[10px] focus:outline-none'
        defaultValue={content}
      />

      <button
        type='button'
        className='absolute right-0 bottom-0 h-5 w-5 cursor-nwse-resize'
        aria-label='Resize sticker'
      />

      {isDragging ? <div className='pointer-events-none absolute inset-0 ring-2 ring-white/40' /> : null}
    </div>
  );
}

export default Sticker;
