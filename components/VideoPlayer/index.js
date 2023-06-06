import React, { useEffect, useMemo, useState } from "react";
import s from './VideoPlayer.module.scss';
import useVideo from "@/hooks/useVideo";
import { ChevronLeftRounded, ChevronRightRounded, Forward5Rounded, FullscreenExitRounded, FullscreenRounded, PauseRounded, PlayArrowRounded } from "@mui/icons-material";
import SubtitlePlayer from "../SubtitlePlayer";
import SubtitleManager from "@/utility/SubtitleManager";
import { getReadableTime } from "@/utility/videoFunctions";
import { useRef } from "react";
import { LinesAssistant } from "../LinesAssistant";

const VideoPlayer = ({ src, subtitles, videoTagRef }) => {
  const { videoClock, isPlay, isFullscreen, togglePlay, toggleFullScreenMode, skipForwardFive, videoRef, videoContainerRef } = useVideo();

  const [currentSubtitles, setCurrentSubtitles] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoLength, setVideoLength] = useState(0);
  const [mouseIsDown, setMouseIsDown] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const wasPaused = useRef(true);
  const subtitleManager = useMemo(() => new SubtitleManager(subtitles), [subtitles, SubtitleManager]);

  const timeUpdateHandler = (e) => {
    setCurrentTime(e.target.currentTime);
  }

  const durationChangeHandler = (e) => {
    if (!e.target.duration) {
      setVideoLength(0);
    }
    setVideoLength(e.target.duration);
  }

  const changeTimeFromMousePosition = (e) => {
    if (!videoRef.current.src || !videoClock) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const fullWidth = e.currentTarget.clientWidth;
    const mouseWidth = Math.max(Math.min(e.pageX - rect.x, e.currentTarget.clientWidth), 0);
    const ratio = mouseWidth / fullWidth;
    videoRef.current.currentTime = ratio * videoLength;
    videoClock.setTime(videoRef.current.currentTime * 1000);
  }

  const mouseMoveHandler = (e) => {
    if (!mouseIsDown) return;

    e.preventDefault();
    changeTimeFromMousePosition(e);
  }

  const mouseDownHandler = (e) => {
    wasPaused.current = videoRef.current.paused;
    videoRef.current.pause();
    changeTimeFromMousePosition(e);
    setMouseIsDown(true);
  }

  const mouseUpHandler = () => {
    if (!wasPaused.current) {
      videoRef.current.play();
    }
    setMouseIsDown(false);
  }

  useEffect(() => {
    let interval;

    if (videoClock) {
      interval = setInterval(() => {
        const subtitlesAtTime = subtitleManager.findSubtitleAt(videoClock.getTime());
        setCurrentSubtitles(subtitlesAtTime);
      }, 100)
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [subtitleManager, setCurrentSubtitles, videoClock])

  // TODO: Change how we manage the width of the 'currentTimeLine' as it does not keep up with dragging and stuff very well
  return (
    <div className={s.mainSection} ref={videoContainerRef}>
      <div className={s.outerWrapper}>
        <div className={s.videoContainer}>
          <video className={s.video} ref={(el) => { videoTagRef.current = el; videoRef.current = el; }} src={src} onTimeUpdate={timeUpdateHandler} onDurationChange={durationChangeHandler} >
          </video>
          {/* controls */}
          <SubtitlePlayer subtitles={currentSubtitles} />
        </div >
        <div className={s.controlsOuterContainer} onMouseEnter={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)}>
          {showControls &&
            <div className={s.controlsInnerContainer}>
              <div className={s.sidebarTab} onClick={() => setShowAssistant(!showAssistant)}>{showAssistant ? <ChevronRightRounded fontSize="medium" /> : <ChevronLeftRounded />}</div>
              <div className={s.timeControls}>
                <div className={s.textTime}>{getReadableTime(currentTime)}</div>
                <div className={s.timeLineContainer}>
                  <div className={s.timeLine} onMouseMove={mouseMoveHandler} onMouseUp={mouseUpHandler} onMouseDown={mouseDownHandler}><div className={s.currentTimeLine} style={{ width: `${Math.min(Math.max((currentTime / videoLength) * 100, 0), 100)}%` }}></div></div>
                </div>
                <div className={s.textTime}>{getReadableTime(videoLength)}</div>
              </div>
              <div className={s.buttonControls}>
                <button className={s.playPauseBtn} onClick={togglePlay}>{isPlay ? <PauseRounded fontSize="large" /> : <PlayArrowRounded fontSize="large" />}</button>
                <button className={s.forwardFiveBtn} onClick={skipForwardFive}>{isPlay ? <Forward5Rounded fontSize="large" /> : <Forward5Rounded fontSize="large" />}</button>
                <button className={s.fullscreenBtn} onClick={toggleFullScreenMode}>{isFullscreen ? <FullscreenExitRounded fontSize="large" /> : <FullscreenRounded fontSize="large" />}</button>
              </div>
            </div>
          }
        </div>
      </div>
      <LinesAssistant lines={subtitles} currentLines={currentSubtitles} shown={showAssistant} />
    </div>
  )
}

export default VideoPlayer;
