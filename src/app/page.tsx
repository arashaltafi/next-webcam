import WebcamCapture from '@/components/WebCamComponent';
import React from 'react'

export default function Home() {
  return (
    <div className='w-full min-h-screen flex flex-col items-center justify-start gap-16 p-8'>
      <h1 className='text-5xl'>Webcam</h1>

      <WebcamCapture />
    </div>
  );
}
