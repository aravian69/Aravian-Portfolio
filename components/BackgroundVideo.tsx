'use client';

export default function BackgroundVideo() {
  return (
    <>
      <div id="bgBase" />
      <video
        id="bgVideoDark"
        autoPlay
        loop
        muted
        playsInline
        preload="none"
      >
        <source
          src="https://res.cloudinary.com/dnnkz3rzd/video/upload/q_auto/v1777966746/dark_pl0y8i.mp4"
          type="video/mp4"
        />
      </video>
      <video
        id="bgVideoLight"
        autoPlay
        loop
        muted
        playsInline
        preload="none"
      >
        <source
          src="https://res.cloudinary.com/dnnkz3rzd/video/upload/q_auto/v1777966748/light_wpavv5.mp4"
          type="video/mp4"
        />
      </video>
      <div id="bgWash" />
      <div id="grain" aria-hidden="true" />
    </>
  );
}
