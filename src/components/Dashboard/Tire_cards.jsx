
import React from 'react'

const Tire_cards = () => {
  return (
    <div className='w-[278px] h-[60px] flex-1 flex items-center gap-2'>

        <div className='w-[60px] h-[60px] bg-[#2372EC] opacity-10 rounded-md'></div>

        <div className='flex flex-col items-start text-left'>
            <span className='text-[#8E8E8E] text-sm font-normal leading-6 '>Tire 1</span>
            <span className='text-[#2372EC] text-2xl font-medium flex items-center gap-[1px]'>4000 <span className='text-base font-normal text-black'>users</span></span>
        </div>
      

    </div>
  )
}

export default Tire_cards

