import React, { useState, useEffect, useRef } from "react";
import { 
  Timer,
  Bell,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX
} from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

// Define the preset time options in minutes
const PRESET_TIMES = [1, 3, 5, 10, 15, 30];

// Sound effects URLs - using SVG files with embedded audio
const SOUND_EFFECTS = {
  timerEnd: "/sounds/timer-end.svg",
  timerTick: "/sounds/timer-tick.svg",
  buttonClick: "/sounds/button-click.svg"
};

export function CookingTimer() {
  const [timeInSeconds, setTimeInSeconds] = useState<number>(300); // 5 minutes default
  const [remainingSeconds, setRemainingSeconds] = useState<number>(timeInSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  
  // Audio refs
  const endSoundRef = useRef<HTMLAudioElement | null>(null);
  const tickSoundRef = useRef<HTMLAudioElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load audio elements when component mounts
  useEffect(() => {
    endSoundRef.current = new Audio(SOUND_EFFECTS.timerEnd);
    tickSoundRef.current = new Audio(SOUND_EFFECTS.timerTick);
    clickSoundRef.current = new Audio(SOUND_EFFECTS.buttonClick);
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Start the timer
  const startTimer = () => {
    if (!isRunning && remainingSeconds > 0) {
      playSound(clickSoundRef);
      setIsRunning(true);
      
      timerRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            setIsRunning(false);
            playSound(endSoundRef);
            return 0;
          }
          
          // Play tick sound for last 10 seconds
          if (prev <= 11 && prev > 1) {
            playSound(tickSoundRef);
          }
          
          return prev - 1;
        });
      }, 1000);
    }
  };
  
  // Pause the timer
  const pauseTimer = () => {
    playSound(clickSoundRef);
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
  
  // Reset the timer
  const resetTimer = () => {
    playSound(clickSoundRef);
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setRemainingSeconds(timeInSeconds);
  };
  
  // Set a preset time
  const setPresetTime = (minutes: number) => {
    playSound(clickSoundRef);
    const newTimeInSeconds = minutes * 60;
    setTimeInSeconds(newTimeInSeconds);
    setRemainingSeconds(newTimeInSeconds);
    
    // Stop the timer if it's running
    if (isRunning) {
      pauseTimer();
    }
  };
  
  // Toggle mute state
  const toggleMute = () => {
    playSound(clickSoundRef);
    setIsMuted(!isMuted);
  };
  
  // Helper to format time as MM:SS
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Helper to play sound if not muted
  const playSound = (soundRef: React.RefObject<HTMLAudioElement>) => {
    if (!isMuted && soundRef.current) {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch(error => {
        console.error("Error playing sound:", error);
      });
    }
  };
  
  // Calculate progress percentage for visual indicator
  const progressPercentage = 
    timeInSeconds > 0 ? (remainingSeconds / timeInSeconds) * 100 : 0;
  
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          className="fixed bottom-16 right-4 rounded-full p-3 shadow-lg bg-secondary hover:bg-secondary-dark hover:scale-110 transition-all duration-300 animate-bounce"
          onClick={() => playSound(clickSoundRef)}
        >
          <span className="flex items-center gap-1">
            <Timer className="h-6 w-6" />
            <span className="text-xl">⏱️</span>
          </span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-primary/5 border-2 border-primary/30">
        <DialogHeader className="pb-2 border-b border-primary/20">
          <DialogTitle className="text-xl text-center flex items-center justify-center gap-2">
            <span className="text-2xl">⏰</span> مؤقت المطبخ <span className="text-2xl">⏰</span>
          </DialogTitle>
          <DialogDescription className="text-center">
            ظبط الوقت عشان ماتحرقش الأكل يا حلو 👨‍🍳
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center gap-6 py-4">
          {/* Timer Display */}
          <div className="relative flex items-center justify-center w-36 h-36 rounded-full border-4 border-primary shadow-lg">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(var(--primary) ${progressPercentage}%, transparent ${progressPercentage}%)`,
                opacity: 0.3
              }}
            />
            <div className="absolute inset-1 rounded-full bg-white/80 flex items-center justify-center">
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                {formatTime(remainingSeconds)}
              </div>
            </div>
          </div>
          
          {/* Timer Controls */}
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={resetTimer} 
              title="ابدأ من جديد"
              className="bg-white hover:bg-gray-100 hover:scale-110 transition-all duration-300 shadow-sm"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
            
            {isRunning ? (
              <Button 
                variant="default" 
                size="icon" 
                onClick={pauseTimer} 
                title="وقف شوية"
                className="bg-secondary text-white hover:bg-secondary-dark hover:scale-110 transition-all duration-300 shadow-md"
              >
                <Pause className="h-5 w-5" />
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="icon" 
                onClick={startTimer} 
                disabled={remainingSeconds === 0} 
                title="يلا نبدأ"
                className="bg-primary text-white hover:bg-primary-dark hover:scale-110 transition-all duration-300 shadow-md"
              >
                <Play className="h-5 w-5" />
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleMute} 
              title={isMuted ? "شغل الصوت" : "اقفل الصوت"}
              className="bg-white hover:bg-gray-100 hover:scale-110 transition-all duration-300 shadow-sm"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </div>
          
          {/* Preset Times */}
          <div className="w-full">
            <h3 className="text-center mb-3 font-medium flex items-center justify-center gap-2">
              <span className="text-lg">⚡</span> أوقات على السريع <span className="text-lg">⚡</span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_TIMES.map(minutes => (
                <Button
                  key={minutes}
                  variant="outline"
                  size="sm"
                  onClick={() => setPresetTime(minutes)}
                  className="border border-primary/30 bg-white hover:bg-primary hover:text-white transition-all duration-300 hover:shadow-md"
                >
                  {minutes} {minutes === 1 ? "دقيقة" : "دقايق"}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CookingTimer;