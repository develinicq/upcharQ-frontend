import React, { useMemo, useState } from 'react'
import GeneralDrawer from '@/components/GeneralDrawer/GeneralDrawer'
import { CheckCircle2, Clock, Info, AlertTriangle, XCircle } from 'lucide-react'
const tick ='/Doctor_module/settings/tick.png'

const notificationsSeed = [
  {
    type: 'new', // new vs old section label
    variant: 'success', // success/info/warning/error
    unread: true,
    text: 'All tokens for today’s session scheduled at 10:00AM - 12:00PM have been completed.',
    time: '3 min ago',
  },
  {
    type: 'new',
    variant: 'success',
    unread: true,
    text: 'Queue started. First patient is ready for consultation.',
    time: '3 min ago',
  },
  {
    type: 'new',
    variant: 'error',
    unread: true,
    text: 'You have not started the consultation yet. For the session scheduled at 10:00AM. Please ensure availability.',
    time: '3 min ago',
  },
  {
    type: 'new',
    variant: 'info',
    unread: true,
    text: 'It’s time for your session! You can now start seeing patients.',
    time: '3 min ago',
  },
  {
    type: 'new',
    variant: 'info',
    unread: true,
    text: 'Your OPD Session is Scheduled to Begin at 10:00 AM. Please ensure availability.',
    time: '3 min ago',
  },
];
const olderSeed = [
  {
    type: 'old',
    variant: 'neutral',
    unread: false,
    text: 'Your consultation with Dr. Milind Chauhan is Completed',
    time: '3 min ago',
  },
  {
    type: 'old',
    variant: 'neutral',
    unread: false,
    text: 'Your consultation with Dr. Milind Chauhan is Completed',
    time: '3 min ago',
  },
];
const variantStyles = {
    success: {
      wrap: 'bg-green-50 border-green-100',
      iconBg: 'bg-green-50 text-green-600 ring-1 ring-green-400',
      text: 'text-secondary-grey400',
    },
    info: {
      wrap: 'bg-blue-50 border-blue-100',
      iconBg: 'bg-blue-50 text-blue-600 ring-1 ring-blue-500',
      text: 'text-secondary-grey400',
    },
    warning: {
      wrap: 'bg-amber-50 border-amber-100',
      iconBg: 'bg-amber-50 text-amber-600 ring-1 ring-amber-500',
      text: 'text-secondary-grey400',
    },
    error: {
      wrap: 'bg-red-50 border-red-100',
      iconBg: 'bg-red-50 text-red-600 ring-1 ring-red-500',
      text: 'text-secondary-grey400',
    },
    neutral: {
      wrap: 'bg-secondary-grey50 border-secondary-grey100',
      iconBg: 'bg-secondary-grey50 text-secondary-grey300 ring-1 ring-secondary-grey150',
      text: 'text-secondary-grey400',
    },
}

function VariantIcon({ variant }) {
  switch (variant) {
    case 'success': return <CheckCircle2 className="w-4 h-4" />
    case 'info': return <Info className="w-4 h-4" />
    case 'warning': return <AlertTriangle className="w-4 h-4" />
    case 'error': return <XCircle className="w-4 h-4" />
    default: return <Clock className="w-4 h-4" />
  }
}

export default function NotificationDrawer({ show, onClose }) {
  const [tab, setTab] = useState('all');
  const [news, setNews] = useState(notificationsSeed);
  const [older, setOlder] = useState(olderSeed);

  const unreadCount = useMemo(() => news.filter(n => n.unread).length + older.filter(n => n.unread).length, [news, older]);

  const markAllRead = () => {
    setNews(prev => prev.map(n => ({ ...n, unread: false })));
    setOlder(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const filterItems = (arr) => tab === 'unread' ? arr.filter(n => n.unread) : arr;

  return (
    <GeneralDrawer
      isOpen={show}
      onClose={onClose}
      title="Notifications"
      showPrimaryAction={false}
      width={476}
      className=""
      headerRight={
        <div className="flex items-center gap-3 ">
          <div className='flex text-[14px] gap-1 items-center'>
              <img src={tick} className='h-4 w-4 mt-0.5' alt="" />
              <button className=" text-secondary-grey400" onClick={markAllRead}>Mark all as Read</button>
          </div>
          <img src="/Doctor_module/text_box/vertical_notification.png" alt="" className='h-5' />
          <img src="/Doctor_module/settings/noto.png" alt="" className='h-5' />
          <img src="/Doctor_module/text_box/vertical_notification.png" alt="" className='h-5' />
          
        </div>
      }
    >
      <div className="flex flex-col gap-4 ">
        {/* Tabs */}
        <div className="flex gap-2 bg-secondary-grey50 p-1 px-2 rounded-sm w-fit ">
          <button
            className={`text-sm font-medium px-[6px] py-[2px] rounded-sm ${tab==='all'?'text-blue-primary250  border-[0.5px] border-blue-primary150 bg-blue-primary50':'text-secondary-grey200'}`}
            onClick={() => setTab('all')}
          >
            All
          </button>
          <button
            className={`text-sm font-medium px-[6px] py-[2px] rounded-sm ${tab==='unread'?'text-blue-primary250  border-[0.5px] border-blue-primary150 bg-blue-primary50':'text-secondary-grey200'}`}
            onClick={() => setTab('unread')}
          >
            Unread 
          </button>
        </div>

        {/* New */}
        <div className="">
          <div className="py-1  text-sm bg-secondary-grey50 border-b-[0.5px] text-secondary-grey400 ">New</div>
          <div className="flex flex-col gap-2 mt-1">
            {filterItems(news).map((n, idx) => {
              const vs = variantStyles[n.variant] || variantStyles.neutral;
              return (
                <div key={idx} className={`flex items-center  py-2  gap-3  border-secondary-grey100`}>
                  <span
  className={`ml-1 w-9 h-9 aspect-square flex-shrink-0
    inline-flex items-center justify-center rounded-full
    ${vs.iconBg}`}
>

                    <VariantIcon variant={n.variant} />
                  </span>
                  <div className="flex justify-between w-full">
                    <div className={`text-[15px] w-4/5 leading-snug ${vs.text}`}>{n.text}</div>
                    <div className='flex flex-col justify-between'>
                       <div className="text-xs text-secondary-grey200 mt-1">{n.time}</div>
                  {n.unread && (
    <span className="self-end w-[6px] h-[6px] rounded-full bg-red-500" />
  )}
                  </div>
                   
                  </div>
                  
                  
                  
                </div>
              )
            })}
          </div>
        </div>

        {/* Older */}
        <div className="">
          <div className="py-1  text-sm bg-secondary-grey50 border-b-[0.5px] text-secondary-grey400 ">Older</div>
          <div className="flex flex-col gap-2 mt-1">
            {filterItems(older).map((n, idx) => {
              const vs = variantStyles[n.variant] || variantStyles.neutral;
              return (
                <div key={idx} className={`flex items-center gap-3 py-2 `}>
<span
  className={`w-9 h-9 ml-1 aspect-square flex-shrink-0
    inline-flex items-center justify-center rounded-full
    ${vs.iconBg}`}
>
                    <VariantIcon variant={n.variant} />
                  </span>
                   <div className="flex justify-between w-full">
                    <div className={`text-[15px] w-4/5 leading-snug ${vs.text}`}>{n.text}</div>
                    <div className='flex flex-col justify-between'>
                       <div className="text-xs text-secondary-grey200 mt-1">{n.time}</div>
                  {n.unread && (
    <span className="self-end w-[6px] h-[6px] rounded-full bg-red-500" />
  )}
                  </div>
                   
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </GeneralDrawer>
  )
}
