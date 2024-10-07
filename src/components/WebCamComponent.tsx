'use client';

import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';

const WebcamCapture = () => {
    const webcamRef = useRef<any>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const [audioSrc, setAudioSrc] = useState<string | null>(null);
    const [capturing, setCapturing] = useState<boolean>(false);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [deviceAccessError, setDeviceAccessError] = useState<string | null>(null);
    const [hasAudio, setHasAudio] = useState<boolean>(true);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

    // Check for media device and MediaRecorder support
    const checkDeviceSupport = () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setDeviceAccessError('Your device does not support camera or microphone access.');
            return false;
        }

        if (typeof MediaRecorder === 'undefined') {
            setDeviceAccessError('Your browser does not support media recording.');
            return false;
        }

        return true;
    };

    // Request camera and microphone access
    const requestDeviceAccess = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            // Set the webcam stream if the permission is granted
            if (webcamRef.current) {
                webcamRef.current.srcObject = stream;
            }
            setDeviceAccessError(null);
        } catch (err) {
            setDeviceAccessError('Access to the webcam or microphone is denied. Please enable them.');
        }
    };

    // Initial device check on component mount
    useEffect(() => {
        if (checkDeviceSupport()) {
            requestDeviceAccess();
        }
    }, []);

    // Capture image
    const captureImage = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImageSrc(imageSrc);
    };

    // Save image to the user's device
    const saveImage = () => {
        if (imageSrc) {
            const link = document.createElement('a');
            link.href = imageSrc;
            link.download = 'captured-image.jpg';
            link.click();
        }
    };

    // Start recording video
    const startCapture = () => {
        if (webcamRef.current && webcamRef.current.stream) {
            setCapturing(true);
            mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
                mimeType: 'video/webm',
            });
            mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable);
            mediaRecorderRef.current.start();
        } else {
            setDeviceAccessError('Unable to access the webcam stream.');
        }
    };

    // Stop recording video
    const stopCapture = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setCapturing(false);
        }
    };

    // Save recorded video chunks
    const handleDataAvailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
            setRecordedChunks((prev) => [...prev, event.data]);
        }
    };

    // Download and display the recorded video
    const saveVideo = () => {
        if (recordedChunks.length) {
            const blob = new Blob(recordedChunks, {
                type: 'video/webm',
            });
            const videoUrl = URL.createObjectURL(blob);
            setVideoSrc(videoUrl);

            // Save video to the user's device
            const link = document.createElement('a');
            link.href = videoUrl;
            link.download = 'recorded-video.webm';
            link.click();

            setRecordedChunks([]);
        }
    };

    // Start recording audio
    const startAudioCapture = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current.addEventListener('dataavailable', handleAudioDataAvailable);
            mediaRecorderRef.current.start();
            setCapturing(true);
        } catch (err) {
            setDeviceAccessError('Failed to access the microphone.');
        }
    };

    // Save recorded audio chunks
    const handleAudioDataAvailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
            const blob = new Blob([event.data], { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(blob);
            setAudioSrc(audioUrl);

            // Save audio to the user's device
            const link = document.createElement('a');
            link.href = audioUrl;
            link.download = 'recorded-audio.webm';
            link.click();
        }
    };

    // Toggle camera (front/back)
    const switchCamera = () => {
        setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl mb-4">Webcam, Audio, and Video Capture</h1>

            {/* Handle device access errors */}
            {deviceAccessError ? (
                <p className="text-red-500 mb-4">{deviceAccessError}</p>
            ) : (
                <>
                    {/* Webcam component */}
                    <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="mb-4"
                        width={400}
                        height={300}
                        videoConstraints={{
                            facingMode: facingMode,
                        }}
                        audio={hasAudio} // Enable/disable audio
                    />
                    <div className="flex space-x-4 mb-4">
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                            onClick={captureImage}
                        >
                            Capture Image
                        </button>
                        {capturing ? (
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded"
                                onClick={stopCapture}
                            >
                                Stop Recording Video
                            </button>
                        ) : (
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded"
                                onClick={startCapture}
                            >
                                Start Recording Video
                            </button>
                        )}
                        {recordedChunks.length > 0 && (
                            <button
                                className="bg-purple-500 text-white px-4 py-2 rounded"
                                onClick={saveVideo}
                            >
                                Save Video
                            </button>
                        )}
                        <button
                            className="bg-yellow-500 text-white px-4 py-2 rounded"
                            onClick={switchCamera}
                        >
                            Switch Camera
                        </button>
                    </div>

                    {/* Capture audio buttons */}
                    <div className="flex space-x-4 mb-4">
                        <button
                            className="bg-yellow-500 text-white px-4 py-2 rounded"
                            onClick={startAudioCapture}
                        >
                            Start Recording Audio
                        </button>
                    </div>

                    {/* Display the captured image */}
                    {imageSrc && (
                        <div className="mb-4">
                            <h2 className="text-xl">Captured Image:</h2>
                            <img src={imageSrc} alt="Captured" className="mt-2 border" />
                            <button
                                className="bg-purple-500 text-white px-4 py-2 rounded mt-2"
                                onClick={saveImage}
                            >
                                Save Image
                            </button>
                        </div>
                    )}

                    {/* Display the recorded video */}
                    {videoSrc && (
                        <div className="mb-4">
                            <h2 className="text-xl">Recorded Video:</h2>
                            <video src={videoSrc} controls className="mt-2 border" />
                        </div>
                    )}

                    {/* Display the recorded audio */}
                    {audioSrc && (
                        <div className="mb-4">
                            <h2 className="text-xl">Recorded Audio:</h2>
                            <audio src={audioSrc} controls className="mt-2 border" />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default WebcamCapture;