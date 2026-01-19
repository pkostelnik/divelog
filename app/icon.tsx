import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)',
          borderRadius: '8px',
        }}
      >
        {/* Diver head */}
        <div
          style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            background: 'white',
            borderRadius: '50%',
            top: '6px',
            left: '12px',
          }}
        />
        {/* Diver body */}
        <div
          style={{
            position: 'absolute',
            width: '12px',
            height: '14px',
            background: 'white',
            borderRadius: '2px',
            top: '12px',
            left: '10px',
          }}
        />
        {/* Air bubble 1 */}
        <div
          style={{
            position: 'absolute',
            width: '3px',
            height: '3px',
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '50%',
            top: '8px',
            left: '6px',
          }}
        />
        {/* Air bubble 2 */}
        <div
          style={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '50%',
            top: '12px',
            left: '24px',
          }}
        />
        {/* Air bubble 3 */}
        <div
          style={{
            position: 'absolute',
            width: '2.5px',
            height: '2.5px',
            background: 'rgba(255, 255, 255, 0.65)',
            borderRadius: '50%',
            top: '20px',
            left: '5px',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
