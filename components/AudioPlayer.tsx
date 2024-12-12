'use client'

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, ChevronUp, ChevronDown } from 'lucide-react';

interface Song {
  title: string;
  url: string;
}

interface AudioPlayerProps {
  playlist: Song[];
}

export function AudioPlayer({ playlist }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleNext = useCallback(() => {
    setCurrentSongIndex((prevIndex) => 
      prevIndex === playlist.length - 1 ? 0 : prevIndex + 1
    );
    setIsPlaying(true);
  }, [playlist.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
  
    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    }
  
    const setAudioTime = () => setCurrentTime(audio.currentTime);
  
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleNext);
  
    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleNext);
    }
  }, [handleNext]); // 添加 handleNext 到依赖项

  const togglePlay = () => {
    if (audioRef.current?.paused) {
      audioRef.current.play();
    } else {
      audioRef.current?.pause();
    }
    setIsPlaying(!isPlaying);
  }

  const handlePrevious = useCallback(() => {
    setCurrentSongIndex((prevIndex) => 
      prevIndex === 0 ? playlist.length - 1 : prevIndex - 1
    );
    setIsPlaying(true);
  }, [playlist.length]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = playlist[currentSongIndex].url;
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentSongIndex, playlist, isPlaying]); // 添加 isPlaying 到依赖项

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return (
    <div className={`fixed bottom-4 left-4 z-20 bg-white/10 backdrop-blur-md rounded-lg shadow-lg transition-all duration-300 hover:bg-white/20 ${isExpanded ? 'w-72 p-4' : 'w-12 h-12'}`}>
      {isExpanded ? (
        <>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Volume2 size={20} className="text-white" />
              <h3 className="text-white font-semibold truncate">{playlist[currentSongIndex].title}</h3>
            </div>
            <button onClick={() => setIsExpanded(false)} className="text-white hover:text-gray-300 transition-colors">
              <ChevronDown size={20} />
            </button>
          </div>
          <audio ref={audioRef} src={playlist[currentSongIndex].url} />
          <div className="flex items-center justify-between space-x-4 mb-2">
            <button onClick={handlePrevious} className="text-white hover:text-gray-300 transition-colors">
              <SkipBack size={24} />
            </button>
            <button onClick={togglePlay} className="text-white hover:text-gray-300 transition-colors bg-white/20 rounded-full p-2">
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </button>
            <button onClick={handleNext} className="text-white hover:text-gray-300 transition-colors">
              <SkipForward size={24} />
            </button>
          </div>
          <div className="flex justify-between text-white text-xs mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={(e) => {
              const audio = audioRef.current;
              if (audio) {
                audio.currentTime = Number(e.target.value);
                setCurrentTime(audio.currentTime);
              }
            }}
            className="w-full accent-white"
          />
        </>
      ) : (
        <button onClick={() => setIsExpanded(true)} className="w-full h-full flex items-center justify-center text-white hover:text-gray-300 transition-colors">
          <ChevronUp size={20} />
        </button>
      )}
    </div>
  );
}